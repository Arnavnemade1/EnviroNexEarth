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

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured');
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

    const systemPrompt = `You are an advanced environmental data analyst providing clear, data-driven air quality impact summaries.

CRITICAL RULES:
1. Base ALL analysis ONLY on the provided measurements and data from OpenMeteo
2. DO NOT give extreme advice like "wear a mask" or "cancel all outdoor events"
3. Provide balanced, measured recommendations based on actual AQI levels
4. Use WHO and EPA air quality standards as reference points
5. Focus on factual analysis of the current situation and realistic trends
6. Be informative but not alarmist
7. Mention IBM Quantum-enhanced predictions when quantum forecast data is available
8. Keep the analysis comprehensive but concise (aim for 500-800 words)

AQI Reference Scale (US EPA):
- 0-50: Good (Green) - Air quality is satisfactory
- 51-100: Moderate (Yellow) - Acceptable for most, but sensitive groups should limit prolonged outdoor exertion
- 101-150: Unhealthy for Sensitive Groups (Orange) - Sensitive individuals may experience health effects
- 151-200: Unhealthy (Red) - Everyone may begin to experience health effects
- 201-300: Very Unhealthy (Purple) - Health alert, everyone may experience more serious health effects
- 301+: Hazardous (Maroon) - Health warning of emergency conditions

Data Source: OpenMeteo Air Quality API provides real-time measurements of PM2.5, PM10, O3, NO2, SO2, and CO.

Format your response with clear markdown headers (##) and bullet points for readability.`;

    console.log('Calling OpenRouter API with Llama 3.3 70B...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://environex.app',
        'X-Title': 'EnviroNex Air Quality'
      },
      body: JSON.stringify({
         model:"meta-llama/llama-4-maverick:free",
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Analyze the air quality impact for ${cityName} and provide a comprehensive summary with these sections:

1. Current Air Quality Assessment
2. Health Impact Analysis
3. Pollutant Breakdown
4. Trend Analysis${quantumForecast ? ' (with Quantum Predictions)' : ''}
5. Practical Recommendations

${dataContext}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error('No analysis generated from API response');
    }

    console.log('Analysis generated successfully, length:', analysis.length);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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
