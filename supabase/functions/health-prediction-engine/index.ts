import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OperationalProfile {
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

interface ResilienceAnalysisResponse {
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
        const { climateData, operationalProfile }: { climateData: ClimateData, operationalProfile: OperationalProfile } = payload;
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY');

        let data: ResilienceAnalysisResponse;

        if (!GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not found, using algorithmic fallback');
            data = generateMockResilienceAnalysis(climateData, operationalProfile);
        } else {
            try {
                const systemPrompt = "You are the AuraEarth Industrial Performance Engine. Analyze atmospheric load and regional resilience capacity for personnel optimization.\n" +
                    "Return ONLY valid JSON with this schema:\n" +
                    "{\n" +
                    "  \"overallRisk\": \"nominal\"|\"guarded\"|\"monitored\"|\"restricted\",\n" +
                    "  \"riskScore\": number (0-100 atmospheric load index),\n" +
                    "  \"metrics\": {\n" +
                    "    \"aggregateRiskIncrease\": number (load coefficient),\n" +
                    "    \"cardiovascularRisk\": { \"label\": \"CV Load\", \"increase\": number, \"color\": \"rose\"|\"amber\"|\"emerald\" },\n" +
                    "    \"respiratoryRisk\": { \"label\": \"Resp. Activity Index\", \"increase\": number, \"color\": \"rose\"|\"amber\"|\"emerald\" },\n" +
                    "    \"neurologicalRisk\": { \"label\": \"Neuro-Efficiency\", \"increase\": number, \"color\": \"rose\"|\"amber\"|\"emerald\" }\n" +
                    "  },\n" +
                    "  \"pollutantBreakdown\": [ { \"name\": \"PM2.5\"|\"O3\"|\"NO2\"|\"SO2\"|\"CO\", \"impact\": number (contribution percentage), \"color\": string } ],\n" +
                    "  \"recommendations\": [ string (maximum 3, focus on operational optimization and performance continuity) ],\n" +
                    "  \"activityWindows\": [ { \"hour\": number, \"label\": \"HH:00\", \"status\": \"optimal\"|\"guarded\"|\"limited\"|\"prohibited\", \"riskScore\": number, \"riskIncreaseSteps\": number } ]\n" +
                    "}\n" +
                    "CRITICAL: Recommendations MUST focus on industrial continuity. Do NOT use alarmist health warnings. Use terms like 'Baseline Compliance' and 'Operational Readiness'.";

                const userPrompt = "Location: " + climateData.cityName + "\n" +
                    "AQI: " + climateData.airQuality.aqi + "\n" +
                    "PM2.5: " + climateData.airQuality.pm25 + "\n" +
                    "O3: " + climateData.airQuality.o3 + "\n" +
                    "Profile: Age " + operationalProfile.age + ", Asthma: " + operationalProfile.hasAsthma + ", Heart: " + operationalProfile.hasHeartCondition;

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
                            temperature: 0.2,
                            topP: 0.95,
                            topK: 40,
                            maxOutputTokens: 2048,
                            responseMimeType: "application/json",
                        }
                    }),
                });

                if (!response.ok) throw new Error('Gemini API Error');

                const aiData = await response.json();
                const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!content) throw new Error('No content from Gemini');
                data = JSON.parse(content);
            } catch (e) {
                console.error('Gemini call failed, falling back:', (e as Error).message);
                data = generateMockResilienceAnalysis(climateData, operationalProfile);
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

function generateMockResilienceAnalysis(climateData: ClimateData, operationalProfile: OperationalProfile): ResilienceAnalysisResponse {
    const { airQuality: aq, weather: w, cityName } = climateData;
    const aqi = aq.aqi;

    // 1. Weather-Driven Risk Modulation
    const windFactor = Math.max(0.4, 1 - (w.windSpeed / 50));
    const thermalAmplifier = w.temperature > 30 ? 1.2 : 1.0;
    const humidityAmplifier = w.humidity > 70 ? 1.15 : 1.0;

    // 2. Base Risk Calculation
    let baseRisk = (aqi * 0.45) * windFactor * thermalAmplifier * humidityAmplifier;
    if (operationalProfile.hasAsthma) baseRisk *= 1.4;
    if (operationalProfile.hasHeartCondition) baseRisk *= 1.7;

    const riskScore = Math.min(100, Math.round(baseRisk));
    const overallRisk = riskScore > 80 ? "critical" : riskScore > 60 ? "restricted" : riskScore > 30 ? "monitored" : "nominal";

    // 3. Realistic Recommendations
    const recommendations: string[] = [];
    if (aqi > 150) {
        recommendations.push("Strategic atmospheric load exceeded. Activate indoor resource protocols.");
        recommendations.push("Mandatory filtration active for all essential personnel transit.");
    } else if (aqi > 100) {
        recommendations.push("Operational threshold reached. Manage physical exertion cycles.");
        if (operationalProfile.hasAsthma) recommendations.push("Verify operational readiness for sensitized personnel.");
    } else if (w.windSpeed < 5 && aqi > 50) {
        recommendations.push("Low dispersion coefficient. Performance window: 04:00 - 06:00.");
        recommendations.push("Infrastructure load peaking in primary transport corridors.");
    } else {
        recommendations.push("Atmospheric conditions nominal for all industrial operations.");
        recommendations.push("Full capacity yield maintained for your profile.");
    }

    // 4. Pollutant Breakdown
    const total = aq.pm25 + aq.o3 + aq.no2 + aq.so2 + 0.1;
    const pollutantBreakdown = [
        { name: "PM2.5", impact: Math.round((aq.pm25 / total) * 100), color: "#38bdf8" },
        { name: "Ozone", impact: Math.round((aq.o3 / total) * 100), color: "#fbbf24" },
        { name: "NO2", impact: Math.round((aq.no2 / total) * 100), color: "#f87171" },
        { name: "Others", impact: Math.round(((aq.so2 + aq.co) / total) * 100), color: "#94a3b8" }
    ].filter(p => p.impact > 0);

    // 5. Activity Windows (Advanced Diurnal Multi-Peak Model)
    const citySeed = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100;

    const activityWindows = Array.from({ length: 8 }, (_, i) => {
        const hour = (new Date().getHours() + (i * 3)) % 24;
        const morningPeak = Math.exp(-Math.pow(hour - 8, 2) / 4) * 20;
        const eveningPeak = Math.exp(-Math.pow(hour - 18, 2) / 6) * 25;
        const noise = (Math.sin(hour + citySeed) * 4) + (Math.cos(hour * 2 + citySeed) * 2);

        const windowRisk = Math.max(0, Math.min(100, riskScore + morningPeak + eveningPeak + noise));

        return {
            hour: hour,
            label: (hour < 10 ? '0' + hour : hour) + ":00",
            status: (windowRisk > 75 ? "prohibited" : windowRisk > 50 ? "limited" : windowRisk > 25 ? "guarded" : "optimal") as 'optimal' | 'guarded' | 'limited' | 'prohibited',
            riskScore: Math.round(windowRisk),
            riskIncreaseSteps: Math.round(windowRisk * 0.38)
        };
    });

    return {
        overallRisk,
        riskScore,
        metrics: {
            aggregateRiskIncrease: Math.round((riskScore / 100) * 35),
            cardiovascularRisk: {
                label: "CV Load",
                increase: Math.round(riskScore * 0.38),
                color: riskScore > 75 ? "rose" : riskScore > 45 ? "amber" : "emerald"
            },
            respiratoryRisk: {
                label: "Resp. Activity Index",
                increase: Math.round(riskScore * 0.52),
                color: riskScore > 70 ? "rose" : riskScore > 40 ? "amber" : "emerald"
            },
            neurologicalRisk: {
                label: "Neuro-Efficiency",
                increase: Math.round(riskScore * 0.15),
                color: riskScore > 85 ? "rose" : "emerald"
            }
        },
        pollutantBreakdown,
        recommendations: recommendations.slice(0, 3),
        activityWindows
    };
}
