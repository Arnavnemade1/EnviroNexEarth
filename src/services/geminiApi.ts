interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

class GeminiApiService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async generateResponse(message: string, context?: {
    selectedCity?: string;
    currentScenario?: string;
    currentYear?: number;
  }): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not set');
    }

    const contextPrompt = context ? `
Context: The user is exploring air quality data for ${context.selectedCity || 'a location'}. 
Current scenario: ${context.currentScenario || 'current trends'}
Current forecast year: ${new Date().getFullYear() + (context.currentYear || 0)}

You are an AI assistant specialized in air quality, climate change, and environmental science. 
Provide accurate, helpful responses about air quality, pollution, climate predictions, and Earth observation data.
Keep responses informative but concise (2-3 sentences max).
    ` : '';

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextPrompt + '\n\nUser question: ' + message
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
      
      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Fallback to local responses
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

export const geminiService = new GeminiApiService();