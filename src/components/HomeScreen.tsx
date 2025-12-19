import { useState, useEffect, useRef } from 'react';
import { Globe, ArrowRight, ChevronDown, Zap, Shield, Activity, Play } from 'lucide-react';

interface HomeScreenProps {
  onStartExploring: () => void;
  onQuickStart: (type: 'search' | 'globe' | 'disasters') => void;
}

export const HomeScreen = ({ onStartExploring }: HomeScreenProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollY(container.scrollTop);
      const sectionHeight = window.innerHeight;
      setActiveSection(Math.floor(container.scrollTop / sectionHeight));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-background z-50 flex flex-col overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
    >
      {/* Cinematic gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary ambient glow following mouse */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[150px] transition-all duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            left: `${mousePosition.x - 400}px`,
            top: `${mousePosition.y - 400}px`,
          }}
        />
        
        {/* Static ambient orbs */}
        <div 
          className="absolute top-0 right-0 w-[1000px] h-[1000px] rounded-full opacity-10 blur-[200px]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 60%)',
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full opacity-10 blur-[180px]"
          style={{
            background: 'radial-gradient(circle, hsl(195 91% 55%) 0%, transparent 60%)',
            transform: `translateY(${scrollY * -0.15}px)`,
          }}
        />
      </div>

      {/* Subtle grid */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.5) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Minimal Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrollY > 50 ? 'bg-background/80 backdrop-blur-xl border-b border-border/20' : ''}`}>
        <div className={`flex items-center justify-between px-8 lg:px-16 py-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">EnviroCast</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#platform" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Platform</a>
            <a href="#technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Technology</a>
            <a href="#capabilities" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Capabilities</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </a>
            <button 
              onClick={onStartExploring}
              className="group px-5 py-2.5 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all flex items-center gap-2"
            >
              Launch Platform
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Viewport */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 snap-start">
        {/* Animated video/visual placeholder */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className={`absolute inset-0 transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% 50%, hsl(var(--primary) / 0.08) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 70% 60%, hsl(var(--secondary) / 0.05) 0%, transparent 40%)
              `
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Overline */}
          <div className={`mb-8 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Quantum-Powered Environmental Intelligence
            </span>
          </div>

          {/* Main headline */}
          <h1 className={`text-6xl md:text-7xl lg:text-[120px] font-bold tracking-[-0.02em] leading-[0.9] mb-8 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-foreground">Enviro</span>
            <span className="bg-gradient-to-r from-primary via-earth-blue to-secondary bg-clip-text text-transparent">Nex</span>
          </h1>

          {/* Subheadline */}
          <p className={`text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-light transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            The first platform combining <span className="text-foreground font-medium">IBM Quantum Computing</span>, 
            <span className="text-foreground font-medium"> Agentic AI</span>, and real-time environmental data 
            to predict and protect our planet's future.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button 
              onClick={onStartExploring}
              className="group relative px-8 py-4 bg-foreground text-background font-medium rounded-xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                Enter Platform
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button className="group flex items-center gap-3 px-8 py-4 text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              <span className="font-medium">Watch Demo</span>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="relative min-h-screen flex items-center py-32 px-8 snap-start">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <span className="text-sm font-medium text-primary uppercase tracking-widest mb-4 block">Technology</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Built on<br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Next-Gen</span> Architecture
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                EnviroNex leverages the most advanced computing paradigms to deliver environmental predictions 
                with unprecedented accuracy and speed.
              </p>

              {/* Tech list */}
              <div className="space-y-6">
                {[
                  { icon: Zap, title: 'IBM Quantum Runtime', desc: 'Real quantum circuit execution for complex climate modeling' },
                  { icon: Shield, title: 'Agentic AI Systems', desc: 'Autonomous agents that navigate, analyze, and act on environmental data' },
                  { icon: Activity, title: 'Real-Time Processing', desc: 'Sub-second data ingestion from 500+ global monitoring stations' }
                ].map((item, i) => (
                  <div key={item.title} className="group flex gap-4 p-4 rounded-xl hover:bg-card/50 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative aspect-square">
              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full border border-border/30 animate-[spin_30s_linear_infinite]" />
                <div className="absolute w-[80%] h-[80%] rounded-full border border-border/20 animate-[spin_25s_linear_infinite_reverse]" />
                <div className="absolute w-[60%] h-[60%] rounded-full border border-border/10 animate-[spin_20s_linear_infinite]" />
                
                {/* Center glow */}
                <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl" />
                
                {/* Orbiting elements */}
                <div className="absolute w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50" style={{ animation: 'orbit 8s linear infinite', transformOrigin: 'center center' }} />
                <div className="absolute w-3 h-3 rounded-full bg-secondary shadow-lg shadow-secondary/50" style={{ animation: 'orbit 12s linear infinite reverse', transformOrigin: 'center center' }} />
              </div>
              
              <style>{`
                @keyframes orbit {
                  from { transform: rotate(0deg) translateX(140px) rotate(0deg); }
                  to { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
                }
              `}</style>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="relative min-h-screen py-32 px-8 snap-start">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm font-medium text-primary uppercase tracking-widest mb-4 block">Capabilities</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Environmental Defense<br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Reimagined</span>
            </h2>
          </div>

          {/* Capabilities grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Quantum Climate Modeling', value: '97.3%', desc: 'Prediction accuracy with quantum advantage', gradient: 'from-violet-500 to-purple-600' },
              { title: 'Disaster Detection', value: '< 1s', desc: 'Real-time event identification and alerting', gradient: 'from-rose-500 to-red-600' },
              { title: 'Air Quality Index', value: '500+', desc: 'Cities monitored in real-time globally', gradient: 'from-cyan-500 to-blue-600' },
              { title: 'Agentic Response', value: '24/7', desc: 'Autonomous monitoring and intervention', gradient: 'from-emerald-500 to-green-600' },
              { title: 'Data Processing', value: '10TB+', desc: 'Environmental data analyzed daily', gradient: 'from-amber-500 to-orange-600' },
              { title: 'API Uptime', value: '99.99%', desc: 'Enterprise-grade reliability', gradient: 'from-pink-500 to-rose-600' },
            ].map((cap) => (
              <div 
                key={cap.title}
                className="group relative p-8 rounded-2xl bg-card/30 border border-border/30 hover:border-primary/30 transition-all duration-500 hover:bg-card/50 overflow-hidden"
              >
                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cap.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${cap.gradient} bg-clip-text text-transparent mb-2`}>
                    {cap.value}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{cap.title}</h3>
                  <p className="text-sm text-muted-foreground">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center py-32 px-8 snap-start">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-8">
            Ready to see the<br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">future of Earth?</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join the platform redefining environmental intelligence with quantum computing and autonomous AI.
          </p>

          <button 
            onClick={onStartExploring}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-foreground text-background font-semibold rounded-xl hover:shadow-2xl hover:shadow-primary/20 transition-all text-lg"
          >
            Launch EnviroNex
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative z-10 px-8 lg:px-16 py-12 border-t border-border/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">EnviroNex © 2024. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
