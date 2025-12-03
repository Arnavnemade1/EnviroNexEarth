import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Search, AlertTriangle, ArrowRight, Sparkles, Wind, Heart } from 'lucide-react';

interface HomeScreenProps {
  onStartExploring: () => void;
  onQuickStart: (type: 'search' | 'globe' | 'disasters') => void;
}

export const HomeScreen = ({ onStartExploring, onQuickStart }: HomeScreenProps) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Minimal Ambient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl px-8 flex flex-col items-center justify-center min-h-screen">

        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 mb-6 shadow-lg shadow-blue-500/10">
            <Globe className="w-8 h-8 text-blue-400" />
          </div>

          {/* Title */}
          <h1 className="text-6xl font-bold tracking-tighter mb-4 text-white">
            EnviroNex
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Real-time air quality intelligence. Quantum-enhanced forecasts. Actionable insights for every breath you take.
          </p>
        </div>

        {/* Quick Start Grid */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mb-12">
          {[
            { id: 'search', title: 'Search', description: 'Any city worldwide', icon: Search },
            { id: 'globe', title: 'Explore', description: 'Interactive globe', icon: Globe },
            { id: 'disasters', title: 'Events', description: 'Live monitoring', icon: AlertTriangle }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onQuickStart(item.id as 'search' | 'globe' | 'disasters')}
              onMouseEnter={() => setActiveFeature(item.id)}
              onMouseLeave={() => setActiveFeature(null)}
              className={`group relative p-6 rounded-2xl transition-all duration-300 ${
                activeFeature === item.id
                  ? 'bg-white/10 border border-blue-400/50 shadow-lg shadow-blue-500/20'
                  : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] hover:border-white/20'
              } backdrop-blur-2xl`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto transition-all ${
                activeFeature === item.id
                  ? 'bg-blue-500/30 text-blue-300'
                  : 'bg-white/5 text-gray-400'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.description}</p>
              <ArrowRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300 ${
                activeFeature === item.id ? 'opacity-100 translate-x-0 text-blue-400' : 'opacity-0 -translate-x-2 text-gray-600'
              }`} />
            </button>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          onClick={onStartExploring}
          className="group relative px-8 py-3 mb-8 rounded-xl bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 text-white font-semibold text-base transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 flex items-center gap-2"
        >
          <span>Start Exploring</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Features Row */}
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Analysis</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-600" />
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span>Quantum Forecasts</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-600" />
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-blue-300" />
            <span>Health Insights</span>
          </div>
        </div>

        {/* Bottom Link */}
        <div className="absolute bottom-8 text-sm text-gray-500">
          <a href="/auth" className="inline-flex items-center gap-2 hover:text-gray-300 transition-colors group">
            <span>Have an account?</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
