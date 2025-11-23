import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';

interface AgenticOverlayProps {
  isActive: boolean;
  action?: string;
}

export const AgenticOverlay = ({ isActive, action }: AgenticOverlayProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setParticles(newParticles);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Blue quantum overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-purple-500/10 backdrop-blur-[2px] animate-pulse" />
      
      {/* Quantum particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-cyan-400/60 rounded-full animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.id * 0.1}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}

      {/* Status badge */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <Badge className="glass px-6 py-3 text-lg font-medium bg-blue-500/30 border-cyan-400/50 animate-scale-in">
          <Sparkles className="w-5 h-5 mr-2 animate-spin" />
          Enviro AI: {action || 'Thinking...'}
          <Zap className="w-5 h-5 ml-2 animate-pulse" />
        </Badge>
      </div>

      {/* Scanning lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />
      </div>
    </div>
  );
};

export default AgenticOverlay;
