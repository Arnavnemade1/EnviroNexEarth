import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

interface ChatbotProps {
  selectedCity?: string;
  currentScenario?: 'current' | 'clean_energy' | 'no_action';
  currentYear?: number;
}

export const Chatbot = ({ selectedCity, currentScenario, currentYear }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: 'Hi! I\'m your Earth Data AI assistant. Ask me about air quality, climate predictions, or natural disasters. Try asking "Will New York breathe clean in 2030?" or "What causes air pollution?"',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Climate and air quality responses
    if (message.includes('new york') && (message.includes('2030') || message.includes('future'))) {
      return `Based on current trends, New York's air quality in 2030 will depend on policy actions. With clean energy adoption, AQI could improve to 35-45 (Good). Without action, it may worsen to 85-95 (Moderate to Unhealthy). The city is investing in electric vehicles and renewable energy to improve air quality.`;
    }
    
    if (message.includes('air pollution') && message.includes('cause')) {
      return `Air pollution comes from vehicle emissions (30%), industrial processes (25%), power plants (20%), agriculture (15%), and natural sources (10%). PM2.5 particles are especially dangerous as they penetrate deep into lungs and bloodstream.`;
    }
    
    if (message.includes('clean energy') || message.includes('renewable')) {
      return `Clean energy adoption can reduce air pollution by 60-80% by 2030. Solar and wind power produce zero emissions, while electric vehicles eliminate tailpipe pollution. Countries leading in renewables show significantly better air quality trends.`;
    }
    
    if (selectedCity && (message.includes('this city') || message.includes('here'))) {
      return `For ${selectedCity}, I'm analyzing real NASA satellite data showing current air quality conditions. The ${currentScenario} scenario projects ${currentScenario === 'clean_energy' ? 'improving' : currentScenario === 'no_action' ? 'worsening' : 'stable'} air quality through ${new Date().getFullYear() + (currentYear || 0)}.`;
    }
    
    if (message.includes('satellite') || message.includes('iss')) {
      return `The International Space Station orbits Earth every 90 minutes at 408km altitude, helping monitor air quality with specialized sensors. NASA's fleet of Earth observation satellites provides real-time pollution data that powers this visualization.`;
    }
    
    if (message.includes('natural disaster') || message.includes('wildfire') || message.includes('hurricane')) {
      return `Climate change is intensifying natural disasters. Wildfires release massive amounts of particulates, hurricanes are becoming stronger, and extreme weather events disrupt air quality. NASA tracks these events in real-time to predict air quality impacts.`;
    }
    
    if (message.includes('health') || message.includes('asthma')) {
      return `Poor air quality causes 7 million premature deaths annually. Long-term exposure increases asthma risk by 40%, reduces lung function, and raises cardiovascular disease risk. Children and elderly are most vulnerable to air pollution health effects.`;
    }
    
    // Default responses for common patterns
    if (message.includes('how') || message.includes('what') || message.includes('why')) {
      return `That's a great question! I analyze NASA Earth data to provide insights about air quality, climate predictions, and environmental trends. Could you be more specific about what aspect you'd like to know about?`;
    }
    
    return `I'm here to help with questions about air quality, climate change, and Earth data! Try asking about specific cities, pollution causes, or future climate scenarios. You can also ask about the satellites you see orbiting on the globe.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: generateBotResponse(userMessage.message),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="glass rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground">
          AI
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-96">
      <Card className="glass h-full flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-medium">Earth Data AI</span>
            <Badge variant="outline" className="text-xs">Live</Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    {message.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-primary/20">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about air quality, climate predictions..."
              className="glass flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              disabled={!inputValue.trim() || isTyping}
              className="glass"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chatbot;