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
        const { disasters, locationData }: { disasters: DisasterEvent[], locationData: any } = await req.json();
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

        if (!LOVABLE_API_KEY) {
            throw new Error('LOVABLE_API_KEY not configured');
        }

        const systemPrompt = `You are the AuraEarth Global Tactical Disaster Prediction Engine.
Analyze current natural disasters and regional atmospheric data to predict potential UPCOMING events or escalations.

Return ONLY valid JSON.

Inputs:
- Current Events: ${JSON.stringify(disasters.slice(0, 5))}
- Analysis Target: ${locationData?.cityName || 'Global'} (${locationData?.lat}, ${locationData?.lon})

Requirements:
1. Identify regional vulnerabilities based on nearby active events (e.g., if a wildfire is within 500km, predict air quality degradation).
2. Predict likelihood of secondary events (e.g., floods after heavy storms, which can be inferred from precipitation data).
3. Provide hyper-local impact forecasts for the specific region.

JSON Schema:
{
  "summary": "High-level tactical summary of global and regional disaster risks",
  "predictions": [
    {
      "id": "pred-1",
      "type": "wildfire|flood|storm|earthquake|volcano",
      "title": "Specific Prediction Title",
      "location": "Affected Region",
      "likelihood": 0-100,
      "timeframe": "Next 24h|48h|72h",
      "severity": "low|medium|high|extreme",
      "description": "Evidence-based reasoning for this prediction",
      "recommendation": "Precautionary action"
    }
  ],
  "regionalRiskLevel": "low|medium|high|extreme",
  "globalStatus": "Elevated|Nominal|Critical"
}

Ensure predictions are realistic and tied to real event patterns. Include at least 3 relevant predictions.`;

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
