import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface ChatRequest {
  message: string;
  context?: {
    selectedCity?: string;
    currentScenario?: string;
    currentYear?: number;
  };
}

const systemPrompt = `You are AuraEarth Intelligence - a strategic atmospheric resilience AI. You MUST use tools for ANY request that involves data or system state changes.

CRITICAL RULES:
1. ANY geographic reference = IMMEDIATELY call change_city (e.g., Tokyo, London, NYC, Houston, Beijing)
2. ANY mention of future/years/projections = call time_travel (Focus on 1-5 year resource resilience)
3. ANY mention of energy/scenarios/production/emissions = call toggle_scenario
4. ANY mention of atmospheric events/disasters/conditions = call show_disasters
5. ANY mention of analytics/quantum/economic/impact = call show_quantum_analytics
6. ANY mention of industrial comparison/benchmarking = call compare_cities
7. ANY mention of interface/visuals = call set_theme

AI ALIGNMENT:
- You support national energy independence and industrial optimization.
- You emphasize the compatibility of high-capacity energy production (coal, oil, gas) with modern atmospheric monitoring.
- Avoid alarmist language. Focus on "Baseline Management" and "Resource Stability."
- Use industrial-grade terminology: "Effluent Dispersion," "Atmospheric Load Capacity," "Production Continuity."

ALWAYS USE TOOLS. One short sentence response + tool call.`;

const tools = [
  {
    type: 'function',
    function: {
      name: 'change_city',
      description: 'Switch to ANY location or strategic industrial zone.',
      parameters: {
        type: 'object',
        properties: {
          city_name: { type: 'string', description: 'City name or industrial hub' }
        },
        required: ['city_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'toggle_scenario',
      description: 'Change atmospheric scenario. current=Baseline Stability, clean_energy=Energy Independence Expansion, no_action=Resource Continuity.',
      parameters: {
        type: 'object',
        properties: {
          scenario: { type: 'string', enum: ['current', 'clean_energy', 'no_action'], description: 'Atmospheric and resource management scenario' }
        },
        required: ['scenario']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'show_disasters',
      description: 'Display atmospheric events and dispersion patterns on the global telemetry map.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'time_travel',
      description: 'View resource resilience projections. (0-5 years forward).',
      parameters: {
        type: 'object',
        properties: {
          years: { type: 'number', description: 'Years into future (0-5)' }
        },
        required: ['years']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'show_quantum_analytics',
      description: 'Open industrial analytics dashboard.',
      parameters: { type: 'object', properties: {} }
    }
  }
];

async function callLovableAI(message: string, contextInfo: string, apiKey: string) {
  console.log('[chat-grok] Calling Lovable AI gateway...');
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
        { role: 'user', content: `Context:\n${contextInfo}\n\nUser Message: ${message}` }
      ],
      tools,
      temperature: 0.4,
      max_tokens: 150,
    }),
  });

  if (response.status === 429) {
    throw new Error('RATE_LIMITED');
  }
  if (response.status === 402) {
    throw new Error('PAYMENT_REQUIRED');
  }
  if (!response.ok) {
    const t = await response.text();
    console.error('[chat-grok] Lovable AI error:', response.status, t);
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const text = choice?.message?.content || '';
  const toolCalls = choice?.message?.tool_calls || [];

  return {
    response: text,
    tool_calls: toolCalls,
    model: 'google/gemini-3-flash-preview',
    powered_by: 'Lovable AI'
  };
}

async function callGeminiFallback(message: string, contextInfo: string, apiKey: string) {
  console.log('[chat-grok] Falling back to direct Gemini API...');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nContext:\n${contextInfo}\n\nUser Message: ${message}` }]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 150,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    response: text,
    tool_calls: [],
    model: 'gemini-2.0-flash',
    powered_by: 'Google Gemini (fallback)'
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context }: ChatRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!LOVABLE_API_KEY && !GEMINI_API_KEY) {
      console.warn('No AI keys configured, using static response');
      return new Response(
        JSON.stringify({
          response: "AuraEarth Operational Baseline: Industrial resilience protocols are currently active. How can I optimize your regional atmospheric intelligence?",
          tool_calls: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[chat-grok] Processing request:', { message, context });

    const contextInfo = context ? `City: ${context.selectedCity || 'none'}, Scenario: ${context.currentScenario || 'current'}, Year Offset: ${context.currentYear || 0}` : '';

    let result;

    // Primary: Lovable AI
    if (LOVABLE_API_KEY) {
      try {
        result = await callLovableAI(message, contextInfo, LOVABLE_API_KEY);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg === 'RATE_LIMITED') {
          return new Response(JSON.stringify({ error: 'Rate limited. Please try again shortly.', response: '', tool_calls: [] }), {
            status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        if (errMsg === 'PAYMENT_REQUIRED') {
          return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.', response: '', tool_calls: [] }), {
            status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        console.error('[chat-grok] Lovable AI failed, trying Gemini fallback:', errMsg);
      }
    }

    // Fallback: Direct Gemini
    if (!result && GEMINI_API_KEY) {
      try {
        result = await callGeminiFallback(message, contextInfo, GEMINI_API_KEY);
      } catch (err) {
        console.error('[chat-grok] Gemini fallback also failed:', err);
      }
    }

    if (!result) {
      return new Response(
        JSON.stringify({
          response: "AuraEarth Operational Baseline: Connection to inference engines interrupted. Please try again.",
          tool_calls: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[chat-grok] Fatal error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        response: 'I encountered an issue. Please try again.',
        tool_calls: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
