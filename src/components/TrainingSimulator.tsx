import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Brain, 
  Atom,
  Zap,
  TrendingDown,
  TrendingUp,
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Flame,
  Sparkles,
  BarChart3,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import DataAugmentationVisualizer from './DataAugmentationVisualizer';
import { modelDefinitions } from '@/lib/modelDefinitions';

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  learningRate: number;
  gradientNorm: number;
}

interface TrainingConfig {
  model: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: string;
}

const modelConfigs = modelDefinitions.map(m => ({
  id: m.id,
  name: m.name,
  type: m.type,
  icon: m.icon,
  color: m.type === 'quantum' ? 'text-violet-400' : m.type === 'neural' ? 'text-cyan-400' : m.type === 'hybrid' ? 'text-amber-400' : 'text-emerald-400',
  gradient: m.color,
}));

export default function TrainingSimulator() {
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState<TrainingMetrics[]>([]);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [config, setConfig] = useState<TrainingConfig>({
    model: 'quantum-vqe',
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001,
    optimizer: 'adam'
  });
  const [currentMetrics, setCurrentMetrics] = useState<TrainingMetrics | null>(null);
  const [bestMetrics, setBestMetrics] = useState({ accuracy: 0, loss: Infinity, epoch: 0 });
  const [trainingSpeed, setTrainingSpeed] = useState(100); // ms per epoch
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsRef = useRef<HTMLDivElement>(null);

  const selectedModel = modelConfigs.find(m => m.id === config.model) || modelConfigs[0];

  // Generate realistic training metrics
  const generateMetrics = useCallback((epoch: number, totalEpochs: number): TrainingMetrics => {
    const progress = epoch / totalEpochs;
    const noise = () => (Math.random() - 0.5) * 0.02;
    
    // Exponential decay for loss with some noise
    const baseLoss = 2.5 * Math.exp(-3 * progress) + 0.1;
    const loss = Math.max(0.05, baseLoss + noise() * baseLoss);
    
    // Accuracy increases with diminishing returns
    const baseAccuracy = 0.5 + 0.45 * (1 - Math.exp(-4 * progress));
    const accuracy = Math.min(0.99, baseAccuracy + noise());
    
    // Validation metrics with slight lag
    const valProgress = Math.max(0, progress - 0.05);
    const valBaseLoss = 2.5 * Math.exp(-2.8 * valProgress) + 0.12;
    const valLoss = Math.max(0.08, valBaseLoss + noise() * valBaseLoss * 1.5);
    const valBaseAccuracy = 0.5 + 0.43 * (1 - Math.exp(-3.8 * valProgress));
    const valAccuracy = Math.min(0.98, valBaseAccuracy + noise() * 1.2);
    
    // Learning rate decay
    const learningRate = config.learningRate * Math.pow(0.95, Math.floor(epoch / 10));
    
    // Gradient norm decreases as training stabilizes
    const gradientNorm = 10 * Math.exp(-2 * progress) + 0.5 + Math.random() * 2;
    
    return {
      epoch,
      loss: parseFloat(loss.toFixed(4)),
      accuracy: parseFloat(accuracy.toFixed(4)),
      valLoss: parseFloat(valLoss.toFixed(4)),
      valAccuracy: parseFloat(valAccuracy.toFixed(4)),
      learningRate: parseFloat(learningRate.toFixed(6)),
      gradientNorm: parseFloat(gradientNorm.toFixed(4))
    };
  }, [config.learningRate]);

  const addLog = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '✓' : type === 'warning' ? '⚠' : '→';
    setTrainingLogs(prev => [...prev.slice(-50), `[${timestamp}] ${prefix} ${message}`]);
  }, []);

  const startTraining = useCallback(() => {
    setIsTraining(true);
    setIsPaused(false);
    setCurrentEpoch(0);
    setTrainingHistory([]);
    setTrainingLogs([]);
    setBestMetrics({ accuracy: 0, loss: Infinity, epoch: 0 });
    
    addLog(`Starting training: ${selectedModel.name}`, 'info');
    addLog(`Config: ${config.epochs} epochs, batch_size=${config.batchSize}, lr=${config.learningRate}`, 'info');
    addLog(`Optimizer: ${config.optimizer.toUpperCase()}`, 'info');
    addLog('Loading training data...', 'info');
    
    setTimeout(() => {
      addLog('Data loaded: 10,000 samples', 'success');
      addLog('Initializing model weights...', 'info');
      
      setTimeout(() => {
        addLog('Model initialized', 'success');
        addLog('Beginning training loop...', 'info');
      }, 300);
    }, 500);
  }, [config, selectedModel, addLog]);

  const pauseTraining = () => {
    setIsPaused(true);
    addLog('Training paused', 'warning');
  };

  const resumeTraining = () => {
    setIsPaused(false);
    addLog('Training resumed', 'info');
  };

  const stopTraining = () => {
    setIsTraining(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    addLog(`Training stopped at epoch ${currentEpoch}`, 'warning');
    if (bestMetrics.accuracy > 0) {
      addLog(`Best accuracy: ${(bestMetrics.accuracy * 100).toFixed(2)}% at epoch ${bestMetrics.epoch}`, 'success');
    }
  };

  const resetTraining = () => {
    setIsTraining(false);
    setIsPaused(false);
    setCurrentEpoch(0);
    setTrainingHistory([]);
    setTrainingLogs([]);
    setCurrentMetrics(null);
    setBestMetrics({ accuracy: 0, loss: Infinity, epoch: 0 });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Training loop
  useEffect(() => {
    if (!isTraining || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentEpoch(prev => {
        const nextEpoch = prev + 1;
        
        if (nextEpoch > config.epochs) {
          setIsTraining(false);
          addLog(`Training completed! Final accuracy: ${(currentMetrics?.accuracy || 0) * 100}%`, 'success');
          addLog(`Best accuracy: ${(bestMetrics.accuracy * 100).toFixed(2)}% at epoch ${bestMetrics.epoch}`, 'success');
          return prev;
        }
        
        const metrics = generateMetrics(nextEpoch, config.epochs);
        setCurrentMetrics(metrics);
        setTrainingHistory(prev => [...prev, metrics]);
        
        // Update best metrics
        if (metrics.valAccuracy > bestMetrics.accuracy) {
          setBestMetrics({
            accuracy: metrics.valAccuracy,
            loss: metrics.valLoss,
            epoch: nextEpoch
          });
          if (nextEpoch > 5) {
            addLog(`New best model saved! Accuracy: ${(metrics.valAccuracy * 100).toFixed(2)}%`, 'success');
          }
        }
        
        // Log every 5 epochs
        if (nextEpoch % 5 === 0) {
          addLog(`Epoch ${nextEpoch}/${config.epochs} - loss: ${metrics.loss.toFixed(4)}, acc: ${(metrics.accuracy * 100).toFixed(2)}%, val_acc: ${(metrics.valAccuracy * 100).toFixed(2)}%`, 'info');
        }
        
        // Warnings
        if (metrics.loss > (trainingHistory[trainingHistory.length - 1]?.loss || 0) * 1.5 && nextEpoch > 5) {
          addLog('Warning: Loss spike detected, consider reducing learning rate', 'warning');
        }
        
        return nextEpoch;
      });
    }, trainingSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTraining, isPaused, config.epochs, trainingSpeed, generateMetrics, addLog, bestMetrics, currentMetrics, trainingHistory]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [trainingLogs]);

  const progress = (currentEpoch / config.epochs) * 100;

  return (
    <div className="space-y-6">
      {/* Training Configuration */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Model Selection */}
        <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Model Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-2 block">Model Architecture</label>
              <Select value={config.model} onValueChange={(v) => setConfig(c => ({ ...c, model: v }))} disabled={isTraining}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelConfigs.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <m.icon className={`w-4 h-4 ${m.color}`} />
                        {m.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-white/50 mb-2 block">Optimizer</label>
              <Select value={config.optimizer} onValueChange={(v) => setConfig(c => ({ ...c, optimizer: v }))} disabled={isTraining}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adam">Adam</SelectItem>
                  <SelectItem value="sgd">SGD</SelectItem>
                  <SelectItem value="rmsprop">RMSprop</SelectItem>
                  <SelectItem value="adamw">AdamW</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-white/50">Epochs</label>
                <span className="text-xs font-mono text-cyan-400">{config.epochs}</span>
              </div>
              <Slider
                value={[config.epochs]}
                onValueChange={([v]) => setConfig(c => ({ ...c, epochs: v }))}
                min={10}
                max={100}
                step={5}
                disabled={isTraining}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Hyperparameters */}
        <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            Hyperparameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-white/50">Learning Rate</label>
                <span className="text-xs font-mono text-violet-400">{config.learningRate}</span>
              </div>
              <Slider
                value={[config.learningRate * 1000]}
                onValueChange={([v]) => setConfig(c => ({ ...c, learningRate: v / 1000 }))}
                min={0.1}
                max={10}
                step={0.1}
                disabled={isTraining}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-white/50">Batch Size</label>
                <span className="text-xs font-mono text-emerald-400">{config.batchSize}</span>
              </div>
              <Slider
                value={[config.batchSize]}
                onValueChange={([v]) => setConfig(c => ({ ...c, batchSize: v }))}
                min={8}
                max={128}
                step={8}
                disabled={isTraining}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-white/50">Training Speed</label>
                <span className="text-xs font-mono text-amber-400">{trainingSpeed}ms/epoch</span>
              </div>
              <Slider
                value={[trainingSpeed]}
                onValueChange={([v]) => setTrainingSpeed(v)}
                min={50}
                max={500}
                step={25}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Controls & Status */}
        <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Training Controls
          </h3>
          
          <div className="space-y-4">
            {/* Control Buttons */}
            <div className="flex gap-2">
              {!isTraining ? (
                <Button 
                  onClick={startTraining} 
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              ) : isPaused ? (
                <Button 
                  onClick={resumeTraining} 
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button 
                  onClick={pauseTraining} 
                  variant="outline"
                  className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              
              <Button 
                onClick={stopTraining} 
                variant="outline"
                disabled={!isTraining}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 disabled:opacity-30"
              >
                <Square className="w-4 h-4" />
              </Button>
              
              <Button 
                onClick={resetTraining} 
                variant="outline"
                disabled={isTraining && !isPaused}
                className="border-white/20 text-white/60 hover:bg-white/5 disabled:opacity-30"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Status */}
            <div className="p-3 rounded-lg bg-black/30 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">Status</span>
                <Badge className={`text-[10px] ${
                  isTraining && !isPaused 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : isPaused 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-white/10 text-white/50 border-white/10'
                }`}>
                  {isTraining && !isPaused ? 'Training' : isPaused ? 'Paused' : 'Idle'}
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">Epoch</span>
                <span className="text-sm font-mono text-cyan-400">{currentEpoch} / {config.epochs}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Best Metrics */}
            {bestMetrics.accuracy > 0 && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Best Model</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Accuracy</span>
                  <span className="font-mono text-emerald-400">{(bestMetrics.accuracy * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Epoch</span>
                  <span className="font-mono text-white/70">{bestMetrics.epoch}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Live Metrics */}
      {currentMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Loss', value: currentMetrics.loss.toFixed(4), icon: TrendingDown, color: 'text-red-400', gradient: 'from-red-500/20 to-red-500/5' },
            { label: 'Accuracy', value: `${(currentMetrics.accuracy * 100).toFixed(2)}%`, icon: TrendingUp, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-emerald-500/5' },
            { label: 'Val Loss', value: currentMetrics.valLoss.toFixed(4), icon: TrendingDown, color: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-500/5' },
            { label: 'Val Acc', value: `${(currentMetrics.valAccuracy * 100).toFixed(2)}%`, icon: TrendingUp, color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-cyan-500/5' },
            { label: 'LR', value: currentMetrics.learningRate.toExponential(2), icon: Activity, color: 'text-violet-400', gradient: 'from-violet-500/20 to-violet-500/5' },
            { label: 'Grad Norm', value: currentMetrics.gradientNorm.toFixed(2), icon: Flame, color: 'text-amber-400', gradient: 'from-amber-500/20 to-amber-500/5' },
          ].map((metric) => (
            <Card key={metric.label} className={`p-3 bg-gradient-to-br ${metric.gradient} border-white/5`}>
              <div className="flex items-center gap-2">
                <metric.icon className={`w-3 h-3 ${metric.color}`} />
                <span className="text-[10px] text-white/50 uppercase">{metric.label}</span>
              </div>
              <p className={`text-lg font-bold font-mono ${metric.color} mt-1`}>{metric.value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Loss Chart */}
        <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            Loss Curves
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trainingHistory}>
              <defs>
                <linearGradient id="trainLossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="valLossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="epoch" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
              />
              <Area type="monotone" dataKey="loss" name="Train Loss" stroke="#ef4444" fill="url(#trainLossGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="valLoss" name="Val Loss" stroke="#f97316" fill="url(#valLossGrad)" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-red-500 rounded" />
              <span className="text-white/50">Train Loss</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-orange-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f97316 0, #f97316 4px, transparent 4px, transparent 8px)' }} />
              <span className="text-white/50">Val Loss</span>
            </div>
          </div>
        </Card>

        {/* Accuracy Chart */}
        <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Accuracy Curves
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trainingHistory}>
              <defs>
                <linearGradient id="trainAccGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="valAccGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="epoch" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
              <YAxis domain={[0.4, 1]} stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
                formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
              />
              <Area type="monotone" dataKey="accuracy" name="Train Acc" stroke="#10b981" fill="url(#trainAccGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="valAccuracy" name="Val Acc" stroke="#06b6d4" fill="url(#valAccGrad)" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-emerald-500 rounded" />
              <span className="text-white/50">Train Accuracy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-cyan-500 rounded" />
              <span className="text-white/50">Val Accuracy</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Training Logs */}
      <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/60" />
          Training Logs
        </h3>
        <div 
          ref={logsRef}
          className="h-48 overflow-y-auto bg-black/40 rounded-lg p-3 font-mono text-xs space-y-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20"
        >
          {trainingLogs.length === 0 ? (
            <p className="text-white/30">Waiting to start training...</p>
          ) : (
            trainingLogs.map((log, i) => (
              <p 
                key={i} 
                className={`${
                  log.includes('✓') ? 'text-emerald-400' : 
                  log.includes('⚠') ? 'text-amber-400' : 
                  'text-white/60'
                }`}
              >
                {log}
              </p>
            ))
          )}
        </div>
      </Card>

      {/* Data Augmentation Section */}
      <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
        <Tabs defaultValue="augmentation" className="space-y-4">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="augmentation" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-white text-xs">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Data Augmentation
            </TabsTrigger>
          </TabsList>
          <TabsContent value="augmentation">
            <DataAugmentationVisualizer />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
