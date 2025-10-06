import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cityName, airQuality, quantumForecast, scenario } = await req.json();

    console.log('Analyzing impact for:', { cityName, scenario });

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    // Build a comprehensive data summary for the AI
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

    const systemPrompt = `You are an environmental data analyst providing clear, data-driven air quality impact summaries. 

CRITICAL RULES:
1. Base ALL analysis ONLY on the provided measurements and data
2. DO NOT give extreme advice like "wear a mask" or "cancel all outdoor events"
3. Provide balanced, measured recommendations based on actual AQI levels
4. Use WHO and EPA air quality standards as reference points
5. Focus on factual analysis of the current situation and realistic trends
6. Be informative but not alarmist

AQI Reference Scale:
- 0-50: Good (Green) - Air quality is satisfactory
- 51-100: Moderate (Yellow) - Acceptable for most, but sensitive groups should limit prolonged outdoor exertion
- 101-150: Unhealthy for Sensitive Groups (Orange) - Sensitive individuals may experience health effects
- 151-200: Unhealthy (Red) - Everyone may begin to experience health effects
- 201-300: Very Unhealthy (Purple) - Health alert, everyone may experience more serious health effects
- 301+: Hazardous (Maroon) - Health warning of emergency conditions

Format your response in clear sections with headers.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://earthdata.lovable.app',
        'X-Title': 'Earth Data Visualization'
      },
      body: JSON.stringify({
        model: 'x-ai/grok-2-1212',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Analyze the air quality impact for this location and provide a comprehensive but balanced summary. Include:
1. Current Air Quality Assessment (based on actual measurements)
2. Health Impact Analysis (factual, based on AQI levels)
3. Pollutant Breakdown (what the numbers mean)
4. Trend Analysis (if quantum forecast available)
5. Practical Recommendations (measured, not extreme)

Data:
${dataContext}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content;

    if (!analysis) {
      throw new Error('No analysis generated');
    }

    console.log('Analysis generated successfully');

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-impact:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
