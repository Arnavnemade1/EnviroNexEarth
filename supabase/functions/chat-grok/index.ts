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

    const systemPrompt = `You are Enviro AI - an advanced agentic environmental assistant. Keep responses ultra-concise (1-2 sentences max). You have powerful control over the app interface.

AVAILABLE ACTIONS (use these tools when appropriate):
- change_city: Switch to any city (e.g., "Show me Tokyo", "Switch to London")
- toggle_scenario: Change forecast scenarios (current/clean_energy/no_action)
- show_disasters: Display natural disasters overlay
- time_travel: Jump to specific year projection (0-6 years into future)
- show_quantum_analytics: Open quantum analysis dashboard
- compare_cities: Compare multiple cities side-by-side
- set_theme: Change chatbot visual theme (quantum/earth/space/minimal)

When users ask to see a city, change scenarios, or perform actions, USE THE TOOLS. Be proactive and execute actions immediately.`;

    const contextInfo = context ? `
Current Context: City: ${context.selectedCity || 'none'}, Scenario: ${context.currentScenario || 'current'}, Year Offset: ${context.currentYear || 0}
` : '';

    const tools = [
      {
        type: 'function',
        function: {
          name: 'change_city',
          description: 'Switch to a different city to view its air quality and environmental data',
          parameters: {
            type: 'object',
            properties: {
              city_name: { type: 'string', description: 'City name to switch to (e.g., Tokyo, London, Mumbai)' }
            },
            required: ['city_name']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'toggle_scenario',
          description: 'Change forecast scenario to see different futures',
          parameters: {
            type: 'object',
            properties: {
              scenario: { type: 'string', enum: ['current', 'clean_energy', 'no_action'], description: 'Forecast scenario' }
            },
            required: ['scenario']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'show_disasters',
          description: 'Display natural disasters and environmental events on the globe',
          parameters: { type: 'object', properties: {} }
        }
      },
      {
        type: 'function',
        function: {
          name: 'time_travel',
          description: 'Jump to specific year projection (0-6 years into future)',
          parameters: {
            type: 'object',
            properties: {
              years: { type: 'number', description: 'Years into future (0-6)' }
            },
            required: ['years']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'show_quantum_analytics',
          description: 'Open quantum-enhanced analytics dashboard',
          parameters: { type: 'object', properties: {} }
        }
      },
      {
        type: 'function',
        function: {
          name: 'compare_cities',
          description: 'Set up comparison of multiple cities',
          parameters: {
            type: 'object',
            properties: {
              cities: { type: 'array', items: { type: 'string' }, description: 'Cities to compare' }
            },
            required: ['cities']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'set_theme',
          description: 'Change visual theme of the chatbot interface',
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
