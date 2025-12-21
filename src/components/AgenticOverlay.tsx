import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';

interface AgenticOverlayProps {
  isActive: boolean;
  action?: string;
}

export const AgenticOverlay = ({ isActive, action }: AgenticOverlayProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number }>>([]);
  const [gridLines, setGridLines] = useState<Array<{ id: number; top: number }>>([]);

  useEffect(() => {
    if (isActive) {
      // Generate quantum particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 2 + 1
      }));
      setParticles(newParticles);

      // Generate scanning grid lines
      const lines = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        top: Math.random() * 100
      }));
      setGridLines(lines);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Darkened backdrop with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" />

      {/* Quantum Field Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-purple-500/10 animate-pulse" />

      {/* Scanning Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        {gridLines.map((line) => (
          <div
            key={line.id}
            className="absolute w-full h-[1px] bg-cyan-500/30"
            style={{
              top: `${line.top}%`,
              animation: `scan-line ${3 + Math.random() * 2}s linear infinite`
            }}
          />
        ))}
      </div>

      {/* Quantum Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.id * 0.1}s`,
            animationDuration: `${particle.speed}s`
          }}
        />
      ))}

      {/* Central Agentic Interface */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
          <Badge className="relative glass px-8 py-4 text-xl font-medium bg-black/60 border-cyan-400/50 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.2)] animate-scale-in flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-spin-slow" />
            <span className="tracking-wider">AGENTIC AI: {action || 'ANALYZING REALITY...'}</span>
            <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
          </Badge>
        </div>

        {/* Terminal Output Effect */}
        <div className="font-mono text-xs text-cyan-400/70 space-y-1 text-center">
          <p className="animate-typewriter overflow-hidden whitespace-nowrap border-r-2 border-cyan-400/50 pr-1">
            {'>'} QUANTUM COHERENCE: 98.4%
          </p>
          <p className="animate-typewriter overflow-hidden whitespace-nowrap border-r-2 border-cyan-400/50 pr-1 animation-delay-500">
            {'>'} OPTIMIZING ENVIRONEX PARAMETERS...
          </p>
        </div>
      </div>

      {/* Corner HUD Elements */}
      <div className="absolute top-8 left-8 p-4 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-xl opacity-60">
        <div className="text-xs font-mono text-cyan-400">SYS.STATUS: ONLINE</div>
        <div className="text-xs font-mono text-cyan-400">LATENCY: 12ms</div>
      </div>
      <div className="absolute bottom-8 right-8 p-4 border-r-2 border-b-2 border-cyan-500/30 rounded-br-xl opacity-60">
        <div className="text-xs font-mono text-cyan-400">AGENT: ACTIVE</div>
        <div className="text-xs font-mono text-cyan-400">MODE: QUANTUM</div>
      </div>
    </div>
  );
};

export default AgenticOverlay;
