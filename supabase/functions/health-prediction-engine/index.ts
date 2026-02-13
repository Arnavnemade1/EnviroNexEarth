import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthProfile {
    age: number;
    hasAsthma: boolean;
    hasHeartCondition: boolean;
    hasLungCondition: boolean;
    activityLevel: 'low' | 'moderate' | 'high';
    smokingStatus: 'never' | 'former' | 'current';
}

interface ClimateData {
    cityName: string;
    lat: number;
    lon: number;
    airQuality: {
        aqi: number;
        pm25: number;
        pm10: number;
        o3: number;
        no2: number;
        so2: number;
        co: number;
    };
    weather: {
        temperature: number;
        humidity: number;
        windSpeed: number;
        precipitation: number;
    };
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { climateData, healthProfile }: { climateData: ClimateData, healthProfile: HealthProfile } = await req.json();
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

        if (!LOVABLE_API_KEY) {
            throw new Error('LOVABLE_API_KEY (Gemini API) not configured');
        }

        const systemPrompt = `You are the AuraEarth Neural Health Engine. You analyze environmental data and personal health profiles to predict hyper-local epidemiological risks.
    
Return ONLY valid JSON.

Your analysis model includes:
1. Dose-Response Modeling: Calculating Relative Risk (RR) for cardiovascular and respiratory outcomes based on PM2.5 (${climateData.airQuality.pm25} µg/m³), O3 (${climateData.airQuality.o3} ppb), and NO2 (${climateData.airQuality.no2} ppb).
2. Vulnerability Scaling: Adjusting risks for age (${healthProfile.age}), pre-existing conditions (Asthma: ${healthProfile.hasAsthma}, Heart: ${healthProfile.hasHeartCondition}), and activity level (${healthProfile.activityLevel}).
3. Synergistic Effects: Analyzing how temperature (${climateData.weather.temperature}°C) and humidity (${climateData.weather.humidity}%) exacerbate pollutant toxicity.

JSON Schema:
{
  "overallRisk": "very-low|low|moderate|high|very-high",
  "riskScore": 0-100,
  "metrics": {
    "aggregateRiskIncrease": number,
    "cardiovascularRisk": { "label": "string", "increase": number, "color": "emerald|amber|rose" },
    "respiratoryRisk": { "label": "string", "increase": number, "color": "emerald|amber|rose" },
    "neurologicalRisk": { "label": "string", "increase": number, "color": "emerald|amber|rose" }
  },
  "recommendations": ["string"],
  "activityWindows": [
    { "hour": number, "label": "HH:MM", "status": "optimal|limited|danger", "riskScore": number, "riskIncreaseSteps": number }
  ]
}

Generate exactly 12 hourly entries in activityWindows starting from current hour.`;

        const userPrompt = `Location: ${climateData.cityName}
Environmental Data: AQI ${climateData.airQuality.aqi}, PM2.5 ${climateData.airQuality.pm25}, NO2 ${climateData.airQuality.no2}, O3 ${climateData.airQuality.o3}, Temp ${climateData.weather.temperature}°C
Health Profile: Age ${healthProfile.age}, Asthma ${healthProfile.hasAsthma}, Heart Disease ${healthProfile.hasHeartCondition}, Activity ${healthProfile.activityLevel}.`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3
            }),
        });

        const data = await response.json();
        let content = data.choices[0].message.content;
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        return new Response(content, {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
