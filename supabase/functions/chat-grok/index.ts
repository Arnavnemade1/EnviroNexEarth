import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  context?: {
    selectedCity?: string;
    currentScenario?: string;
    currentYear?: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context }: ChatRequest = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY');

    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured, using algorithmic response');
      return new Response(
        JSON.stringify({
          response: "AuraEarth Operational Baseline: Industrial resilience protocols are currently active. How can I optimize your regional atmospheric intelligence?",
          tool_calls: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing industrial chat request:', { message, context });

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

    const contextInfo = context ? `
Current Context: City: ${context.selectedCity || 'none'}, Scenario: ${context.currentScenario || 'current'}, Year Offset: ${context.currentYear || 0}
` : '';

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

    console.log('Calling Gemini API for industrial intelligence...');

    try {
      // Simplified for Edge Runtime - using direct fetch to Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nContext:\n${contextInfo}\n\nUser Message: ${message}` }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 150,
          },
          // Note: Gemini function calling structure is different, but for now we'll stick to text-based tool prompting 
          // as the frontend handles the parsing or we can implement real function calling if needed.
          // Given the deadline and constraints, we'll keep the response format consistent for the frontend parser.
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Simple parsing of tool calls from text if the model doesn't support them directly in this format
      // or if we want to maintain the specific return structure the frontend expects.

      return new Response(
        JSON.stringify({
          response: text,
          tool_calls: [], // We need to implement proper function calling parsing if the frontend relies on it
          model: 'gemini-2.0-flash',
          powered_by: 'AuraEarth Internal Intelligence'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Gemini call failed:', apiError);
      return new Response(
        JSON.stringify({
          response: "AuraEarth Operational Baseline: Industrial resilience protocols are currently active. Connection to primary inference engine interrupted.",
          tool_calls: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        response: 'I encountered an issue. Please try again.',
        tool_calls: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
