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

    const systemPrompt = `You are Enviro AI, an advanced environmental assistant specialized in air quality, climate change, quantum computing applications, and environmental science.
Provide accurate, insightful responses about air quality, pollution, climate predictions, IBM Quantum computing applications, and Earth observation data.
Be conversational but precise. Keep responses informative and engaging (2-4 sentences).`;

    const contextInfo = context ? `
Context: The user is exploring air quality data for ${context.selectedCity || 'a location'}.
Current scenario: ${context.currentScenario || 'current trends'}
Current forecast year: ${new Date().getFullYear() + (context.currentYear || 0)}
` : '';

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
          { role: 'user', content: contextInfo + '\n\nUser question: ' + message }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return new Response(
        JSON.stringify({
          response: data.choices[0].message.content,
          model: 'llama-3.3-70b-instruct',
          powered_by: 'Enviro AI'
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
