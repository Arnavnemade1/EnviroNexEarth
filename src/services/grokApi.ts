import { supabase } from '@/integrations/supabase/client';

interface GrokResponse {
  response: string;
  model: string;
}

class GrokApiService {
  async generateResponse(message: string, context?: {
    selectedCity?: string;
    currentScenario?: string;
    currentYear?: number;
  }): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke<GrokResponse>('chat-grok', {
        body: { message, context }
      });

      if (error) {
        console.error('Grok API error via edge function:', error);
        return this.getFallbackResponse(message, context);
      }

      if (data?.response) {
        return data.response;
      }
      
      throw new Error('Invalid response format from Grok API');
    } catch (error) {
      console.error('Grok API error:', error);
      return this.getFallbackResponse(message, context);
    }
  }

  private getFallbackResponse(message: string, context?: any): string {
    const msg = message.toLowerCase();
    
    if (msg.includes('satellite') || msg.includes('red lines')) {
      return "Those red lines are solar panels on the satellites! The ISS, Hubble, and other Earth observation satellites use these panels to power their instruments that monitor air quality and climate data.";
    }
    
    if (msg.includes('air quality') || msg.includes('pollution')) {
      return "Air pollution primarily comes from vehicle emissions, industrial processes, and power generation. NASA satellites like TERRA and Landsat-8 continuously monitor global air quality to track pollution trends.";
    }
    
    if (context?.selectedCity && (msg.includes('this city') || msg.includes('here'))) {
      return `For ${context.selectedCity}, the ${context.currentScenario} scenario shows ${context.currentScenario === 'clean_energy' ? 'significant improvements' : context.currentScenario === 'no_action' ? 'concerning deterioration' : 'gradual changes'} in air quality by ${new Date().getFullYear() + (context.currentYear || 0)}.`;
    }
    
    return "I'm here to help with questions about air quality, climate data, and Earth observations. The satellites you see (with red solar panels) continuously monitor our planet's atmosphere!";
  }
}

export const grokService = new GrokApiService();