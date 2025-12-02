import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Bot, User, Palette } from 'lucide-react';
import { grokService } from '@/services/grokApi';
import { AgenticOverlay } from '@/components/AgenticOverlay';

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
  onToolCall?: (toolName: string, args: any) => void;
}

export const Chatbot = ({ selectedCity, currentScenario, currentYear, onToolCall }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: "I'm Enviro AI! I can: show any city, change scenarios, show disasters, time travel (0-6 years). Try: 'Show Tokyo' or 'Jump to 2028'",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agenticAction, setAgenticAction] = useState<string | undefined>();
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<'quantum' | 'earth' | 'space' | 'minimal'>('quantum');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      const response = await grokService.generateResponse(
        userMessage.message,
        { selectedCity, currentScenario, currentYear }
      );
      
      console.log('[Chatbot] Response:', response);
      
      // Check if response contains tool calls
      if (typeof response === 'object' && response.tool_calls && response.tool_calls.length > 0) {
        console.log('[Chatbot] Processing', response.tool_calls.length, 'tool calls');
        setAgenticAction('Analyzing request...');
        
        for (const toolCall of response.tool_calls) {
          try {
            // Parse arguments - handle both string and object formats
            let args: any;
            if (typeof toolCall.function.arguments === 'string') {
              args = JSON.parse(toolCall.function.arguments);
            } else {
              args = toolCall.function.arguments || {};
            }
            
            console.log('[Chatbot] Executing:', toolCall.function.name, args);
            setAgenticAction(getActionDescription(toolCall.function.name, args));
            
            await new Promise(resolve => setTimeout(resolve, 600));
            
            if (onToolCall) {
              onToolCall(toolCall.function.name, args);
            }
          } catch (parseErr) {
            console.error('[Chatbot] Tool parse error:', parseErr, toolCall);
          }
        }
        
        setTimeout(() => setAgenticAction(undefined), 800);
        
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          message: response.text || '✓ Done!',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Regular text response
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          message: typeof response === 'string' ? response : (response.text || 'How can I help?'),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('[Chatbot] Error:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: 'Connection issue. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
    
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getActionDescription = (toolName: string, args: any): string => {
    const descriptions: Record<string, string> = {
      change_city: `Switching to ${args.city_name}...`,
      toggle_scenario: `Changing to ${args.scenario} scenario...`,
      show_disasters: 'Loading disasters overlay...',
      time_travel: `Time traveling to ${new Date().getFullYear() + args.years}...`,
      show_quantum_analytics: 'Opening quantum analytics...',
      compare_cities: `Comparing ${args.cities.join(', ')}...`,
      set_theme: `Applying ${args.theme} theme...`
    };
    return descriptions[toolName] || 'Executing action...';
  };

  const themeColors = {
    quantum: 'from-blue-500/20 to-purple-500/20',
    earth: 'from-green-500/20 to-blue-500/20',
    space: 'from-indigo-500/20 to-pink-500/20',
    minimal: 'from-gray-500/20 to-gray-700/20'
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
          Enviro AI
        </Badge>
      </div>
    );
  }

  return (
    <>
      <AgenticOverlay isActive={!!agenticAction} action={agenticAction} />
      
      <div className="fixed bottom-6 right-6 z-50 w-96 h-96">
        <Card className={`glass h-full flex flex-col animate-scale-in bg-gradient-to-br ${themeColors[theme]}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary/20">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary animate-pulse" />
              <span className="font-medium">Enviro AI</span>
              <Badge variant="default" className="text-xs bg-gradient-to-r from-blue-500 to-purple-500">
                Quantum-Agentic
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Palette className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-primary/20 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Theme</p>
              <div className="flex gap-2">
                {(['quantum', 'earth', 'space', 'minimal'] as const).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={theme === t ? 'default' : 'outline'}
                    onClick={() => setTheme(t)}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          )}

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
              placeholder="Ask about quantum predictions, air quality..."
              className="glass flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              disabled={isTyping}
              className="glass"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
    </>
  );
};

export default Chatbot;
