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
            <a href="#platform" className="text-sm text-white/60 hover:text-white transition-colors">Platform</a>
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

      {/* Technology Section */}
      <section
        id="technology"
        ref={techAnim.ref}
        className={`relative min-h-screen flex items-center py-32 px-8 bg-black transition-all duration-1000 ${techAnim.isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-1000 delay-200 ${techAnim.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <span className="text-sm font-medium text-cyan-400 uppercase tracking-widest mb-4 block">Technology</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Built on<br />
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Next-Gen</span> Architecture
              </h2>
              <p className="text-lg text-white/60 mb-10 leading-relaxed">
                EnviroNex leverages the most advanced computing paradigms to deliver environmental predictions
                with unprecedented accuracy and speed.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Zap, title: 'IBM Quantum Runtime', desc: 'Real quantum circuit execution for complex climate modeling' },
                  { icon: Shield, title: 'Agentic AI Systems', desc: 'Autonomous agents that navigate, analyze, and act on environmental data' },
                  { icon: Activity, title: 'Real-Time Processing', desc: 'Sub-second data ingestion from 500+ global monitoring stations' }
                ].map((item, i) => (
                  <div
                    key={item.title}
                    className={`group flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10 duration-700`}
                    style={{ transitionDelay: `${400 + i * 100}ms`, opacity: techAnim.isVisible ? 1 : 0, transform: techAnim.isVisible ? 'translateY(0)' : 'translateY(20px)' }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <item.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-white/50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Element */}
            <div className={`relative aspect-square hidden lg:flex items-center justify-center transition-all duration-1000 delay-500 ${techAnim.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <div className="absolute w-96 h-96 rounded-full border border-white/10 animate-[spin_30s_linear_infinite]" />
              <div className="absolute w-80 h-80 rounded-full border border-white/5 animate-[spin_25s_linear_infinite_reverse]" />
              <div className="absolute w-64 h-64 rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 blur-2xl" />
              <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
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

      {/* Capabilities Section */}
      <section
        id="capabilities"
        ref={capAnim.ref}
        className={`relative py-32 px-8 bg-black transition-all duration-1000 ${capAnim.isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 transition-all duration-1000 ${capAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-sm font-medium text-cyan-400 uppercase tracking-widest mb-4 block">Capabilities</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Environmental Defense<br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Reimagined</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Quantum Climate Modeling', value: '97.3%', desc: 'Prediction accuracy with quantum advantage', gradient: 'from-violet-500 to-purple-600' },
              { title: 'Disaster Detection', value: '< 1s', desc: 'Real-time event identification and alerting', gradient: 'from-rose-500 to-red-600' },
              { title: 'Air Quality Index', value: '500+', desc: 'Cities monitored in real-time globally', gradient: 'from-cyan-500 to-blue-600' },
              { title: 'Agentic Response', value: '24/7', desc: 'Autonomous monitoring and intervention', gradient: 'from-emerald-500 to-green-600' },
              { title: 'Data Processing', value: '10TB+', desc: 'Environmental data analyzed daily', gradient: 'from-amber-500 to-orange-600' },
              { title: 'API Uptime', value: '99.99%', desc: 'Enterprise-grade reliability', gradient: 'from-pink-500 to-rose-600' },
            ].map((cap, i) => (
              <div
                key={cap.title}
                className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 hover:bg-white/[0.04] overflow-hidden"
                style={{
                  transitionDelay: `${200 + i * 100}ms`,
                  opacity: capAnim.isVisible ? 1 : 0,
                  transform: capAnim.isVisible ? 'translateY(0)' : 'translateY(30px)'
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cap.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${cap.gradient} bg-clip-text text-transparent mb-2`}>
                    {cap.value}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{cap.title}</h3>
                  <p className="text-sm text-white/50">{cap.desc}</p>
                </div>
              </div>
            ))}
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