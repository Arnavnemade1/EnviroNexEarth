import { useState, useEffect, useRef } from 'react';
import { Globe, ArrowRight, ChevronDown, Zap, Shield, Activity, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HomeScreenProps {
  onStartExploring: () => void;
  onQuickStart: (type: 'search' | 'globe' | 'disasters') => void;
  onOpenDashboard?: () => void;
}

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

export const HomeScreen = ({ onStartExploring }: HomeScreenProps) => {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Animation refs for each section
  const techAnim = useScrollAnimation();
  const capAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();
  const video1Anim = useScrollAnimation();
  const video2Anim = useScrollAnimation();
  const video3Anim = useScrollAnimation();

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col overflow-y-auto overflow-x-hidden"
    >
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-black/80 backdrop-blur-xl' : ''}`}>
        <div className={`flex items-center justify-between px-8 lg:px-16 py-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">EnviroCast</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <a href="#technology" className="text-sm text-white/60 hover:text-white transition-colors">Technology</a>
            <a href="#capabilities" className="text-sm text-white/60 hover:text-white transition-colors">Capabilities</a>
            <a href="/predictions" className="text-sm text-white/60 hover:text-white transition-colors">Predictions</a>
            <a href="/explore" className="text-sm text-white/60 hover:text-white transition-colors">Model Lab</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={onStartExploring}
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <User className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <a href="/auth" className="text-sm text-white/60 hover:text-white transition-colors">Sign In</a>
            )}
            <button
              onClick={onStartExploring}
              className="group px-5 py-2.5 text-sm font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-all flex items-center gap-2"
            >
              Launch Platform
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video */}
      <section className="relative min-h-screen flex flex-col items-center justify-center">
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute w-full h-full object-cover"
            style={{ filter: 'brightness(0.6)' }}
          >
            <source src="https://videos.pexels.com/video-files/1851190/1851190-uhd_3840_2160_25fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center px-8">
          <div className={`mb-8 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Quantum-Powered Environmental Intelligence
            </span>
          </div>

          <h1 className={`text-6xl md:text-7xl lg:text-[140px] font-bold tracking-[-0.03em] leading-[0.85] mb-8 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-white">Enviro</span>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">Nex</span>
          </h1>

          <p className={`text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed font-light transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            The first platform combining <span className="text-white font-medium">IBM Quantum Computing</span>,
            <span className="text-white font-medium"> Agentic AI</span>, and real-time environmental data
            to predict and protect our planet's future.
          </p>

          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button
              onClick={onStartExploring}
              className="group px-10 py-5 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all hover:shadow-2xl hover:shadow-white/20 text-lg flex items-center gap-3"
            >
              Enter Platform
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col items-center gap-2 text-white/50">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Video Divider 1 - Ocean */}
      <section
        ref={video1Anim.ref}
        className={`relative h-[60vh] overflow-hidden transition-all duration-1000 ${video1Anim.isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute w-full h-full object-cover"
          style={{ filter: 'brightness(0.5)' }}
        >
          <source src="https://videos.pexels.com/video-files/3194277/3194277-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className={`relative z-10 h-full flex items-center justify-center transition-all duration-1000 delay-300 ${video1Anim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center">
            <span className="text-sm font-medium text-cyan-400 uppercase tracking-widest block mb-4">Ocean Intelligence</span>
            <h3 className="text-3xl md:text-5xl font-bold text-white">Monitoring Earth's Waters</h3>
          </div>
        </div>
      </section>

      {/* Technology Section - Premium Redesign */}
      <section
        id="technology"
        ref={techAnim.ref}
        className={`relative min-h-screen flex items-center py-32 px-8 bg-black transition-all duration-1000 ${techAnim.isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className={`transition-all duration-1000 delay-200 ${techAnim.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 uppercase tracking-[0.2em] mb-6">
                <span className="w-8 h-px bg-gradient-to-r from-cyan-400 to-transparent" />
                Technology
              </span>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.05]">
                Built on<br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">Next-Gen</span>
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 rounded-full opacity-50" />
                </span> Architecture
              </h2>
              <p className="text-xl text-white/50 mb-12 leading-relaxed max-w-lg">
                EnviroNex leverages the most advanced computing paradigms to deliver environmental predictions
                with unprecedented accuracy and speed.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Zap, title: 'IBM Quantum Runtime', desc: 'Real quantum circuit execution for complex climate modeling', color: 'cyan', glow: 'shadow-cyan-500/20' },
                  { icon: Shield, title: 'Agentic AI Systems', desc: 'Autonomous agents that navigate, analyze, and act on environmental data', color: 'emerald', glow: 'shadow-emerald-500/20' },
                  { icon: Activity, title: 'Real-Time Processing', desc: 'Sub-second data ingestion from 500+ global monitoring stations', color: 'violet', glow: 'shadow-violet-500/20' }
                ].map((item, i) => (
                  <div
                    key={item.title}
                    className={`group relative flex gap-5 p-5 rounded-2xl transition-all cursor-pointer duration-500 hover:scale-[1.02]
                      bg-gradient-to-r from-white/[0.03] to-transparent
                      border border-white/[0.06] hover:border-${item.color}-500/30
                      backdrop-blur-xl hover:shadow-2xl ${item.glow}`}
                    style={{ transitionDelay: `${400 + i * 150}ms`, opacity: techAnim.isVisible ? 1 : 0, transform: techAnim.isVisible ? 'translateY(0)' : 'translateY(20px)' }}
                  >
                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-${item.color}-500/0 via-${item.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className={`relative w-14 h-14 rounded-xl bg-${item.color}-500/10 flex items-center justify-center 
                      group-hover:bg-${item.color}-500/20 transition-all duration-300
                      ring-1 ring-${item.color}-500/20 group-hover:ring-${item.color}-500/40
                      group-hover:shadow-lg group-hover:shadow-${item.color}-500/20`}>
                      <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                    </div>
                    <div className="relative">
                      <h3 className="font-bold text-white text-lg mb-1.5 group-hover:text-cyan-50 transition-colors">{item.title}</h3>
                      <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors leading-relaxed">{item.desc}</p>
                    </div>
                    <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/0 group-hover:text-white/40 transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                ))}
              </div>

              {/* API Callout */}
              <div className="mt-10 p-4 rounded-xl bg-gradient-to-r from-white/[0.02] to-transparent border border-white/[0.06] flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/60">Integrate our API into your applications</p>
                  <p className="text-sm font-mono text-cyan-400">api.envirocast.org</p>
                </div>
              </div>
            </div>

            {/* Visual Element - Enhanced */}
            <div className={`relative aspect-square hidden lg:flex items-center justify-center transition-all duration-1000 delay-500 ${techAnim.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              {/* Outer glow */}
              <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-emerald-500/10 rounded-full blur-3xl animate-pulse" />
              
              {/* Concentric rings with glow */}
              <div className="absolute w-96 h-96 rounded-full border border-white/10 animate-[spin_40s_linear_infinite]">
                <div className="absolute top-0 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
              </div>
              <div className="absolute w-80 h-80 rounded-full border border-cyan-500/20 animate-[spin_30s_linear_infinite_reverse]">
                <div className="absolute bottom-0 left-1/2 w-2 h-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              </div>
              <div className="absolute w-64 h-64 rounded-full border border-emerald-500/20 animate-[spin_25s_linear_infinite]">
                <div className="absolute right-0 top-1/2 w-2 h-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
              </div>
              <div className="absolute w-48 h-48 rounded-full border border-violet-500/20 animate-[spin_20s_linear_infinite_reverse]" />
              
              {/* Center core */}
              <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-emerald-500/20 blur-2xl animate-pulse" />
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-2xl shadow-cyan-400/50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              
              {/* Floating particles */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-cyan-400/60"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                    animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Divider 2 - Forest */}
      <section
        ref={video2Anim.ref}
        className={`relative h-[60vh] overflow-hidden transition-all duration-1000 ${video2Anim.isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute w-full h-full object-cover"
          style={{ filter: 'brightness(0.5)' }}
        >
          <source src="https://videos.pexels.com/video-files/3141207/3141207-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className={`relative z-10 h-full flex items-center justify-center transition-all duration-1000 delay-300 ${video2Anim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center">
            <span className="text-sm font-medium text-emerald-400 uppercase tracking-widest block mb-4">Forest Systems</span>
            <h3 className="text-3xl md:text-5xl font-bold text-white">Protecting Global Ecosystems</h3>
          </div>
        </div>
      </section>

      {/* Capabilities Section - Premium Redesign */}
      <section
        id="capabilities"
        ref={capAnim.ref}
        className={`relative py-32 px-8 bg-black transition-all duration-1000 ${capAnim.isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`text-center mb-20 transition-all duration-1000 ${capAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-3 text-sm font-semibold text-cyan-400 uppercase tracking-[0.2em] mb-6">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-cyan-400" />
              Capabilities
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-cyan-400" />
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Environmental Defense<br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">Reimagined</span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 rounded-full opacity-40" />
              </span>
            </h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto mt-6">
              Enterprise-grade environmental intelligence powered by quantum computing and agentic AI systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Quantum Climate Modeling', value: '97.3%', desc: 'Prediction accuracy with quantum advantage', gradient: 'from-violet-500 to-purple-600', textColor: 'text-violet-400', bgGlow: 'bg-violet-500/10' },
              { title: 'Disaster Detection', value: '< 1s', desc: 'Real-time event identification and alerting', gradient: 'from-rose-500 to-red-600', textColor: 'text-rose-400', bgGlow: 'bg-rose-500/10' },
              { title: 'Air Quality Index', value: '500+', desc: 'Cities monitored in real-time globally', gradient: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-400', bgGlow: 'bg-cyan-500/10' },
              { title: 'Agentic Response', value: '24/7', desc: 'Autonomous monitoring and intervention', gradient: 'from-emerald-500 to-green-600', textColor: 'text-emerald-400', bgGlow: 'bg-emerald-500/10' },
              { title: 'Data Processing', value: '10TB+', desc: 'Environmental data analyzed daily', gradient: 'from-amber-500 to-orange-600', textColor: 'text-amber-400', bgGlow: 'bg-amber-500/10' },
              { title: 'API Uptime', value: '99.99%', desc: 'Enterprise-grade reliability at api.envirocast.org', gradient: 'from-pink-500 to-rose-600', textColor: 'text-pink-400', bgGlow: 'bg-pink-500/10' },
            ].map((cap, i) => (
              <div
                key={cap.title}
                className="group relative p-8 rounded-3xl transition-all duration-500 overflow-hidden cursor-pointer hover:scale-[1.02]"
                style={{
                  transitionDelay: `${200 + i * 100}ms`,
                  opacity: capAnim.isVisible ? 1 : 0,
                  transform: capAnim.isVisible ? 'translateY(0)' : 'translateY(30px)'
                }}
              >
                {/* Card background with gradient border */}
                <div className="absolute inset-0 rounded-3xl bg-white/[0.02] border border-white/[0.08] group-hover:border-white/20 transition-colors duration-500" />
                
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-3xl ${cap.bgGlow} opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl`} />
                
                {/* Inner glow line */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r ${cap.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Value with gradient */}
                  <div className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${cap.gradient} bg-clip-text text-transparent mb-4 tracking-tight`}>
                    {cap.value}
                  </div>
                  
                  {/* Title with icon indicator */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${cap.gradient} shadow-lg`} />
                    <h3 className="text-lg font-bold text-white">{cap.title}</h3>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-white/40 leading-relaxed">{cap.desc}</p>
                </div>

                {/* Corner accent */}
                <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl ${cap.gradient} opacity-[0.03] rounded-tl-full`} />
              </div>
            ))}
          </div>

          {/* API CTA Banner */}
          <div className={`mt-16 p-8 rounded-3xl bg-gradient-to-r from-white/[0.03] via-cyan-500/[0.05] to-white/[0.03] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-1000 delay-700 ${capAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center ring-1 ring-cyan-500/30">
                <Zap className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-1">Developer API</h4>
                <p className="text-white/50">Integrate environmental intelligence into your applications</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <code className="px-5 py-3 rounded-xl bg-black/50 border border-white/10 font-mono text-cyan-400 text-sm">
                api.envirocast.org
              </code>
              <button className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors flex items-center gap-2">
                Documentation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Divider 3 - Atmosphere */}
      <section
        ref={video3Anim.ref}
        className={`relative h-[60vh] overflow-hidden transition-all duration-1000 ${video3Anim.isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute w-full h-full object-cover"
          style={{ filter: 'brightness(0.5)' }}
        >
          <source src="https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className={`relative z-10 h-full flex items-center justify-center transition-all duration-1000 delay-300 ${video3Anim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center">
            <span className="text-sm font-medium text-blue-400 uppercase tracking-widest block mb-4">Atmospheric Analysis</span>
            <h3 className="text-3xl md:text-5xl font-bold text-white">Predicting Climate Patterns</h3>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        ref={ctaAnim.ref}
        className={`relative min-h-[70vh] flex items-center justify-center py-32 px-8 overflow-hidden transition-all duration-1000 ${ctaAnim.isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute w-full h-full object-cover"
          style={{ filter: 'brightness(0.25)' }}
        >
          <source src="https://videos.pexels.com/video-files/3129595/3129595-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />

        <div className={`relative z-10 max-w-4xl mx-auto text-center transition-all duration-1000 delay-300 ${ctaAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8">
            Ready to see the<br />
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">future of Earth?</span>
          </h2>

          <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
            Join the platform redefining environmental intelligence with quantum computing and autonomous AI.
          </p>

          <button
            onClick={onStartExploring}
            className="group inline-flex items-center gap-3 px-12 py-6 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all hover:shadow-2xl hover:shadow-white/10 text-lg"
          >
            Launch EnviroNex
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 lg:px-16 py-12 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-white/50">EnviroNex © 2024. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;