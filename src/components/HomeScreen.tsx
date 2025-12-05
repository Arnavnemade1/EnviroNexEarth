import { useState } from 'react';
import { Globe, Search, AlertTriangle, ArrowRight, Sparkles, Zap, Activity } from 'lucide-react';

interface HomeScreenProps {
  onStartExploring: () => void;
  onQuickStart: (type: 'search' | 'globe' | 'disasters') => void;
}

export const HomeScreen = ({ onStartExploring, onQuickStart }: HomeScreenProps) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-[hsl(222,47%,6%)] z-50 flex flex-col overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-emerald-500/15 via-teal-500/10 to-transparent blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-blue-500/5 to-transparent blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 opacity-30 blur-md -z-10" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">EnviroNex</span>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href="/auth" 
            className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </a>
          <button 
            onClick={onStartExploring}
            className="px-5 py-2.5 text-sm font-medium bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all hover:shadow-lg hover:shadow-white/20"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 -mt-16">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-gray-300">Quantum-Powered Environmental Intelligence</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-center max-w-4xl mx-auto mb-6">
          <span className="block text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1]">
            Monitor Earth's
          </span>
          <span className="block text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            vital signs
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 text-center max-w-2xl mx-auto mb-12 leading-relaxed">
          Real-time air quality data, quantum-enhanced predictions, and AI-powered insights. 
          Make informed decisions about the air you breathe.
        </p>

        {/* Action Cards */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          {[
            { id: 'search', label: 'Search City', icon: Search, description: 'Find any location' },
            { id: 'globe', label: 'Explore Globe', icon: Globe, description: 'Interactive 3D view' },
            { id: 'disasters', label: 'Live Events', icon: AlertTriangle, description: 'Real-time alerts' }
          ].map((action) => (
            <button
              key={action.id}
              onClick={() => onQuickStart(action.id as 'search' | 'globe' | 'disasters')}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 min-w-[200px] ${
                hoveredAction === action.id
                  ? 'bg-white/[0.1] border-white/20 shadow-2xl shadow-blue-500/10 scale-[1.02]'
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
              } border backdrop-blur-xl`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                hoveredAction === action.id
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/40'
                  : 'bg-white/[0.05]'
              }`}>
                <action.icon className={`w-5 h-5 transition-colors duration-300 ${
                  hoveredAction === action.id ? 'text-white' : 'text-gray-400'
                }`} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white text-sm">{action.label}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
              <ArrowRight className={`w-4 h-4 ml-auto transition-all duration-300 ${
                hoveredAction === action.id 
                  ? 'opacity-100 translate-x-0 text-blue-400' 
                  : 'opacity-0 -translate-x-2 text-gray-600'
              }`} />
            </button>
          ))}
        </div>

        {/* Feature Pills */}
        <div className="flex items-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>IBM Quantum</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-700" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>EnviroAI</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-700" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Real-time Data</span>
          </div>
        </div>
      </main>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </div>
  );
};

export default HomeScreen;
