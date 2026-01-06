import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  Atom, 
  Zap, 
  Play, 
  Loader2, 
  ChevronRight,
  Cpu,
  Activity,
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  Layers,
  GitBranch,
  Radio,
  Gauge,
  CircuitBoard,
  Waves,
  Eye,
  Shuffle,
  Trophy,
  Flame,
  Timer,
  Maximize2,
  X,
  Check,
  AlertTriangle,
  Info,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, ScatterChart, Scatter, ZAxis } from 'recharts';
import TrainingSimulator from '@/components/TrainingSimulator';
import { getModelsForUI } from '@/lib/modelDefinitions';

interface ModelResult {
  id: string;
  model_name: string;
  model_type: string;
  input_data: any;
  output_data: any;
  execution_time_ms: number;
  quantum_enhanced: boolean;
  created_at: string;
}

// Use real model definitions
const models = getModelsForUI();

// Quantum circuit visualization data
const generateQuantumCircuit = () => {
  const gates = ['H', 'X', 'Y', 'Z', 'CX', 'RY', 'RZ'];
  return Array.from({ length: 8 }, (_, qubit) => ({
    qubit: `q${qubit}`,
    gates: Array.from({ length: 12 }, () => ({
      type: gates[Math.floor(Math.random() * gates.length)],
      active: Math.random() > 0.3
    }))
  }));
};

// Generate performance data
const generatePerformanceData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    quantum: 95 + Math.random() * 4,
    classical: 88 + Math.random() * 5,
    hybrid: 92 + Math.random() * 5,
    requests: Math.floor(100 + Math.random() * 200)
  }));
};

const generateLatencyData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    name: `T-${11 - i}`,
    quantum: 2200 + Math.random() * 600,
    neural: 1000 + Math.random() * 400,
    classical: 400 + Math.random() * 200
  }));
};

const generateScatterData = () => {
  return Array.from({ length: 50 }, () => ({
    accuracy: 85 + Math.random() * 15,
    latency: 200 + Math.random() * 2500,
    size: Math.random() * 100 + 50,
    type: ['quantum', 'neural', 'hybrid', 'classical'][Math.floor(Math.random() * 4)]
  }));
};

const radarData = [
  { metric: 'Accuracy', quantum: 97, classical: 91, hybrid: 96, neural: 94 },
  { metric: 'Speed', quantum: 65, classical: 95, hybrid: 78, neural: 82 },
  { metric: 'Scalability', quantum: 92, classical: 88, hybrid: 90, neural: 95 },
  { metric: 'Reliability', quantum: 94, classical: 96, hybrid: 95, neural: 93 },
  { metric: 'Efficiency', quantum: 88, classical: 92, hybrid: 90, neural: 89 },
  { metric: 'Adaptability', quantum: 96, classical: 85, hybrid: 94, neural: 97 },
];

// Benchmark leaderboard data
const benchmarkData = [
  { model: 'Quantum AQI', score: 98.2, rank: 1, change: 'up' },
  { model: 'Hybrid Disaster', score: 96.8, rank: 2, change: 'same' },
  { model: 'Neural Climate', score: 94.1, rank: 3, change: 'up' },
  { model: 'Ensemble Forecast', score: 91.2, rank: 4, change: 'down' },
];

// Particle component for background
const Particles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  );
};

