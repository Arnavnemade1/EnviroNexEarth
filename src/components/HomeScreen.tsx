import { useState, useEffect, useRef } from 'react';
import { Globe, ArrowRight, ChevronDown, Zap, Shield, Activity, User, AlertTriangle, Heart, Wind, Eye } from 'lucide-react';
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
            <span className="text-xl font-semibold text-white tracking-tight">EnviroNex</span>
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
              Evidence-first forecasting and proportional risk framing
            </span>
          </div>

          <h1 className={`text-6xl md:text-7xl lg:text-[140px] font-bold tracking-[-0.03em] leading-[0.85] mb-8 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-white">Enviro</span>
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">Nex</span>
          </h1>

          <p className={`text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed font-light transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Our mission is to ensure climate is <span className="text-white font-medium">accurately forecasted</span> with
            <span className="text-white font-medium"> real-world baselines</span> and transparent uncertainty, because many
            sources <span className="text-white font-medium">overblow pollutant effects</span> without proper context.
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

          <div className={`mt-10 flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-white/60 transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="px-4 py-2 rounded-full border border-emerald-400/30 bg-emerald-400/10">
              We believe climate risk is often presented without proportion.
            </div>
            <div className="px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/10">
              Our mission: accurate, contextualized climate forecasting.
            </div>
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
            <span className="text-sm font-medium text-cyan-400 uppercase tracking-widest block mb-4">Context Over Hype</span>
            <h3 className="text-3xl md:text-5xl font-bold text-white">Right-sizing Environmental Narratives</h3>
          </div>
        </div>
      </section>

      {/* Technology Section - Clean Premium Design */}
      <section
        id="technology"
        ref={techAnim.ref}
        className={`relative min-h-screen flex items-center py-32 px-8 bg-black transition-all duration-1000 ${techAnim.isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className={`transition-all duration-1000 delay-200 ${techAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Header */}
            <div className="mb-20">
              <span className="text-cyan-400 text-sm font-medium uppercase tracking-[0.25em] mb-6 block">
                Technology
              </span>
              <h2 className="text-5xl md:text-6xl lg:text-[80px] font-bold text-white leading-[1.1] mb-8">
                Engineered for<br />
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Proportional Risk</span>
              </h2>
              <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
                EnviroNex combines modern telemetry, rigorous baselines, and transparent modeling
                to separate signal from noise in climate reporting.
              </p>
            </div>

            {/* Feature List - Clean Minimal Style */}
            <div className="space-y-8">
              {[
                {
                  icon: Zap,
                  title: 'Baseline-Calibrated Modeling',
                  desc: 'Models tuned against long-run baselines so extremes are not overstated',
                  color: 'cyan'
                },
                {
                  icon: Shield,
                  title: 'Uncertainty Disclosure',
                  desc: 'Clear confidence ranges that prevent headline-driven misinterpretation',
                  color: 'cyan'
                },
                {
                  icon: Activity,
                  title: 'Telemetry Integrity',
                  desc: 'Cross-sourced ingestion that flags when datasets are skewed or politicized',
                  color: 'cyan'
                }
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="group flex items-start gap-6 py-6 border-b border-white/[0.06] last:border-0 cursor-pointer transition-all duration-500 hover:pl-2"
                  style={{
                    transitionDelay: `${300 + i * 100}ms`,
                    opacity: techAnim.isVisible ? 1 : 0,
                    transform: techAnim.isVisible ? 'translateY(0)' : 'translateY(20px)'
                  }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all duration-300">
                    <item.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-50 transition-colors">{item.title}</h3>
                    <p className="text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">{item.desc}</p>
                  </div>
                </div>
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
            <span className="text-sm font-medium text-emerald-400 uppercase tracking-widest block mb-4">Terrestrial Assets</span>
            <h3 className="text-3xl md:text-5xl font-bold text-white">Grounding Claims in Real Baselines</h3>
          </div>
        </div>
      </section>

      {/* Capabilities Section - Clean Premium Design */}
      <section
        id="capabilities"
        ref={capAnim.ref}
        className={`relative py-32 px-8 bg-black transition-all duration-1000 ${capAnim.isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-1000 ${capAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-5xl md:text-6xl lg:text-[80px] font-bold text-white mb-4">
              Climate Signal<br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Clarified</span>
            </h2>
          </div>

          {/* Stats Grid - Clean 2x3 */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { value: '97.3%', title: 'Baseline Fit', desc: 'Models anchored to long-run climate and pollutant baselines', color: 'violet' },
              { value: '< 1s', title: 'Context Recall', desc: 'Instant access to historical norms for any location', color: 'rose' },
              { value: '500+', title: 'Cross-Checks', desc: 'Multiple sources to avoid single-point narrative drift', color: 'cyan' },
              { value: '24/7', title: 'Drift Monitoring', desc: 'Detecting when claims diverge from observed signals', color: 'emerald' },
              { value: '10TB+', title: 'Data Footprint', desc: 'Telemetry used to verify proportional risk statements', color: 'amber' },
              { value: '99.99%', title: 'Data Availability', desc: 'Reliable access to current and historical data feeds', color: 'pink' },
            ].map((stat, i) => (
              <div
                key={stat.title}
                className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 cursor-pointer"
                style={{
                  transitionDelay: `${200 + i * 80}ms`,
                  opacity: capAnim.isVisible ? 1 : 0,
                  transform: capAnim.isVisible ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <div className={`text-5xl md:text-6xl font-bold mb-4 ${stat.color === 'violet' ? 'text-violet-400' :
                  stat.color === 'rose' ? 'text-rose-400' :
                    stat.color === 'cyan' ? 'text-cyan-400' :
                      stat.color === 'emerald' ? 'text-emerald-400' :
                        stat.color === 'amber' ? 'text-amber-400' :
                          'text-pink-400'
                  }`}>
                  {stat.value}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{stat.title}</h3>
                <p className="text-white/40 text-sm">{stat.desc}</p>
              </div>
            ))}
          </div>

          {/* API Banner - Minimal */}
          <div className={`mt-16 flex flex-col md:flex-row items-center justify-center gap-6 transition-all duration-1000 delay-700 ${capAnim.isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-white/40">Methodology, baselines, and update logs are published openly.</span>
            <code className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] font-mono text-cyan-400 text-sm">
              transparency.auraearth.org
            </code>
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
            <span className="text-sm font-medium text-blue-400 uppercase tracking-widest block mb-4">Balance & Context</span>
            <h3 className="text-3xl md:text-5xl font-bold text-white">Forecasting with Proportional Narratives</h3>
          </div>
        </div>
      </section>

      {/* Pollutant Context Section */}
      <section className="relative py-32 px-8 bg-gradient-to-b from-black via-sky-950/20 to-black">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              Proportional Risk Context
            </span>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Accurate Pollutant<br />
              <span className="text-cyan-400">Risk Framing</span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Many sites amplify pollutant risks without context. We report concentrations, historical norms,
              and location-specific baselines so users can make informed, proportional decisions.
            </p>
          </div>

          {/* Pollutant Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                name: 'PM2.5',
                fullName: 'Fine Particulate Matter',
                danger: 'Contextualized Exposure',
                description: 'Reported with seasonal norms and local baselines to prevent exaggerated impact claims',
                effect: 'Respiratory comfort, visibility',
                whoLimit: 'Reference Baseline: 12 μg/m³',
                color: 'orange',
                icon: Wind
              },
              {
                name: 'O₃',
                fullName: 'Ground-level Ozone',
                danger: 'Time-of-Day Sensitive',
                description: 'Shown with daily variance windows to avoid overemphasizing peaks',
                effect: 'Outdoor comfort, activity planning',
                whoLimit: 'Reference Baseline: 100 μg/m³',
                color: 'cyan',
                icon: Activity
              },
              {
                name: 'NO₂',
                fullName: 'Nitrogen Dioxide',
                danger: 'Urban Baseline Indicator',
                description: 'Interpreted against traffic-season norms, not single spikes',
                effect: 'Air clarity, irritation risk',
                whoLimit: 'Reference Baseline: 25 μg/m³',
                color: 'purple',
                icon: Eye
              },
              {
                name: 'SO₂',
                fullName: 'Sulfur Dioxide',
                danger: 'Industrial Baseline',
                description: 'Reported with long-run averages to avoid sensationalized reporting',
                effect: 'Respiratory comfort, odor sensitivity',
                whoLimit: 'Reference Baseline: 40 μg/m³',
                color: 'rose',
                icon: Heart
              }
            ].map((pollutant, i) => (
              <div
                key={pollutant.name}
                className={`group p-6 rounded-2xl bg-gradient-to-b from-${pollutant.color}-500/10 to-transparent border border-${pollutant.color}-500/20 hover:border-${pollutant.color}-500/40 transition-all duration-500`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-${pollutant.color}-500/20 flex items-center justify-center mb-4`}>
                  <pollutant.icon className={`w-6 h-6 text-${pollutant.color}-400`} />
                </div>

                <h3 className="text-3xl font-bold text-white mb-1">{pollutant.name}</h3>
                <p className="text-sm text-white/50 mb-4">{pollutant.fullName}</p>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4`}>
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">{pollutant.danger}</span>
                </div>

                <p className="text-sm text-white/60 mb-4">{pollutant.description}</p>

                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-white/50">{pollutant.effect}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400">{pollutant.whoLimit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Accuracy Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-emerald-500/10 border border-emerald-500/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-xl font-bold text-white mb-2">
                  Accuracy-first climate reporting
                </h4>
                <p className="text-white/60 text-sm max-w-2xl">
                  EnviroNex focuses on proportional risk: baseline comparisons, uncertainty bands,
                  and local context so users are not pushed by overstated claims or headline bias.
                </p>
              </div>
              <button
                onClick={onStartExploring}
                className="shrink-0 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                Explore Data
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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
            Ready to see climate data<br />
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">without exaggeration?</span>
          </h2>

          <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
            Join a platform that prioritizes context, proportionality, and rigorous baselines.
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
            <span className="text-sm text-white/50">EnviroNex © 2026. All rights reserved.</span>
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
