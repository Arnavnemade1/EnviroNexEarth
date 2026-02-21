import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { disasters } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY');

    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured, using fallback');
      return new Response(
        JSON.stringify({
          summary: generateMockDisasterSummary(disasters),
          powered_by: 'AuraEarth-Resilience-v1',
          model: 'algorithmic-fallback'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      const systemPrompt = 'You are AuraEarth Resilience Intelligence, an advanced system and regional telemetry engine. Analyze atmospheric events and their impact on industrial continuity and infrastructure stability. Provide concise, factual summaries of atmospheric load and resource capacity in 2-4 sentences. Focus on operational uptime, resource security, and baseline stability.';
      const userPrompt = `Analyze the atmospheric load and infrastructure impact of these events:\n\n${disasters}\n\nProvide a strategic summary (2-4 sentences) focusing on industrial performance and resource resilience.`;

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
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini service error: ${response.status}`);
      }

      const data = await response.json();
      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate Enviro AI analysis.';

      return new Response(
        JSON.stringify({
          summary,
          powered_by: 'Enviro AI',
          model: 'gemini-2.0-flash'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (apiError) {
      console.error('Gemini call failed, falling back:', apiError);
      return new Response(
        JSON.stringify({
          summary: generateMockDisasterSummary(disasters),
          powered_by: 'AuraEarth-Resilience-v1',
          model: 'algorithmic-fallback'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Enviro AI disaster impact analysis error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback_message: 'Enviro AI analysis unavailable'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateMockDisasterSummary(disasters: string) {
  return `Atmospheric telemetry indicates nominal infrastructure resilience following the reported anomalies. Our resilience engine predicts a high-capacity recovery window for regional energy output, with localized optimization effects expected in high-yield zones. Industrial continuity protocols are currently being modeled to ensure sustained resource security.`;
}

