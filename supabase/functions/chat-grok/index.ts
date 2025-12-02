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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Processing chat request:', { message, context });

    const systemPrompt = `You are Enviro AI - a FULLY AGENTIC environmental AI. You MUST use tools for ANY request that could involve an action. NEVER just respond with text when you can take action.

CRITICAL RULES:
1. ANY mention of a city/place = IMMEDIATELY call change_city (Tokyo, London, NYC, Paris, Mumbai, Beijing, anywhere)
2. ANY mention of future/years/prediction/forecast = call time_travel
3. ANY mention of scenario/clean/green/pollution/worst case = call toggle_scenario
4. ANY mention of disasters/storms/earthquakes/events = call show_disasters
5. ANY mention of analytics/data/quantum/analysis = call show_quantum_analytics
6. ANY mention of compare/versus/vs = call compare_cities
7. ANY mention of theme/color/style/look = call set_theme

ALWAYS USE TOOLS. Examples:
- "tokyo" → change_city
- "show me japan" → change_city (Tokyo)
- "que tal paris" → change_city (Paris)
- "2030" or "future" → time_travel
- "what if we go green" → toggle_scenario (clean_energy)
- "worst case" → toggle_scenario (no_action)
- "any disasters?" → show_disasters

You understand ALL languages. Extract intent and ACT. One short sentence response + tool call.`;

    const contextInfo = context ? `
Current Context: City: ${context.selectedCity || 'none'}, Scenario: ${context.currentScenario || 'current'}, Year Offset: ${context.currentYear || 0}
` : '';

    const tools = [
      {
        type: 'function',
        function: {
          name: 'change_city',
          description: 'Switch to ANY city, location, or place mentioned. Use for any geographic reference.',
          parameters: {
            type: 'object',
            properties: {
              city_name: { type: 'string', description: 'City name (e.g., Tokyo, London, Mumbai, New York, Paris, Beijing, Sydney)' }
            },
            required: ['city_name']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'toggle_scenario',
          description: 'Change environmental scenario. Use for any mention of future possibilities, clean energy, pollution, worst case, best case, green future, etc.',
          parameters: {
            type: 'object',
            properties: {
              scenario: { type: 'string', enum: ['current', 'clean_energy', 'no_action'], description: 'current=now, clean_energy=optimistic green future, no_action=worst case pollution' }
            },
            required: ['scenario']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'show_disasters',
          description: 'Show natural disasters, storms, earthquakes, wildfires, environmental events on the map',
          parameters: { type: 'object', properties: {} }
        }
      },
      {
        type: 'function',
        function: {
          name: 'time_travel',
          description: 'Jump to future year projection. Use for ANY mention of years, future, prediction, forecast, 2025-2030, etc.',
          parameters: {
            type: 'object',
            properties: {
              years: { type: 'number', description: 'Years into future (0-6). 2025=0, 2026=1, 2027=2, etc.' }
            },
            required: ['years']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'show_quantum_analytics',
          description: 'Open quantum analytics dashboard. Use for any mention of data, analysis, quantum, statistics, metrics',
          parameters: { type: 'object', properties: {} }
        }
      },
      {
        type: 'function',
        function: {
          name: 'compare_cities',
          description: 'Compare multiple cities. Use when user mentions comparing, versus, vs, or multiple city names',
          parameters: {
            type: 'object',
            properties: {
              cities: { type: 'array', items: { type: 'string' }, description: 'List of cities to compare' }
            },
            required: ['cities']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'set_theme',
          description: 'Change UI theme. Use for any mention of colors, style, look, appearance, dark, light',
          parameters: {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['quantum', 'earth', 'space', 'minimal'], description: 'Visual theme' }
            },
            required: ['theme']
          }
        }
      }
    ];

    console.log('Calling Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contextInfo + message }
        ],
        tools: tools,
        max_tokens: 200,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI raw response:', JSON.stringify(data));

    if (data.choices && data.choices[0]) {
      const choice = data.choices[0];
      const aiMessage = choice.message;
      const toolCalls = aiMessage.tool_calls || [];
      const textContent = aiMessage.content || '';
      
      console.log('Parsed response - text:', textContent, 'tool_calls:', toolCalls.length);
      
      return new Response(
        JSON.stringify({
          response: textContent || (toolCalls.length > 0 ? '✓ Executing...' : 'How can I help?'),
          tool_calls: toolCalls,
          model: 'gemini-2.5-flash',
          powered_by: 'Lovable AI'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.error('Invalid response structure:', data);
    throw new Error('Invalid response format from AI service');
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
