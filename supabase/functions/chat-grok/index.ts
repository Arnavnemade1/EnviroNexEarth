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
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const systemPrompt = `You are an AI assistant specialized in air quality, climate change, and environmental science. 
Provide accurate, helpful responses about air quality, pollution, climate predictions, and Earth observation data.
Keep responses informative but concise (2-3 sentences max).`;

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
        'X-Title': 'EnviroNex',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'x-ai/grok-2-1212',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contextInfo + '\n\nUser question: ' + message }
        ],
        temperature: 0.6,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grok API error:', response.status, errorText);
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return new Response(
        JSON.stringify({ 
          response: data.choices[0].message.content,
          model: 'x-ai/grok-2-1212'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    throw new Error('Invalid response format from Grok API');
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
