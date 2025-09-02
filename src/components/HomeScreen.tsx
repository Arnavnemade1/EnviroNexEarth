import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Search, 
  TrendingUp, 
  Satellite, 
  AlertTriangle,
  MessageCircle,
  Play,
  ChevronRight
} from 'lucide-react';

interface HomeScreenProps {
  onStartExploring: () => void;
  onQuickStart: (type: 'search' | 'globe' | 'disasters') => void;
}

export const HomeScreen = ({ onStartExploring, onQuickStart }: HomeScreenProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const quickStartOptions = [
    {
      id: 'search',
      title: 'Search a City',
      description: 'Enter any city name to see its air quality and future predictions',
      icon: Search,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'globe',
      title: 'Explore the Globe',
      description: 'Click anywhere on Earth to discover local air quality data',
      icon: Globe,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      id: 'disasters',
      title: 'Natural Disasters',
      description: 'View current natural disasters affecting air quality worldwide',
      icon: AlertTriangle,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  const features = [
    {
      icon: Satellite,
      title: 'Live Satellites',
      description: 'Interactive ISS and Earth observation satellites'
    },
    {
      icon: TrendingUp,
      title: '2030 Predictions',
      description: 'Quantum-enhanced AI forecasting'
    },
    {
      icon: MessageCircle,
      title: 'AI Assistant',
      description: 'Ask questions about air quality and climate data'
    }
  ];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full h-full overflow-y-auto">
        <div className="max-w-4xl w-full space-y-8 animate-fade-in-up py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center glow">
              <Globe className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-earth bg-clip-text text-transparent">
              Earth's Skies in 2030
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore real-time air quality from NASA satellites and see quantum-enhanced AI predictions for Earth’s atmosphere.
          </p>
        </div>

        {/* Quick Start Options */}
        <div className="grid md:grid-cols-3 gap-6">
          {quickStartOptions.map((option) => (
            <Card 
              key={option.id}
              className={`glass p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                hoveredCard === option.id ? 'border-primary/50' : 'border-transparent'
              }`}
              onClick={() => onQuickStart(option.id as 'search' | 'globe' | 'disasters')}
              onMouseEnter={() => setHoveredCard(option.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center`}>
                  <option.icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium">
                  Get started <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-foreground">Powered by NASA EarthData</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 glass p-4 rounded-lg">
                <feature.icon className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 glow hover:scale-105 transition-transform"
            onClick={onStartExploring}
          >
            <Play className="w-5 h-5 mr-2" />
            Start Exploring
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 glass hover:scale-105 transition-transform"
            onClick={() => onQuickStart('search')}
          >
            <Search className="w-5 h-5 mr-2" />
            Search a City
          </Button>
        </div>

        {/* Info Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="glass">
            Real-time data • Quantum-enhanced AI • Interactive globe
          </Badge>
        </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;