import { useState, useEffect, useRef } from 'react';
import { Globe, Search, AlertTriangle, ArrowRight, Sparkles, Zap, Bot, Brain, Cpu } from 'lucide-react';

interface HomeScreenProps {
  onStartExploring: () => void;
  onQuickStart: (type: 'search' | 'globe' | 'disasters') => void;
}

export const HomeScreen = ({ onStartExploring, onQuickStart }: HomeScreenProps) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollY(containerRef.current.scrollTop);
      }
    };
    
    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-[hsl(222,47%,6%)] z-50 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin"
    >
      {/* Animated gradient orbs with parallax */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent blur-[120px] animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-emerald-500/15 via-teal-500/10 to-transparent blur-[100px] animate-pulse"
          style={{ transform: `translateY(${scrollY * -0.2}px)`, animationDelay: '1s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-blue-500/5 to-transparent blur-[80px]"
          style={{ transform: `translate(-50%, calc(-50% + ${scrollY * 0.1}px))` }}
        />
        <div 
          className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-purple-500/10 via-violet-500/5 to-transparent blur-[100px]"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Navigation */}
      <nav className={`sticky top-0 z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full transition-all duration-700 backdrop-blur-md bg-[hsl(222,47%,6%)]/80 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 opacity-30 blur-md -z-10 animate-pulse" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">EnviroCast</span>
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
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-20 min-h-screen">
        {/* Badge */}
        <div className={`mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-xl transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-gray-300">Quantum-Agentic AI Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className={`text-center max-w-4xl mx-auto mb-6 text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[1.1] bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          EnviroNex
        </h1>

        {/* Subtitle */}
        <p className={`text-lg md:text-xl text-gray-400 text-center max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          The world's first <span className="text-cyan-400 font-medium">Quantum-Enhanced</span> environmental platform with 
          <span className="text-blue-400 font-medium"> Agentic AI</span> that autonomously monitors, predicts, and protects.
        </p>

        {/* Action Cards */}
        <div className={`flex flex-col sm:flex-row items-center gap-4 mb-16 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            { id: 'search', label: 'Search City', icon: Search, description: 'Find any location' },
            { id: 'globe', label: 'Explore Globe', icon: Globe, description: 'Interactive 3D view' },
            { id: 'disasters', label: 'Live Events', icon: AlertTriangle, description: 'Real-time alerts' }
          ].map((action, index) => (
            <button
              key={action.id}
              onClick={() => onQuickStart(action.id as 'search' | 'globe' | 'disasters')}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              style={{ transitionDelay: `${800 + index * 100}ms` }}
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
      </main>

      {/* Features section promoting Quantum, AI, Agentic */}
      <section className={`relative z-10 px-8 py-24 max-w-6xl mx-auto transition-all duration-700 delay-[1000ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          Powered by <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Next-Gen Technology</span>
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          Experience the future of environmental intelligence with cutting-edge quantum computing and autonomous AI agents.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: Cpu, 
              title: 'IBM Quantum', 
              description: 'Harness real quantum hardware for predictions that classical computers simply cannot achieve. 127-qubit processing power.',
              gradient: 'from-blue-500/20 to-indigo-500/20',
              iconColor: 'text-blue-400'
            },
            { 
              icon: Bot, 
              title: 'Agentic AI', 
              description: 'Autonomous AI agents that understand context, execute complex tasks, and adapt to your needs in real-time.',
              gradient: 'from-cyan-500/20 to-teal-500/20',
              iconColor: 'text-cyan-400'
            },
            { 
              icon: Brain, 
              title: 'EnviroAI', 
              description: 'Advanced neural networks trained on petabytes of environmental data for unmatched accuracy and insights.',
              gradient: 'from-emerald-500/20 to-green-500/20',
              iconColor: 'text-emerald-400'
            }
          ].map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 hover:scale-[1.02]"
              style={{ transitionDelay: `${1100 + index * 100}ms` }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats section */}
      <section className={`relative z-10 px-8 py-16 max-w-6xl mx-auto transition-all duration-700 delay-[1200ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '10K+', label: 'Cities Monitored' },
            { value: '127', label: 'Qubits Processing' },
            { value: '99.7%', label: 'Prediction Accuracy' },
            { value: '24/7', label: 'Real-time Updates' }
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={`relative z-10 px-8 py-24 text-center transition-all duration-700 delay-[1300ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <button 
          onClick={onStartExploring}
          className="px-8 py-4 text-lg font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
        >
          Start Exploring Now
        </button>
      </section>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </div>
  );
};

export default HomeScreen;
