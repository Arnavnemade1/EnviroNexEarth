import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface HomeScreenProps {
  onStartExploring: () => void;
  onQuickStart: (type: 'search' | 'globe' | 'disasters') => void;
}

export const HomeScreen = ({ onStartExploring, onQuickStart }: HomeScreenProps) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(240, 70%, 35%) 0%, hsl(280, 60%, 40%) 35%, hsl(320, 70%, 50%) 70%, hsl(350, 80%, 60%) 100%)'
        }}
      />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-semibold text-white/90">EnviroNex</span>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="/auth" 
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Sign In
          </a>
          <button 
            onClick={onStartExploring}
            className="px-5 py-2 text-sm font-medium bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
        {/* Hero Title */}
        <h1 className="text-center mb-8">
          <span className="block text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white tracking-tight leading-[1.05]">
            Monitor Earth's
          </span>
          <span className="block text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white tracking-tight leading-[1.05]">
            Vital Signs
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/70 text-center max-w-xl mx-auto mb-12">
          Real-time air quality intelligence and quantum-enhanced environmental predictions.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {[
            { id: 'search', label: 'Search City' },
            { id: 'globe', label: 'Explore Globe' },
            { id: 'disasters', label: 'Live Events' }
          ].map((action) => (
            <button
              key={action.id}
              onClick={() => onQuickStart(action.id as 'search' | 'globe' | 'disasters')}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              className={`group relative flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 ${
                hoveredAction === action.id
                  ? 'bg-white text-gray-900 shadow-2xl shadow-white/20'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              } backdrop-blur-sm`}
            >
              <span className="font-medium">{action.label}</span>
              <ArrowRight className={`w-4 h-4 transition-all duration-300 ${
                hoveredAction === action.id 
                  ? 'translate-x-1' 
                  : ''
              }`} />
            </button>
          ))}
        </div>

        {/* Simple text tags */}
        <div className="flex items-center gap-6 text-sm text-white/50">
          <span>Quantum-Powered</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>AI Analysis</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>Real-time Data</span>
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
