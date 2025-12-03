import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Search, AlertTriangle, Play, ChevronRight, User, Sparkles, Zap, Atom } from 'lucide-react';

interface HomeScreenProps {
  onStartExploring: () => void;
  onQuickStart: (type: 'search' | 'globe' | 'disasters') => void;
}

export const HomeScreen = ({ onStartExploring, onQuickStart }: HomeScreenProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const quickStartOptions = [
    {
      id: 'search',
      title: 'Search City',
      description: 'Explore air quality & predictions',
      icon: Search,
    },
    {
      id: 'globe',
      title: 'Explore Globe',
      description: 'Click anywhere on Earth',
      icon: Globe,
    },
    {
      id: 'disasters',
      title: 'Disasters',
      description: 'Live natural events',
      icon: AlertTriangle,
    }
  ];

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[200px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl px-6 py-12 flex flex-col items-center">
        
        {/* Logo & Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-xl border border-white/10 mb-6 shadow-2xl shadow-primary/20">
            <Globe className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              EnviroNex
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Real-time air quality monitoring powered by NASA satellites & quantum-enhanced AI
          </p>
        </div>

        {/* Quick Actions - Liquid Glass Cards */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xl mb-12">
          {quickStartOptions.map((option, i) => (
            <button
              key={option.id}
              onClick={() => onQuickStart(option.id as 'search' | 'globe' | 'disasters')}
              onMouseEnter={() => setHoveredCard(option.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group relative p-6 rounded-2xl transition-all duration-500 animate-fade-in ${
                hoveredCard === option.id 
                  ? 'bg-white/10 scale-105 shadow-2xl shadow-primary/20' 
                  : 'bg-white/[0.03] hover:bg-white/[0.06]'
              } backdrop-blur-xl border border-white/[0.08] hover:border-white/20`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto transition-all duration-300 ${
                hoveredCard === option.id 
                  ? 'bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30' 
                  : 'bg-white/5'
              }`}>
                <option.icon className={`w-6 h-6 transition-colors ${
                  hoveredCard === option.id ? 'text-white' : 'text-muted-foreground'
                }`} />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{option.title}</h3>
              <p className="text-xs text-muted-foreground">{option.description}</p>
              <ChevronRight className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-all duration-300 ${
                hoveredCard === option.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`} />
            </button>
          ))}
        </div>

        {/* Primary CTA */}
        <Button 
          size="lg" 
          onClick={onStartExploring}
          className="relative px-10 py-7 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary via-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 mb-8 group"
        >
          <Play className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
          Start Exploring
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
        </Button>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
            <Atom className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">IBM Quantum</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm text-muted-foreground">EnviroAI</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Real-time Data</span>
          </div>
        </div>

        {/* Auth Link */}
        <button 
          onClick={() => window.location.href = '/auth'}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <User className="w-4 h-4" />
          <span>Sign in or create account</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
