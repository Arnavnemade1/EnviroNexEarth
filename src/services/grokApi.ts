import { supabase } from '@/integrations/supabase/client';

interface ChatResponse {
  response: string;
  model?: string;
  powered_by?: string;
  error?: string;
  tool_calls?: Array<{
    id?: string;
    type?: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

class EnviroAIService {
  async generateResponse(message: string, context?: {
    selectedCity?: string;
    currentScenario?: string;
    currentYear?: number;
  }): Promise<string | { text: string; tool_calls?: any[] }> {
    try {
      console.log('[EnviroAI] Sending request:', { message, context });
      
      const { data, error } = await supabase.functions.invoke<ChatResponse>('chat-grok', {
        body: { message, context }
      });

      console.log('[EnviroAI] Response received:', { data, error });

      if (error) {
        console.error('[EnviroAI] Function error:', error);
        return this.getFallbackResponse(message, context);
      }

      if (!data) {
        console.error('[EnviroAI] No data returned');
        return this.getFallbackResponse(message, context);
      }

      if (data.error && !data.response) {
        console.error('[EnviroAI] API error:', data.error);
        return data.error;
      }

      const responseText = data.response || 'Action completed';
      const toolCalls = data.tool_calls || [];

      console.log('[EnviroAI] Parsed - text:', responseText, 'tools:', toolCalls.length);

      if (toolCalls.length > 0) {
        return { text: responseText, tool_calls: toolCalls };
      }

      return responseText;
    } catch (error) {
      console.error('[EnviroAI] Service error:', error);
      return this.getFallbackResponse(message, context);
    }
  }

  private getFallbackResponse(message: string, context?: any): string {
    const msg = message.toLowerCase();

    if (msg.includes('quantum') || msg.includes('ibm')) {
      return "Quantum predictions analyze air quality with IBM Quantum for 3-5x speedup!";
    }

    if (msg.includes('air quality') || msg.includes('pollution')) {
      return "I can show air quality data for any city - just ask!";
    }

    if (context?.selectedCity) {
      return `Viewing ${context.selectedCity}. Try 'change scenario' or 'jump to 2029'!`;
    }

    return "I'm Enviro AI! Try 'Show Tokyo', 'Jump to 2029', or 'Show disasters'!";
  }
}

export const grokService = new EnviroAIService();