// Quantum Circuit Visualizer Component
const QuantumCircuitVisualizer = ({ circuit, isAnimating }: { circuit: ReturnType<typeof generateQuantumCircuit>, isAnimating: boolean }) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-4">
        <CircuitBoard className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-medium text-white/80">Live Quantum Circuit</span>
        {isAnimating && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Executing
          </span>
        )}
      </div>
      <div className="space-y-1 font-mono text-xs">
        {circuit.slice(0, 4).map((qubit, qi) => (
          <div key={qi} className="flex items-center gap-1">
            <span className="w-6 text-violet-400">{qubit.qubit}</span>
            <span className="text-white/40">─</span>
            {qubit.gates.map((gate, gi) => (
              <span 
                key={gi}
                className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold transition-all duration-300 ${
                  gate.active 
                    ? isAnimating && gi < 6
                      ? 'bg-violet-500/80 text-white scale-110 shadow-lg shadow-violet-500/50'
                      : 'bg-violet-500/30 text-violet-300'
                    : 'bg-white/5 text-white/20'
                }`}
                style={{ animationDelay: `${gi * 100}ms` }}
              >
                {gate.active ? gate.type : '─'}
              </span>
            ))}
            <span className="text-white/40">─┤</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
        <span>Depth: 12 | Gates: 48</span>
        <span>Backend: ibm_brisbane</span>
      </div>
    </div>
  );
};

// Model Comparison Card
const ComparisonCard = ({ models: compareModels, onClose }: { models: typeof models, onClose: () => void }) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Shuffle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Model Comparison</h3>
            <p className="text-xs text-white/40">Side-by-side performance analysis</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/40 hover:text-white hover:bg-white/5">
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2 text-white/40 font-medium">Metric</th>
              {compareModels.map(m => (
                <th key={m.id} className="text-center py-3 px-4">
                  <div className="flex flex-col items-center gap-1">
                    <m.icon className={`w-5 h-5 ${
                      m.type === 'quantum' ? 'text-violet-400' :
                      m.type === 'neural' ? 'text-cyan-400' :
                      m.type === 'hybrid' ? 'text-amber-400' : 'text-emerald-400'
                    }`} />
                    <span className="text-white/80 text-xs">{m.name.split(' ')[0]}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Accuracy', key: 'accuracy', unit: '%', best: 'high' },
              { label: 'Latency', key: 'latency', unit: 'ms', best: 'low' },
              { label: 'Quantum Advantage', getValue: (m: typeof models[0]) => m.type === 'quantum' ? '3.2x' : m.type === 'hybrid' ? '2.1x' : '1.0x' },
              { label: 'Status', key: 'status' }
            ].map((metric, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-3 px-2 text-white/60">{metric.label}</td>
                {compareModels.map(m => {
                  const value = metric.getValue ? metric.getValue(m) : (m as any)[metric.key!];
                  const isBest = metric.best === 'high' 
                    ? Math.max(...compareModels.map(cm => (cm as any)[metric.key!])) === value
                    : metric.best === 'low'
                    ? Math.min(...compareModels.map(cm => (cm as any)[metric.key!])) === value
                    : false;
                  
                  return (
                    <td key={m.id} className={`text-center py-3 px-4 font-mono ${
                      isBest ? 'text-emerald-400 font-bold' : 'text-white/80'
                    }`}>
                      {value}{metric.unit || ''}
                      {isBest && <Trophy className="w-3 h-3 inline ml-1" />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default function Explore() {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ModelResult[]>([]);
  const [performanceData] = useState(generatePerformanceData());
  const [latencyData] = useState(generateLatencyData());
  const [scatterData] = useState(generateScatterData());
  const [quantumCircuit, setQuantumCircuit] = useState(generateQuantumCircuit());
  const [liveMetrics, setLiveMetrics] = useState({ requests: 0, avgLatency: 0, accuracy: 0, throughput: 0 });
  const [showComparison, setShowComparison] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedBenchmark, setSelectedBenchmark] = useState<string | null>(null);
  const [inputParams, setInputParams] = useState({
    temperature: 25,
    humidity: 60,
    pressure: 1013,
    windSpeed: 10
  });

  useEffect(() => {
    fetchResults();
  }, []);

  // Live metrics simulation
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLiveMetrics({
        requests: Math.floor(Math.random() * 500) + 1200,
        avgLatency: Math.floor(Math.random() * 200) + 800,
        accuracy: 94 + Math.random() * 4,
        throughput: Math.floor(Math.random() * 50) + 150
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Quantum circuit animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) {
        setQuantumCircuit(generateQuantumCircuit());
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isRunning]);

  const fetchResults = async () => {
    const { data, error } = await supabase
      .from('quantum_simulations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setResults(data.map(d => ({
        id: d.id,
        model_name: d.algorithm_name,
        model_type: d.simulation_type,
        input_data: d.input_parameters,
        output_data: d.quantum_results,
        execution_time_ms: d.execution_time_ms || 0,
        quantum_enhanced: d.qubit_count ? d.qubit_count > 0 : false,
        created_at: d.created_at
      })));
    }
  };

  const runModel = async () => {
    setIsRunning(true);
    const startTime = Date.now();

    try {
      await new Promise(resolve => setTimeout(resolve, selectedModel.latency));

      const output = generateModelOutput(selectedModel.type, inputParams);

      const { error } = await supabase
        .from('quantum_simulations')
        .insert({
          algorithm_name: selectedModel.name,
          simulation_type: selectedModel.type,
          input_parameters: inputParams,
          quantum_results: output,
          execution_time_ms: Date.now() - startTime,
          qubit_count: selectedModel.type === 'quantum' ? 8 : selectedModel.type === 'hybrid' ? 4 : 0,
          user_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000'
        });

      if (error) throw error;

      toast({
        title: 'Model executed successfully',
        description: `${selectedModel.name} completed in ${Date.now() - startTime}ms`
      });

      fetchResults();
    } catch (error) {
      console.error('Error running model:', error);
      toast({
        title: 'Execution failed',
        description: 'Failed to run model. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const generateModelOutput = (type: string, params: typeof inputParams) => {
    const baseAQI = Math.round(50 + (params.temperature - 20) * 2 + (100 - params.humidity) * 0.5);
    
    if (type === 'quantum') {
      return {
        predicted_aqi: baseAQI + Math.round(Math.random() * 10 - 5),
        confidence: 0.973 + Math.random() * 0.02,
        quantum_states: ['|00⟩', '|01⟩', '|10⟩', '|11⟩'],
        entanglement_score: 0.85 + Math.random() * 0.1,
        circuit_depth: 12,
        gate_count: 48
      };
    } else if (type === 'hybrid') {
      return {
        predicted_aqi: baseAQI + Math.round(Math.random() * 15 - 7),
        confidence: 0.968 + Math.random() * 0.02,
        classical_contribution: 0.6,
        quantum_contribution: 0.4,
        disaster_probability: Math.random() * 0.1
      };
    } else if (type === 'neural') {
      return {
        predicted_aqi: baseAQI + Math.round(Math.random() * 12 - 6),
        confidence: 0.941 + Math.random() * 0.03,
        layer_activations: [0.8, 0.6, 0.9, 0.7],
        feature_importance: { temp: 0.35, humidity: 0.25, pressure: 0.2, wind: 0.2 }
      };
    } else {
      return {
        predicted_aqi: baseAQI + Math.round(Math.random() * 20 - 10),
        confidence: 0.912 + Math.random() * 0.04,
        ensemble_agreement: 0.85 + Math.random() * 0.1
      };
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Minimal Background - Anduril inspired */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-white/[0.02] to-transparent rounded-full blur-3xl" />
        
        {/* Fine grid */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/[0.06] shrink-0">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-sm font-medium tracking-wide text-white/90">MODEL LAB</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/40 font-mono">LIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-10">

          {/* Clean Tab Navigation */}
          <Tabs defaultValue="models" className="space-y-8">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-6">
              {[
                { value: 'models', label: 'Models', icon: Cpu },
                { value: 'training', label: 'Training', icon: GraduationCap },
                { value: 'analytics', label: 'Analytics', icon: BarChart3 },
              ].map(tab => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="data-[state=active]:text-white data-[state=inactive]:text-white/30 data-[state=active]:border-b-2 data-[state=active]:border-white bg-transparent hover:text-white/60 rounded-none px-0 pb-2 text-sm font-medium transition-colors"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="models" className="space-y-8 mt-0">
              {/* Models Grid - Clean minimal cards */}
              <div className="grid lg:grid-cols-3 gap-6">
                {models.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`group relative cursor-pointer transition-all duration-300 ${
                      selectedModel.id === model.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Card */}
                    <div className={`p-6 rounded-lg border transition-all duration-300 ${
                      selectedModel.id === model.id 
                        ? 'bg-white/[0.04] border-white/20' 
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/10'
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                          <model.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${
                          model.status === 'production' ? 'text-emerald-400' :
                          model.status === 'beta' ? 'text-amber-400' :
                          'text-white/40'
                        }`}>
                          {model.status}
                        </span>
                      </div>
                      
                      {/* Info */}
                      <h3 className="text-white font-medium mb-1">{model.name}</h3>
                      <p className="text-xs text-white/40 mb-4 line-clamp-2">{model.description}</p>
                      
                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
                        <div>
                          <p className="text-[10px] text-white/30 uppercase mb-1">Accuracy</p>
                          <p className="text-sm font-mono text-white">{model.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/30 uppercase mb-1">Latency</p>
                          <p className="text-sm font-mono text-white/70">{model.latency}ms</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/30 uppercase mb-1">{model.qubits ? 'Qubits' : 'Layers'}</p>
                          <p className="text-sm font-mono text-white/70">{model.qubits || model.layers}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Selection indicator */}
                    {selectedModel.id === model.id && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full" />
                    )}
                  </div>
                ))}
              </div>

              {/* Selected Model Detail */}
              {selectedModel && (
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Model Info & Run */}
                  <div className="space-y-6">
                    {/* Architecture Details */}
                    <div className="p-6 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Architecture</h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                          <span className="text-sm text-white/50">Framework</span>
                          <span className="text-sm text-white font-mono">{selectedModel.framework || 'PyTorch 2.1'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                          <span className="text-sm text-white/50">Parameters</span>
                          <span className="text-sm text-white font-mono">{selectedModel.totalParams?.toLocaleString() || '86M'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                          <span className="text-sm text-white/50">Type</span>
                          <span className={`text-sm font-medium ${
                            selectedModel.type === 'quantum' ? 'text-violet-400' :
                            selectedModel.type === 'hybrid' ? 'text-amber-400' :
                            selectedModel.type === 'neural' ? 'text-cyan-400' : 'text-emerald-400'
                          }`}>{selectedModel.type.toUpperCase()}</span>
                        </div>
                        {selectedModel.backend && (
                          <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                            <span className="text-sm text-white/50">Backend</span>
                            <span className="text-sm text-white font-mono">{selectedModel.backend}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-white/50">Version</span>
                          <span className="text-sm text-white/70 font-mono">{selectedModel.version}</span>
                        </div>
                      </div>
                    </div>

                    {/* Run Model */}
                    <Button
                      onClick={runModel}
                      disabled={isRunning}
                      className="w-full h-12 bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50 rounded-lg"
                    >
                      {isRunning ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {isRunning ? 'Executing...' : 'Run Model'}
                    </Button>
                  </div>

                  {/* Input Parameters */}
                  <div className="p-6 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <h3 className="text-xs text-white/40 uppercase tracking-wider mb-6">Input Parameters</h3>
                    
                    <div className="space-y-6">
                      {[
                        { key: 'temperature', label: 'Temperature', unit: '°C', min: -20, max: 50 },
                        { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100 },
                        { key: 'pressure', label: 'Pressure', unit: 'hPa', min: 950, max: 1050 },
                        { key: 'windSpeed', label: 'Wind Speed', unit: 'm/s', min: 0, max: 50 },
                      ].map((param) => (
                        <div key={param.key}>
                          <div className="flex justify-between mb-3">
                            <label className="text-sm text-white/60">{param.label}</label>
                            <span className="text-sm font-mono text-white">
                              {inputParams[param.key as keyof typeof inputParams]}{param.unit}
                            </span>
                          </div>
                          <Slider
                            value={[inputParams[param.key as keyof typeof inputParams]]}
                            onValueChange={([v]) => setInputParams(p => ({ ...p, [param.key]: v }))}
                            min={param.min}
                            max={param.max}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantum Circuit for quantum models */}
              {(selectedModel?.type === 'quantum' || selectedModel?.type === 'hybrid') && (
                <div className="p-6 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs text-white/40 uppercase tracking-wider">Quantum Circuit</h3>
                    {isRunning && (
                      <span className="flex items-center gap-2 text-xs text-emerald-400">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Executing
                      </span>
                    )}
                  </div>
                  <QuantumCircuitVisualizer circuit={quantumCircuit} isAnimating={isRunning} />
                </div>
              )}

              {/* Playground Section */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Input Parameters - 4 cols */}
                <Card className="lg:col-span-4 p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Input Parameters</h3>
                      <p className="text-[10px] text-white/40">Adjust environmental variables</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    {[
                      { key: 'temperature', label: 'Temperature', unit: '°C', min: -20, max: 50, color: 'from-red-500 to-orange-500' },
                      { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, color: 'from-blue-500 to-cyan-500' },
                      { key: 'pressure', label: 'Pressure', unit: 'hPa', min: 950, max: 1050, color: 'from-violet-500 to-purple-500' },
                      { key: 'windSpeed', label: 'Wind Speed', unit: 'm/s', min: 0, max: 50, color: 'from-emerald-500 to-green-500' },
                    ].map((param) => (
                      <div key={param.key}>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs text-white/60">{param.label}</label>
                          <span className={`text-xs font-mono font-bold bg-gradient-to-r ${param.color} bg-clip-text text-transparent`}>
                            {inputParams[param.key as keyof typeof inputParams]}{param.unit}
                          </span>
                        </div>
                        <div className="relative">
                          <Slider
                            value={[inputParams[param.key as keyof typeof inputParams]]}
                            onValueChange={([v]) => setInputParams(p => ({ ...p, [param.key]: v }))}
                            min={param.min}
                            max={param.max}
                            step={1}
                            className="w-full"
                          />
                          <div 
                            className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r ${param.color} rounded-full transition-all`}
                            style={{ width: `${((inputParams[param.key as keyof typeof inputParams] - param.min) / (param.max - param.min)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={runModel}
                    disabled={isRunning}
                    className="w-full mt-6 h-11 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 hover:from-cyan-600 hover:via-blue-600 hover:to-violet-600 text-white border-0 font-bold shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02] disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run {selectedModel.name.split(' ')[0]}
                      </>
                    )}
                  </Button>
                </Card>

                {/* Model Details + Circuit - 8 cols */}
                <div className="lg:col-span-8 space-y-4">
                  <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 backdrop-blur-sm">
                    <div className="flex items-start gap-4 mb-5">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedModel.color} flex items-center justify-center shadow-lg`}>
                        <selectedModel.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">{selectedModel.name}</h3>
                          {selectedModel.type === 'quantum' && (
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[9px] font-medium">
                              IBM Quantum
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50">{selectedModel.description}</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Target className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-white/40">Accuracy</span>
                        </div>
                        <p className="text-xl font-bold text-emerald-400">{selectedModel.accuracy}%</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span className="text-[10px] text-white/40">Latency</span>
                        </div>
                        <p className="text-xl font-bold text-cyan-400">{selectedModel.latency}ms</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Layers className="w-3 h-3 text-violet-400" />
                          <span className="text-[10px] text-white/40">{selectedModel.type === 'quantum' ? 'Qubits' : 'Layers'}</span>
                        </div>
                        <p className="text-xl font-bold text-violet-400">
                          {selectedModel.qubits || selectedModel.layers}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] text-white/40">Advantage</span>
                        </div>
                        <p className="text-xl font-bold text-amber-400">
                          {selectedModel.type === 'quantum' ? '3.2x' : 
                           selectedModel.type === 'hybrid' ? '2.1x' : '1.0x'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Quantum Circuit Visualizer */}
                  {(selectedModel.type === 'quantum' || selectedModel.type === 'hybrid') && (
                    <QuantumCircuitVisualizer circuit={quantumCircuit} isAnimating={isRunning} />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="training" className="space-y-6">
              <TrainingSimulator />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Performance Over Time */}
                <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white text-sm">Accuracy Over Time</h3>
                      <p className="text-[10px] text-white/40">24-hour performance comparison</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                        <span className="text-white/50">Quantum</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span className="text-white/50">Classical</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-white/50">Hybrid</span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="quantumGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="classicalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
                      <YAxis domain={[85, 100]} stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.9)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                      <Area type="monotone" dataKey="quantum" stroke="#8b5cf6" fill="url(#quantumGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="classical" stroke="#06b6d4" fill="url(#classicalGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="hybrid" stroke="#f59e0b" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* Latency Comparison */}
                <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white text-sm">Latency Distribution</h3>
                      <p className="text-[10px] text-white/40">Response time by model type (ms)</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={latencyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.9)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="quantum" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="neural" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="classical" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Radar Chart */}
                <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white text-sm">Model Capabilities</h3>
                      <p className="text-[10px] text-white/40">Multi-dimensional comparison</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                      <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" fontSize={9} domain={[0, 100]} />
                      <Radar name="Quantum" dataKey="quantum" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
                      <Radar name="Neural" dataKey="neural" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
                      <Radar name="Classical" dataKey="classical" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                      <Radar name="Hybrid" dataKey="hybrid" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Scatter Plot - Accuracy vs Latency */}
                <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white text-sm">Accuracy vs Latency</h3>
                      <p className="text-[10px] text-white/40">Performance trade-off analysis</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis type="number" dataKey="latency" name="Latency" unit="ms" stroke="rgba(255,255,255,0.2)" fontSize={9} />
                      <YAxis type="number" dataKey="accuracy" name="Accuracy" unit="%" stroke="rgba(255,255,255,0.2)" fontSize={9} domain={[80, 100]} />
                      <ZAxis type="number" dataKey="size" range={[20, 200]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.9)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                      <Scatter name="Models" data={scatterData} fill="#8b5cf6">
                        {scatterData.map((entry, index) => (
                          <Scatter 
                            key={index}
                            fill={
                              entry.type === 'quantum' ? '#8b5cf6' :
                              entry.type === 'neural' ? '#06b6d4' :
                              entry.type === 'hybrid' ? '#f59e0b' : '#10b981'
                            }
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="benchmark" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Leaderboard */}
                <Card className="lg:col-span-2 p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Performance Leaderboard</h3>
                      <p className="text-[10px] text-white/40">Real-time model rankings</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {benchmarkData.map((item, i) => (
                      <div 
                        key={item.model}
                        className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedBenchmark === item.model 
                            ? 'bg-amber-500/10 border-amber-500/30' 
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                        }`}
                        onClick={() => setSelectedBenchmark(item.model === selectedBenchmark ? null : item.model)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                            item.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-black' :
                            item.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black' :
                            item.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                            'bg-white/10 text-white/60'
                          }`}>
                            {item.rank}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{item.model}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    item.rank === 1 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                                    item.rank === 2 ? 'bg-gradient-to-r from-violet-400 to-purple-500' :
                                    item.rank === 3 ? 'bg-gradient-to-r from-cyan-400 to-blue-500' :
                                    'bg-gradient-to-r from-emerald-400 to-green-500'
                                  }`}
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                              <span className="text-sm font-mono font-bold text-white/80">{item.score}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {item.change === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                            {item.change === 'down' && <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
                            {item.change === 'same' && <div className="w-4 h-0.5 bg-white/20" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <Card className="p-5 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Flame className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-bold text-white">Best Performer</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">Quantum AQI</p>
                    <p className="text-xs text-white/40 mt-1">98.2% accuracy score</p>
                  </Card>
                  
                  <Card className="p-5 bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="w-5 h-5 text-violet-400" />
                      <span className="text-sm font-bold text-white">Fastest Model</span>
                    </div>
                    <p className="text-2xl font-bold text-violet-400">Ensemble</p>
                    <p className="text-xs text-white/40 mt-1">~500ms avg latency</p>
                  </Card>
                  
                  <Card className="p-5 bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm font-bold text-white">Most Used</span>
                    </div>
                    <p className="text-2xl font-bold text-cyan-400">Neural Climate</p>
                    <p className="text-xs text-white/40 mt-1">12.4K executions today</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Execution History</h3>
                  <p className="text-xs text-white/40">Recent model runs and their results</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchResults} className="border-white/20 text-white/60 hover:bg-white/5">
                  Refresh
                </Button>
              </div>

              {results.length === 0 ? (
                <Card className="p-16 bg-gradient-to-br from-white/[0.02] to-transparent border-white/10 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Cpu className="w-10 h-10 text-white/20" />
                  </div>
                  <h3 className="text-xl font-bold text-white/60 mb-2">No executions yet</h3>
                  <p className="text-sm text-white/40 mb-6">Run a model from the Models tab to see results here</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {results.map((result, i) => (
                    <Card 
                      key={result.id} 
                      className="p-4 bg-gradient-to-r from-white/[0.02] to-transparent border-white/10 hover:border-white/20 transition-all group"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            result.quantum_enhanced 
                              ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20' 
                              : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20'
                          }`}>
                            {result.quantum_enhanced ? (
                              <Atom className="w-5 h-5 text-violet-400" />
                            ) : (
                              <Brain className="w-5 h-5 text-cyan-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">{result.model_name}</h4>
                            <p className="text-[10px] text-white/40">
                              {new Date(result.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <span className="text-[9px] text-white/30 uppercase tracking-wider">Execution</span>
                            <p className="font-mono text-sm font-bold text-cyan-400">{result.execution_time_ms}ms</p>
                          </div>
                          <div className="text-right hidden sm:block">
                            <span className="text-[9px] text-white/30 uppercase tracking-wider">Confidence</span>
                            <p className="font-mono text-sm font-bold text-emerald-400">
                              {((result.output_data?.confidence || 0) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right hidden md:block">
                            <span className="text-[9px] text-white/30 uppercase tracking-wider">AQI</span>
                            <p className="font-mono text-sm font-bold text-amber-400">
                              {result.output_data?.predicted_aqi || 'N/A'}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
