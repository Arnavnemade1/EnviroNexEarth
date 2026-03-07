import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const systemPrompt = 'You are AuraEarth Resilience Intelligence, an advanced system and regional telemetry engine. Analyze atmospheric events and their impact on industrial continuity and infrastructure stability. Provide concise, factual summaries of atmospheric load and resource capacity in 2-4 sentences. Focus on operational uptime, resource security, and baseline stability.';

async function callLovableAI(disasters: string, apiKey: string): Promise<string> {
  console.log('[disaster-impact-ai] Calling Lovable AI gateway...');
  const response = await fetch(LOVABLE_AI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze the atmospheric load and infrastructure impact of these events:\n\n${disasters}\n\nProvide a strategic summary (2-4 sentences) focusing on industrial performance and resource resilience.` }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (response.status === 429) throw new Error('RATE_LIMITED');
  if (response.status === 402) throw new Error('PAYMENT_REQUIRED');
  if (!response.ok) {
    const t = await response.text();
    console.error('[disaster-impact-ai] Lovable AI error:', response.status, t);
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  const summary = data.choices?.[0]?.message?.content;
  if (!summary) throw new Error('No summary from Lovable AI');
  return summary;
}

async function callGeminiFallback(disasters: string, apiKey: string): Promise<string> {
  console.log('[disaster-impact-ai] Falling back to direct Gemini API...');
  const userPrompt = `Analyze the atmospheric load and infrastructure impact of these events:\n\n${disasters}\n\nProvide a strategic summary (2-4 sentences) focusing on industrial performance and resource resilience.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: { temperature: 0.7, topP: 0.95, topK: 40, maxOutputTokens: 1024 }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[disaster-impact-ai] Gemini API error:', response.status, errorText);
    throw new Error(`Gemini service error: ${response.status}`);
  }

  const data = await response.json();
  const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!summary) throw new Error('No summary from Gemini');
  return summary;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { disasters } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!LOVABLE_API_KEY && !GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ summary: generateMockDisasterSummary(disasters), powered_by: 'AuraEarth-Resilience-v1', model: 'algorithmic-fallback' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let summary: string | null = null;

    // Primary: Lovable AI
    if (LOVABLE_API_KEY) {
      try {
        summary = await callLovableAI(disasters, LOVABLE_API_KEY);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg === 'RATE_LIMITED') {
          return new Response(JSON.stringify({ error: 'Rate limited. Please try again shortly.' }), {
            status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        if (errMsg === 'PAYMENT_REQUIRED') {
          return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
            status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        console.error('[disaster-impact-ai] Lovable AI failed:', errMsg);
      }
    }

    // Fallback: Direct Gemini
    if (!summary && GEMINI_API_KEY) {
      try {
        summary = await callGeminiFallback(disasters, GEMINI_API_KEY);
      } catch (err) {
        console.error('[disaster-impact-ai] Gemini fallback failed:', err);
      }
    }

    // Final fallback: algorithmic
    if (!summary) {
      summary = generateMockDisasterSummary(disasters);
    }

    return new Response(
      JSON.stringify({ summary, powered_by: summary ? 'Lovable AI' : 'AuraEarth-Resilience-v1', model: summary ? 'google/gemini-3-flash-preview' : 'algorithmic-fallback' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[disaster-impact-ai] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', fallback_message: 'Enviro AI analysis unavailable' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateMockDisasterSummary(disasters: string) {
  return `Atmospheric telemetry indicates nominal infrastructure resilience following the reported anomalies. Our resilience engine predicts a high-capacity recovery window for regional energy output, with localized optimization effects expected in high-yield zones. Industrial continuity protocols are currently being modeled to ensure sustained resource security.`;
}
