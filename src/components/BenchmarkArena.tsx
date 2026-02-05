import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight,
  Flame,
  Target,
  Clock,
  Cpu,
  Activity,
  TrendingUp,
  Crown,
  Swords,
  Timer
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getModelsForUI } from '@/lib/modelDefinitions';

const models = getModelsForUI();

interface BattleResult {
  round: number;
  model1Score: number;
  model2Score: number;
  model1Latency: number;
  model2Latency: number;
}

export default function BenchmarkArena() {
  const [selectedModels, setSelectedModels] = useState<[typeof models[0], typeof models[0]]>([models[0], models[1]]);
  const [isBattling, setIsBattling] = useState(false);
  const [battleRounds, setBattleRounds] = useState<BattleResult[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [liveStats, setLiveStats] = useState({
    totalBattles: 2847,
    activeUsers: 156,
    avgMatchDuration: 4.2
  });

  // Live stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        totalBattles: prev.totalBattles + Math.floor(Math.random() * 3),
        activeUsers: Math.max(100, prev.activeUsers + Math.floor(Math.random() * 10) - 5),
        avgMatchDuration: Math.round((prev.avgMatchDuration + (Math.random() * 0.4 - 0.2)) * 10) / 10
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const startBattle = () => {
    setIsBattling(true);
    setBattleRounds([]);
    setCurrentRound(0);
    setWinner(null);

    const totalRounds = 5;
    let round = 0;

    const runRound = () => {
      if (round >= totalRounds) {
        setIsBattling(false);
        
        // Calculate winner
        const model1Total = battleRounds.reduce((acc, r) => acc + r.model1Score, 0);
        const model2Total = battleRounds.reduce((acc, r) => acc + r.model2Score, 0);
        
        if (model1Total > model2Total) {
          setWinner(selectedModels[0].name);
        } else if (model2Total > model1Total) {
          setWinner(selectedModels[1].name);
        } else {
          setWinner('Tie');
        }
        return;
      }

      const result: BattleResult = {
        round: round + 1,
        model1Score: selectedModels[0].accuracy * (0.95 + Math.random() * 0.1),
        model2Score: selectedModels[1].accuracy * (0.95 + Math.random() * 0.1),
        model1Latency: selectedModels[0].latency * (0.8 + Math.random() * 0.4),
        model2Latency: selectedModels[1].latency * (0.8 + Math.random() * 0.4),
      };

      setBattleRounds(prev => [...prev, result]);
      setCurrentRound(round + 1);
      round++;

      setTimeout(runRound, 800);
    };

    setTimeout(runRound, 500);
  };

  const resetBattle = () => {
    setBattleRounds([]);
    setCurrentRound(0);
    setWinner(null);
    setIsBattling(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quantum': return 'violet';
      case 'neural': return 'cyan';
      case 'hybrid': return 'amber';
      default: return 'emerald';
    }
  };

  return (
    <div className="space-y-6">
      {/* Arena Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20">
            <Swords className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Benchmark Arena</h2>
            <p className="text-sm text-white/40">Head-to-head model comparison battles</p>
          </div>
        </div>
        
        {/* Live Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-white/40">LIVE</span>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="text-center">
              <p className="font-mono text-white font-bold">{liveStats.totalBattles.toLocaleString()}</p>
              <p className="text-white/30">Total Battles</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-emerald-400 font-bold">{liveStats.activeUsers}</p>
              <p className="text-white/30">Active Users</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-white font-bold">{liveStats.avgMatchDuration}s</p>
              <p className="text-white/30">Avg Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="grid lg:grid-cols-7 gap-4">
        {/* Model 1 */}
        <Card className="lg:col-span-3 p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white/60">CHALLENGER 1</h3>
            {winner === selectedModels[0].name && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Crown className="w-3 h-3 mr-1" /> WINNER
              </Badge>
            )}
          </div>
          
          <select
            value={selectedModels[0].id}
            onChange={(e) => {
              const model = models.find(m => m.id === e.target.value);
              if (model) setSelectedModels([model, selectedModels[1]]);
            }}
            disabled={isBattling}
            className="w-full mb-4 p-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30"
          >
            {models.map(m => (
              <option key={m.id} value={m.id} className="bg-black">{m.name}</option>
            ))}
          </select>

          <div className={`p-4 rounded-xl border-2 transition-all ${
            isBattling ? 'border-violet-500/50 bg-violet-500/5' : 'border-white/10 bg-white/[0.02]'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedModels[0].type === 'quantum' ? 'bg-violet-500/20' :
                selectedModels[0].type === 'neural' ? 'bg-cyan-500/20' :
                selectedModels[0].type === 'hybrid' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
              }`}>
                {(() => {
                  const Icon = selectedModels[0].icon;
                  return <Icon className={`w-6 h-6 ${
                    selectedModels[0].type === 'quantum' ? 'text-violet-400' :
                    selectedModels[0].type === 'neural' ? 'text-cyan-400' :
                    selectedModels[0].type === 'hybrid' ? 'text-amber-400' : 'text-emerald-400'
                  }`} />;
                })()}
              </div>
              <div>
                <p className="font-bold text-white">{selectedModels[0].name}</p>
                <p className="text-xs text-white/40">{selectedModels[0].type.toUpperCase()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-[10px] text-white/40 mb-1">BASE ACCURACY</p>
                <p className="text-lg font-mono font-bold text-emerald-400">{selectedModels[0].accuracy}%</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-[10px] text-white/40 mb-1">LATENCY</p>
                <p className="text-lg font-mono font-bold text-cyan-400">{selectedModels[0].latency}ms</p>
              </div>
            </div>

            {battleRounds.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 mb-2">ROUND SCORES</p>
                <div className="flex gap-1">
                  {battleRounds.map((r, i) => (
                    <div 
                      key={i}
                      className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-mono font-bold ${
                        r.model1Score > r.model2Score 
                          ? 'bg-emerald-500/30 text-emerald-400' 
                          : r.model1Score < r.model2Score
                          ? 'bg-red-500/30 text-red-400'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {r.model1Score.toFixed(1)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* VS Section */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all ${
            isBattling 
              ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white animate-pulse shadow-lg shadow-red-500/50' 
              : 'bg-white/5 text-white/40'
          }`}>
            VS
          </div>
          
          {isBattling && (
            <div className="text-center">
              <p className="text-xs text-white/40">ROUND</p>
              <p className="text-3xl font-mono font-bold text-white">{currentRound}/5</p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={isBattling ? undefined : startBattle}
              disabled={isBattling || selectedModels[0].id === selectedModels[1].id}
              className="h-12 px-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0"
            >
              {isBattling ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  Battling...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Battle
                </>
              )}
            </Button>
            
            {battleRounds.length > 0 && !isBattling && (
              <Button
                onClick={resetBattle}
                variant="outline"
                className="border-white/20 text-white/60 hover:bg-white/5"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Model 2 */}
        <Card className="lg:col-span-3 p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white/60">CHALLENGER 2</h3>
            {winner === selectedModels[1].name && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Crown className="w-3 h-3 mr-1" /> WINNER
              </Badge>
            )}
          </div>
          
          <select
            value={selectedModels[1].id}
            onChange={(e) => {
              const model = models.find(m => m.id === e.target.value);
              if (model) setSelectedModels([selectedModels[0], model]);
            }}
            disabled={isBattling}
            className="w-full mb-4 p-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30"
          >
            {models.map(m => (
              <option key={m.id} value={m.id} className="bg-black">{m.name}</option>
            ))}
          </select>

          <div className={`p-4 rounded-xl border-2 transition-all ${
            isBattling ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 bg-white/[0.02]'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedModels[1].type === 'quantum' ? 'bg-violet-500/20' :
                selectedModels[1].type === 'neural' ? 'bg-cyan-500/20' :
                selectedModels[1].type === 'hybrid' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
              }`}>
                {(() => {
                  const Icon = selectedModels[1].icon;
                  return <Icon className={`w-6 h-6 ${
                    selectedModels[1].type === 'quantum' ? 'text-violet-400' :
                    selectedModels[1].type === 'neural' ? 'text-cyan-400' :
                    selectedModels[1].type === 'hybrid' ? 'text-amber-400' : 'text-emerald-400'
                  }`} />;
                })()}
              </div>
              <div>
                <p className="font-bold text-white">{selectedModels[1].name}</p>
                <p className="text-xs text-white/40">{selectedModels[1].type.toUpperCase()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-[10px] text-white/40 mb-1">BASE ACCURACY</p>
                <p className="text-lg font-mono font-bold text-emerald-400">{selectedModels[1].accuracy}%</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-[10px] text-white/40 mb-1">LATENCY</p>
                <p className="text-lg font-mono font-bold text-cyan-400">{selectedModels[1].latency}ms</p>
              </div>
            </div>

            {battleRounds.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 mb-2">ROUND SCORES</p>
                <div className="flex gap-1">
                  {battleRounds.map((r, i) => (
                    <div 
                      key={i}
                      className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-mono font-bold ${
                        r.model2Score > r.model1Score 
                          ? 'bg-emerald-500/30 text-emerald-400' 
                          : r.model2Score < r.model1Score
                          ? 'bg-red-500/30 text-red-400'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {r.model2Score.toFixed(1)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Battle Chart */}
      {battleRounds.length > 0 && (
        <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Battle Progress</h3>
            {winner && (
              <Badge className={`${winner === 'Tie' ? 'bg-white/10 text-white/60' : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black'}`}>
                {winner === 'Tie' ? 'TIE MATCH' : `${winner} WINS!`}
              </Badge>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={battleRounds}>
              <defs>
                <linearGradient id="model1Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="model2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="round" stroke="rgba(255,255,255,0.2)" fontSize={10} tickFormatter={(v) => `R${v}`} />
              <YAxis domain={[85, 100]} stroke="rgba(255,255,255,0.2)" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
                labelFormatter={(v) => `Round ${v}`}
              />
              <Area type="monotone" dataKey="model1Score" stroke="#8b5cf6" fill="url(#model1Gradient)" strokeWidth={2} name={selectedModels[0].name} />
              <Area type="monotone" dataKey="model2Score" stroke="#06b6d4" fill="url(#model2Gradient)" strokeWidth={2} name={selectedModels[1].name} />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-xs text-white/60">{selectedModels[0].name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-xs text-white/60">{selectedModels[1].name}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Match History */}
      <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
        <h3 className="text-sm font-bold text-white mb-4">Recent Matches (Global)</h3>
        <div className="space-y-2">
          {[
            { m1: 'Quantum AQI', m2: 'Neural Climate', winner: 'Quantum AQI', score: '3-2', time: '2m ago' },
            { m1: 'Hybrid Disaster', m2: 'Ensemble Forecast', winner: 'Hybrid Disaster', score: '4-1', time: '5m ago' },
            { m1: 'Neural Climate', m2: 'Quantum AQI', winner: 'Quantum AQI', score: '3-2', time: '8m ago' },
          ].map((match, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <span className={`text-sm ${match.winner === match.m1 ? 'text-emerald-400 font-bold' : 'text-white/60'}`}>
                  {match.m1}
                </span>
                <span className="text-white/20">vs</span>
                <span className={`text-sm ${match.winner === match.m2 ? 'text-emerald-400 font-bold' : 'text-white/60'}`}>
                  {match.m2}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-white/80">{match.score}</span>
                <span className="text-xs text-white/30">{match.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
