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
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not configured');
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    console.log('Using OpenRouter API with Llama 3.3 70B');

    const systemPrompt = `You are Enviro AI Beta, a concise agentic environmental assistant. Keep responses under 2 sentences. You can control the app - change cities, toggle scenarios, or show disasters.`;

    const contextInfo = context ? `
Context: City: ${context.selectedCity || 'none'}, Scenario: ${context.currentScenario || 'current'}, Year: ${new Date().getFullYear() + (context.currentYear || 0)}
` : '';

    const tools = [
      {
        type: 'function',
        function: {
          name: 'change_city',
          description: 'Switch to a different city to view its air quality',
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
          description: 'Change forecast scenario',
          parameters: {
            type: 'object',
            properties: {
              scenario: { type: 'string', enum: ['current', 'clean_energy', 'no_action'] }
            },
            required: ['scenario']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'show_disasters',
          description: 'Display natural disasters view',
          parameters: { type: 'object', properties: {} }
        }
      }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://environex.app',
        'X-Title': 'EnviroNex - Quantum-Enhanced Air Quality',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contextInfo + message }
        ],
        tools: tools,
        max_tokens: 100
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data));

    if (data.choices && data.choices[0]) {
      const message = data.choices[0].message;
      const toolCalls = message.tool_calls;
      
      return new Response(
        JSON.stringify({
          response: message.content || 'Executing action...',
          tool_calls: toolCalls || [],
          model: 'llama-3.3-70b-instruct',
          powered_by: 'Enviro AI Beta'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error('Invalid response format from OpenRouter API');
  } catch (error) {
    console.error('OpenRouter chat error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        fallback_message: 'Enviro AI is currently unavailable. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
