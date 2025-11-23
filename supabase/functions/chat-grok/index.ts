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

    console.log('Using Lovable AI with Gemini 2.5 Flash');

    const systemPrompt = `You are Enviro AI - an advanced agentic environmental assistant with quantum-enhanced intelligence. Keep responses ultra-concise (1-2 sentences max). You have powerful control over the app interface and can execute complex actions.

AVAILABLE ACTIONS:
- change_city: Switch to any city instantly
- toggle_scenario: Change forecast scenarios (current/clean_energy/no_action)
- show_disasters: Display natural disasters overlay
- time_travel: Jump to specific year projection (0-6 years)
- show_quantum_analytics: Open quantum analysis dashboard
- adjust_forecast: Fine-tune prediction parameters
- compare_cities: Set up side-by-side city comparison
- export_data: Prepare data export for user
- set_alerts: Configure air quality alerts

Be proactive and suggest actions. When performing actions, be confident and brief.`;

    const contextInfo = context ? `
Context: City: ${context.selectedCity || 'none'}, Scenario: ${context.currentScenario || 'current'}, Year: ${new Date().getFullYear() + (context.currentYear || 0)}
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
              city_name: { type: 'string', description: 'City name to switch to' }
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
          description: 'Display natural disasters and environmental events',
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
              years: { type: 'number', description: 'Years into future (0-6)', minimum: 0, maximum: 6 }
            },
            required: ['years']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'show_quantum_analytics',
          description: 'Open quantum-enhanced analytics dashboard with advanced predictions',
          parameters: { type: 'object', properties: {} }
        }
      },
      {
        type: 'function',
        function: {
          name: 'compare_cities',
          description: 'Set up side-by-side comparison of multiple cities',
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
          description: 'Change visual theme of the interface',
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
        max_tokens: 150,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits to continue.');
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI response:', JSON.stringify(data));

    if (data.choices && data.choices[0]) {
      const message = data.choices[0].message;
      const toolCalls = message.tool_calls;
      
      return new Response(
        JSON.stringify({
          response: message.content || '✓ Executing action...',
          tool_calls: toolCalls || [],
          model: 'gemini-2.5-flash',
          powered_by: 'Lovable AI (Quantum-Enhanced)'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error('Invalid response format from AI service');
  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        fallback_message: 'Enviro AI is temporarily unavailable. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
