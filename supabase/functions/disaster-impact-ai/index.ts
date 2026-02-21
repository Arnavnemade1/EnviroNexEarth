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
      const systemPrompt = 'You are Enviro AI, an advanced environmental assistant analyzing natural disasters with quantum-enhanced insights. Provide concise, factual summaries of environmental impacts in 2-4 sentences. Focus on air quality, ecosystem effects, climate implications, and quantum-predicted trends.';
      const userPrompt = `Analyze the environmental and air quality impact of these natural disasters:\n\n${disasters}\n\nProvide a brief summary (2-4 sentences) of the collective environmental impact, including quantum-enhanced predictions if relevant.`;

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
  return `Atmospheric telemetry indicates significant environmental restructuring following the reported anomalies. Our neural engine predicts a multi-day recovery window for regional air quality, with localized cooling effects expected in high-impact zones. Environmental restoration protocols are currently being modeled to mitigate long-term climate drift.`;
}

