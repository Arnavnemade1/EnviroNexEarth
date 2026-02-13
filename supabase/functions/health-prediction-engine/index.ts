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

interface HealthAnalysisResponse {
    overallRisk: string;
    riskScore: number;
    metrics: {
        aggregateRiskIncrease: number;
        cardiovascularRisk: { label: string; increase: number; color: 'rose' | 'amber' | 'emerald' };
        respiratoryRisk: { label: string; increase: number; color: 'rose' | 'amber' | 'emerald' };
        neurologicalRisk: { label: string; increase: number; color: 'rose' | 'amber' | 'emerald' };
    };
    pollutantBreakdown: Array<{ name: string; impact: number; color: string }>;
    recommendations: string[];
    activityWindows: Array<{
        hour: number;
        label: string;
        status: 'optimal' | 'guarded' | 'limited' | 'prohibited';
        riskScore: number;
        riskIncreaseSteps: number;
    }>;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        const { climateData, healthProfile }: { climateData: ClimateData, healthProfile: HealthProfile } = payload;
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

        let data: HealthAnalysisResponse;

        if (!LOVABLE_API_KEY) {
            console.warn('LOVABLE_API_KEY not found, using algorithmic fallback');
            data = generateMockHealthAnalysis(climateData, healthProfile);
        } else {
            try {
                const systemPrompt = `You are the AuraEarth Neural Health Engine. Analyze environmental data and personal health profiles.
                Return ONLY valid JSON with this schema:
                {
                  "overallRisk": "low"|"moderate"|"high"|"extreme",
                  "riskScore": number (0-100),
                  "metrics": {
                    "aggregateRiskIncrease": number (percentage),
                    "cardiovascularRisk": { "label": "Cardiovascular", "increase": number, "color": "rose"|"amber"|"emerald" },
                    "respiratoryRisk": { "label": "Respiratory", "increase": number, "color": "rose"|"amber"|"emerald" },
                    "neurologicalRisk": { "label": "Neurological", "increase": number, "color": "rose"|"amber"|"emerald" }
                  },
                  "pollutantBreakdown": [ { "name": "PM2.5"|"O3"|"NO2"|"SO2"|"CO", "impact": number (0-100 percentage contribution), "color": string } ],
                  "recommendations": [ string (maximum 3, realistic, non-obvious) ],
                  "activityWindows": [ { "hour": number, "label": "HH:00", "status": "optimal"|"guarded"|"limited"|"prohibited", "riskScore": number, "riskIncreaseSteps": number } ]
                }
                CRITICAL: Recommendations MUST be realistic. Do NOT suggest masks unless PM2.5 > 50 or AQI > 100. Do NOT suggest staying indoors unless AQI > 150.`;

                const userPrompt = `Location: ${climateData.cityName}
                AQI: ${climateData.airQuality.aqi}
                PM2.5: ${climateData.airQuality.pm25}
                O3: ${climateData.airQuality.o3}
                Profile: Age ${healthProfile.age}, Asthma: ${healthProfile.hasAsthma}, Heart: ${healthProfile.hasHeartCondition}`;

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
                        temperature: 0.2
                    }),
                });

                if (!response.ok) throw new Error('AI Gateway Error');

                const aiData = await response.json();
                let content = aiData.choices[0].message.content;
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                data = JSON.parse(content);
            } catch (e) {
                console.error('AI call failed, falling back:', (e as Error).message);
                data = generateMockHealthAnalysis(climateData, healthProfile);
            }
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

function generateMockHealthAnalysis(climateData: ClimateData, healthProfile: HealthProfile): HealthAnalysisResponse {
    const aq = climateData.airQuality;
    const aqi = aq.aqi;

    // Weighted risk calculation
    let baseRisk = (aqi / 2) + (healthProfile.hasAsthma ? 15 : 0) + (healthProfile.hasHeartCondition ? 20 : 0);
    const riskScore = Math.min(100, Math.round(baseRisk));
    const overallRisk = riskScore > 80 ? "extreme" : riskScore > 60 ? "high" : riskScore > 30 ? "moderate" : "low";

    // Realistic recommendations
    const recommendations: string[] = [];
    if (aqi > 150) {
        recommendations.push("Sensitive groups should remain indoors with HEPA filtration.");
        recommendations.push("Mandatory N95 usage for essential outdoor activities.");
    } else if (aqi > 100) {
        recommendations.push("Limit strenuous outdoor exercise to reduce deep lung penetration.");
        if (healthProfile.hasAsthma) recommendations.push("Carry rescue medication even for short outdoor durations.");
    } else if (aqi > 50) {
        recommendations.push("Monitor for mild respiratory irritation during high-intensity cardio.");
        recommendations.push("Optimal time for outdoor activity is before peak traffic or after rain.");
    } else {
        recommendations.push("Atmospheric conditions are optimal for all health profiles.");
        recommendations.push("No specific respiratory interventions required.");
    }

    // Pollutant Breakdown
    const total = aq.pm25 + aq.o3 + aq.no2 + aq.so2 + 0.1;
    const pollutantBreakdown = [
        { name: "PM2.5", impact: Math.round((aq.pm25 / total) * 100), color: "#38bdf8" },
        { name: "Ozone", impact: Math.round((aq.o3 / total) * 100), color: "#fbbf24" },
        { name: "NO2", impact: Math.round((aq.no2 / total) * 100), color: "#f87171" },
        { name: "Others", impact: Math.round(((aq.so2 + aq.co) / total) * 100), color: "#94a3b8" }
    ].filter(p => p.impact > 0);

    return {
        overallRisk,
        riskScore,
        metrics: {
            aggregateRiskIncrease: Math.round((riskScore / 100) * 35),
            cardiovascularRisk: {
                label: "Cardiovascular",
                increase: Math.round(riskScore * 0.35),
                color: riskScore > 75 ? "rose" : riskScore > 45 ? "amber" : "emerald"
            },
            respiratoryRisk: {
                label: "Respiratory",
                increase: Math.round(riskScore * 0.55),
                color: riskScore > 70 ? "rose" : riskScore > 40 ? "amber" : "emerald"
            },
            neurologicalRisk: {
                label: "Neurological",
                increase: Math.round(riskScore * 0.15),
                color: riskScore > 85 ? "rose" : "emerald"
            }
        },
        pollutantBreakdown,
        recommendations: recommendations.slice(0, 3),
        activityWindows: Array.from({ length: 8 }, (_, i) => {
            const hour = (new Date().getHours() + (i * 3)) % 24;
            const hourImpact = Math.sin((hour - 12) / 4) * 15; // Simulated diurnal variation
            const currentRisk = Math.max(0, Math.min(100, riskScore + hourImpact));

            return {
                hour,
                label: `${hour.toString().padStart(2, '0')}:00`,
                status: currentRisk > 80 ? "prohibited" : currentRisk > 60 ? "limited" : currentRisk > 30 ? "guarded" : "optimal",
                riskScore: Math.round(currentRisk),
                riskIncreaseSteps: Math.round(currentRisk * 0.3)
            };
        })
    };
}
