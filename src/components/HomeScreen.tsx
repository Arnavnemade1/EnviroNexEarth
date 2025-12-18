import { useState, useEffect, useRef } from 'react';
import { Globe, Search, AlertTriangle, ArrowRight, Sparkles, Cpu, Bot, Brain, ChevronDown } from 'lucide-react';

interface HomeScreenProps {
  onStartExploring: () => void;
  onQuickStart: (type: 'search' | 'globe' | 'disasters') => void;
}

// Floating particle component
const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-particle ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      {[...Array(15)].map((_, i) => (
        <div
          key={`glow-${i}`}
          className="absolute w-2 h-2 rounded-full bg-blue-400/30 blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-particle ${10 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 8}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes float-particle {
          0%, 100% { 
            transform: translateY(0) translateX(0) scale(1); 
            opacity: 0.3;
          }
          25% { 
            transform: translateY(-30px) translateX(10px) scale(1.2); 
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-50px) translateX(-10px) scale(1); 
            opacity: 0.4;
          }
          75% { 
            transform: translateY(-20px) translateX(15px) scale(0.8); 
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export const HomeScreen = ({ onStartExploring, onQuickStart }: HomeScreenProps) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollY(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { 
        root: container,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all sections with data-animate attribute
    const sections = container.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isLoaded]);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-[hsl(222,47%,6%)] z-50 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin"
    >
      {/* Floating particles */}
      <FloatingParticles />

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
              style={{ transitionDelay: `${700 + index * 100}ms` }}
              className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 min-w-[200px] ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${
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

        {/* Scroll indicator */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <ChevronDown className="w-6 h-6 text-gray-500 animate-bounce" />
        </div>
      </main>

      {/* Features Section */}
      <section
        id="features-section"
        data-animate
        className={`relative z-10 px-8 py-24 max-w-7xl mx-auto transition-all duration-1000 ${
          isVisible('features-section') ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="text-center mb-16">
          <p className="text-sm text-blue-400 font-medium mb-3">Powered by Advanced Technology</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Next-Generation Environmental Intelligence
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Experience the future of environmental monitoring with our cutting-edge tech stack
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Cpu, title: 'IBM Quantum', description: 'Leverage real quantum computing for unprecedented prediction accuracy', color: 'from-violet-500 to-purple-600' },
            { icon: Bot, title: 'Agentic AI', description: 'Intelligent assistant that controls and navigates the entire platform', color: 'from-cyan-500 to-blue-600' },
            { icon: Brain, title: 'EnviroAI', description: 'Advanced environmental analysis powered by cutting-edge AI models', color: 'from-emerald-500 to-green-600' }
          ].map((feature, index) => (
            <div
              key={feature.title}
              id={`feature-card-${index}`}
              data-animate
              className={`text-center transition-all duration-700 opacity-100 translate-y-0`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20 transform transition-transform duration-500 hover:scale-110`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Animated Orbs */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
          {/* Bubble 1 - Classic */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <style>{`
              @keyframes orb-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
              @keyframes orb-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
              @keyframes orb-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              .bubble-1 { animation: orb-pulse 4s ease-in-out infinite; }
              .bubble-1-inner { animation: orb-bounce 3s ease-in-out infinite; }
              .bubble-1-spinner { animation: orb-spin 4s linear infinite; }
            `}</style>
            <div className="bubble-1 absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl" />
            <div className="bubble-1-inner absolute w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-full" />
            <div className="bubble-1-spinner absolute w-32 h-32 bg-gradient-to-tr from-blue-400/30 to-transparent rounded-full" />
            <Sparkles className="relative w-12 h-12 text-cyan-400 z-10" />
          </div>

          {/* Bubble 2 - Orbiting */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <style>{`
              @keyframes orbit-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
              @keyframes orbit-circle { 0% { transform: rotate(0deg) translateX(60px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); } }
              .bubble-2-base { animation: orbit-float 3s ease-in-out infinite; }
              .bubble-2-particle { animation: orbit-circle 6s linear infinite; }
            `}</style>
            <div className="bubble-2-base absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/15 to-rose-500/10 rounded-full blur-3xl" />
            <div className="absolute w-40 h-40 rounded-full border border-purple-500/30 opacity-60" />
            <div className="absolute w-32 h-32 rounded-full border border-pink-500/20 opacity-40" />
            <div className="absolute w-4 h-4 bg-pink-500/60 rounded-full bubble-2-particle" />
            <div className="relative w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/40 z-10" />
          </div>

          {/* Bubble 3 - Shimmer */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <style>{`
              @keyframes shimmer-pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
              @keyframes shimmer-rotate { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.08); } 100% { transform: rotate(360deg) scale(1); } }
              @keyframes glow-pulse { 0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3), inset 0 0 20px rgba(34, 197, 94, 0.1); } 50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6), inset 0 0 30px rgba(34, 197, 94, 0.2); } }
              .bubble-3-base { animation: shimmer-pulse 3.5s ease-in-out infinite; }
              .bubble-3-spinner { animation: shimmer-rotate 5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
              .bubble-3-glow { animation: glow-pulse 3s ease-in-out infinite; }
            `}</style>
            <div className="bubble-3-base absolute inset-0 bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-cyan-500/10 rounded-full blur-3xl" />
            <div className="bubble-3-glow absolute w-52 h-52 border-2 border-emerald-500/40 rounded-full" />
            <div className="bubble-3-spinner absolute w-40 h-40 border border-emerald-400/50 rounded-full" />
            <div className="absolute w-2 h-2 bg-emerald-400 rounded-full" style={{ top: '40%', left: '60%' }} />
            <div className="absolute w-2 h-2 bg-emerald-400 rounded-full" style={{ top: '60%', right: '30%' }} />
            <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/50 z-10" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats-section"
        data-animate
        className="relative z-10 px-8 py-24 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '500+', label: 'Cities Monitored' },
            { value: '99.9%', label: 'Uptime' },
            { value: '< 1s', label: 'Response Time' },
            { value: '24/7', label: 'Real-time Updates' }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="text-center"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta-section"
        data-animate
        className="relative z-10 px-8 py-24"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to explore?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join thousands of users monitoring Earth's environmental health with quantum-powered precision.
          </p>
          <button
            onClick={onStartExploring}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 group"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-500">EnviroNex © 2024</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </div>
  );
};

export default HomeScreen;
