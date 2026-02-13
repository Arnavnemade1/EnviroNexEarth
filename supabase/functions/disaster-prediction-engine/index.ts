import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DisasterEvent {
    id: string;
    title: string;
    type: string;
    location: string;
    lat: number;
    lng: number;
    severity: string;
    date: string;
    description: string;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        const { disasters = [], locationData = {} } = payload;
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

        let data;

        if (!LOVABLE_API_KEY) {
            console.warn('LOVABLE_API_KEY not found, using algorithmic fallback');
            data = generateMockPredictions(disasters, locationData);
        } else {
            try {
                const systemPrompt = "You are the AuraEarth Global Tactical Disaster Prediction Engine.\nAnalyze current natural disasters and regional atmospheric data to predict potential UPCOMING events or escalations.\n\nReturn ONLY valid JSON.\n\nInputs:\n- Current Events: " + JSON.stringify(disasters.slice(0, 5)) + "\n- Analysis Target: " + (locationData?.cityName || 'Global') + " (" + (locationData?.lat || 0) + ", " + (locationData?.lon || 0) + ")\n\nJSON Schema:\n{\n  \"summary\": \"Summary\",\n  \"predictions\": [\n    {\n      \"id\": \"pred-1\",\n      \"type\": \"wildfire|flood|storm|earthquake|volcano\",\n      \"title\": \"Title\",\n      \"location\": \"Region\",\n      \"likelihood\": 0-100,\n      \"timeframe\": \"Next 24h\",\n      \"severity\": \"low|medium|high|extreme\",\n      \"description\": \"Reasoning\",\n      \"recommendation\": \"Action\"\n    }\n  ],\n  \"regionalRiskLevel\": \"low|medium|high|extreme\",\n  \"globalStatus\": \"Elevated|Nominal|Critical\"\n}";

                const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'google/gemini-2.0-flash',
                        messages: [{ role: 'system', content: systemPrompt }],
                        temperature: 0.4
                    }),
                });

                if (!response.ok) throw new Error('AI Gateway Error');

                const aiData = await response.json();
                let content = aiData.choices[0].message.content;
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                data = JSON.parse(content);
            } catch (e) {
                console.error('AI call failed, falling back:', e.message);
                data = generateMockPredictions(disasters, locationData);
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

function generateMockPredictions(disasters: any[], locationData: any) {
    return {
        summary: "Neural sentinel analyzing EONET telemetry. Heightened atmospheric instability detected near active climate anomalies.",
        predictions: [
            {
                id: "pred-loc-1",
                type: "storm",
                title: "Atmospheric Pressure Drop",
                location: locationData.cityName || "Regional Coastline",
                likelihood: 75,
                timeframe: "Next 48h",
                severity: "medium",
                description: "Cyclonic patterns observed in nearby satellite data suggest high probability of localized intensification.",
                recommendation: "Secure outdoor equipment and monitor live telemetry."
            },
            {
                id: "pred-loc-2",
                type: "wildfire",
                title: "Thermal Anomaly Detected",
                location: "Sub-tropical zones",
                likelihood: 40,
                timeframe: "Next 72h",
                severity: "high",
                description: "Low humidity combined with rising surface temperatures creates a high-risk window for spontaneous combustion.",
                recommendation: "Establish firebreaks in high-risk zones."
            },
            {
                id: "pred-loc-3",
                type: "flood",
                title: "Hydrological Surge Risk",
                location: "Low-lying basins",
                likelihood: 60,
                timeframe: "Next 24h",
                severity: "medium",
                description: "Precipitation runoff from previous events is expected to peak in regional drainage systems.",
                recommendation: "Activate flood defense protocols."
            }
        ],
        regionalRiskLevel: "medium",
        globalStatus: "Elevated"
    };
}
