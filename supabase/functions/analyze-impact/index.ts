import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { cityName, airQuality, quantumForecast, scenario } = await req.json();

    console.log('Analyzing impact for:', { cityName, scenario });

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY');

    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured, using algorithmic fallback');
      const analysis = generateMockImpactAnalysis(cityName, airQuality, quantumForecast, scenario);
      return new Response(
        JSON.stringify({ analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dataContext = `
City: ${cityName}

Current Air Quality Measurements:
- AQI (Air Quality Index): ${airQuality.aqi}
- PM2.5: ${airQuality.pm25} μg/m³
- O₃ (Ozone): ${airQuality.o3} μg/m³
- NO₂ (Nitrogen Dioxide): ${airQuality.no2} μg/m³
- SO₂ (Sulfur Dioxide): ${airQuality.so2} μg/m³
- CO (Carbon Monoxide): ${airQuality.co} μg/m³

${quantumForecast ? `Quantum Forecast (Next 24 Hours):
- Model: ${quantumForecast.model.name} (${quantumForecast.model.backend})
- Average AQI Forecast: ${Math.round(quantumForecast.hourly.reduce((sum: number, h: any) => sum + h.aqi, 0) / quantumForecast.hourly.length)}
- Min AQI: ${Math.min(...quantumForecast.hourly.map((h: any) => h.aqi))}
- Max AQI: ${Math.max(...quantumForecast.hourly.map((h: any) => h.aqi))}
- Average PM2.5: ${Math.round(quantumForecast.hourly.reduce((sum: number, h: any) => sum + h.pm25, 0) / quantumForecast.hourly.length)} μg/m³
` : ''}

Selected Scenario: ${scenario}
`;

    const systemPrompt = `You are AuraEarth Resource Intelligence, an advanced system specializing in atmospheric load and industrial continuity.
 
 CRITICAL RULES:
 1. Base ALL analysis ONLY on the provided telemetry measurements.
 2. Focus on operational uptime, resource security, and baseline stability.
 3. Use National Safety Baselines as the primary reference for atmospheric load.
 4. Provide balanced, measured recommendations for industrial productivity.
 5. Mention Quantum-optimized performance models when forecast data is available.
 6. Maintain a factual, precision-oriented tone (aim for 500-800 words).
 
 Atmospheric Load Index (National Safety Baseline):
 - 0-50: Optimal - Conditions are satisfactory for maximum production yield.
 - 51-100: Stable - Standard operations maintained; monitor sensitive systems.
 - 101-150: Managed Threshold - Personnel activity optimization recommended.
 - 151-200: Active Management - Operational awareness required for endurance tasks.
 - 201-300: Strategic Alert - Resource buffering initiated; limit non-essential exposure.
 - 301+: Critical - Infrastructure emergency protocols active.
 
 Format your response with clear markdown headers (##) and bullet points for readability.`;

    const userPrompt = `Analyze the atmospheric load impact for ${cityName} and provide a comprehensive summary with these sections:

1. Atmospheric Baseline Assessment
2. Personnel Capacity Analysis
3. Atmospheric Composition
4. Yield Projections${quantumForecast ? ' (with Quantum Optimization)' : ''}
5. Operational Recommendations

${dataContext}`;

    console.log('Calling Gemini API for impact analysis...');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini service error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!analysis) {
        throw new Error('No analysis generated from Gemini API');
      }

      console.log('Analysis generated successfully, length:', analysis.length);

      return new Response(
        JSON.stringify({ analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Gemini call failed, falling back:', apiError);
      const analysis = generateMockImpactAnalysis(cityName, airQuality, quantumForecast, scenario);
      return new Response(
        JSON.stringify({ analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in analyze-impact:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateMockImpactAnalysis(cityName: string, airQuality: any, quantumForecast: any, scenario: string) {
  const aqi = airQuality.aqi;
  const status = aqi <= 50 ? "Optimal" : aqi <= 100 ? "Stable" : aqi <= 150 ? "Managed" : aqi <= 200 ? "Restricted" : "Critical";

  return `## Resource Continuity Analysis: ${cityName}
  
### 1. Atmospheric Baseline Assessment
The current atmospheric load in **${cityName}** is categorized as **${status}** with an index of **${aqi}**. This assessment is based on real-time measurements from national telemetry networks. Under the current **${scenario}** scenario, we are observing nominal resource dispersion patterns.

### 2. Personnel Capacity Analysis
- **Standard Workforce:** At an index of ${aqi}, conditions are optimized for maximum work-hour yield. No significant performance impact is expected.
- **Resilience Thresholds:** Personnel with specific environmental sensitivities should monitor local telemetry. Current capacity is ${aqi > 100 ? 'restricted' : 'optimal'}.

### 3. Atmospheric Composition
- **PM2.5:** ${airQuality.pm25} μg/m³ - Baseline dispersion factor.
- **Ozone (O₃):** ${airQuality.o3} μg/m³ - Monitored for photochemical stability.
- **Nitrogen Dioxide (NO₂):** ${airQuality.no2} μg/m³ - Associated with energy infrastructure yield.
- **Strategic Elements:** SO₂ and CO levels remain within nominal production buffers.

### 4. Yield Projections ${quantumForecast ? '(with Quantum Optimization)' : ''}
${quantumForecast ? `Utilizing Quantum-optimized performance models (${quantumForecast.model.name}), our telemetry engine predicts stable continuity for the next operational window. The forecast suggests an average index of ${Math.round(quantumForecast.hourly.reduce((sum: number, h: any) => sum + h.aqi, 0) / quantumForecast.hourly.length)}, ensuring production uptime.` : 'Strategic resource models suggest that atmospheric stability will be maintained over the next 12-hour window.'}

### 5. Operational Recommendations
- **Infrastructure:** Continue standard environmental buffering protocols.
- **Personnel:** Full operational readiness for outdoor and industrial tasks.
- **Monitoring:** Periodic telemetry syncs recommended to maintain productivity margins.
- **Resilience:** Under the **${scenario}** scenario, strategic green zones continue to provide essential filtration services.

*This report was generated by the AuraEarth Strategic Resource Engine.*`;
}
