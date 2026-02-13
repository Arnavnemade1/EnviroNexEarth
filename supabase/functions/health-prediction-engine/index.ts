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
        const payload = await req.json();
        const { climateData, healthProfile }: { climateData: ClimateData, healthProfile: HealthProfile } = payload;
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

        let data;

        if (!LOVABLE_API_KEY) {
            console.warn('LOVABLE_API_KEY not found, using algorithmic fallback');
            data = generateMockHealthAnalysis(climateData, healthProfile);
        } else {
            try {
                const systemPrompt = "You are the AuraEarth Neural Health Engine. Analyze environmental data and personal health profiles to predict hyper-local epidemiological risks.\n\nReturn ONLY valid JSON.";
                const userPrompt = "Location: " + climateData.cityName + "\nEnvironmental Data: AQI " + climateData.airQuality.aqi + ", PM2.5 " + climateData.airQuality.pm25 + "\nHealth Profile: Age " + healthProfile.age + ", Asthma " + healthProfile.hasAsthma;

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

                if (!response.ok) throw new Error('AI Gateway Error');

                const aiData = await response.json();
                let content = aiData.choices[0].message.content;
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                data = JSON.parse(content);
            } catch (e) {
                console.error('AI call failed, falling back:', e.message);
                data = generateMockHealthAnalysis(climateData, healthProfile);
            }
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

function generateMockHealthAnalysis(climateData: ClimateData, healthProfile: HealthProfile) {
    const aqi = climateData.airQuality.aqi;
    const pm25 = climateData.airQuality.pm25;

    let riskScore = Math.min(100, (aqi / 3) + (healthProfile.hasAsthma ? 20 : 0));
    let overallRisk = riskScore > 70 ? "high" : riskScore > 40 ? "moderate" : "low";

    return {
        overallRisk: overallRisk,
        riskScore: Math.round(riskScore),
        metrics: {
            aggregateRiskIncrease: Math.round((riskScore / 100) * 45),
            cardiovascularRisk: { label: "Cardiovascular", increase: Math.round(riskScore * 0.4), color: riskScore > 60 ? "rose" : "amber" },
            respiratoryRisk: { label: "Respiratory", increase: Math.round(riskScore * 0.6), color: riskScore > 60 ? "rose" : "amber" },
            neurologicalRisk: { label: "Neurological", increase: Math.round(riskScore * 0.2), color: "emerald" }
        },
        recommendations: [
            "Limit high-intensity outdoor activities during peak heat.",
            healthProfile.hasAsthma ? "Ensure rescue inhaler is available at all times." : "Monitor air quality before prolonged outdoor exposure.",
            "Increase indoor air filtration if AQI exceeds 100."
        ],
        activityWindows: Array.from({ length: 12 }, (_, i) => ({
            hour: (new Date().getHours() + i) % 24,
            label: `${((new Date().getHours() + i) % 24).toString().padStart(2, '0')}:00`,
            status: aqi > 100 ? "limited" : "optimal",
            riskScore: Math.round(riskScore + Math.sin(i * 0.5) * 10),
            riskIncreaseSteps: Math.round(riskScore * 0.5)
        }))
    };
}
