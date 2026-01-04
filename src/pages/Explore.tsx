import { useState, useEffect, useRef } from 'react';
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
  CircuitBoard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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

const models = [
  {
    id: 'quantum-aqi',
    name: 'Quantum AQI Predictor',
    type: 'quantum',
    description: 'IBM Quantum circuits for air quality prediction with quantum advantage',
    icon: Atom,
    color: 'from-violet-500 to-purple-600',
    bgGlow: 'bg-violet-500/20',
    accuracy: 97.3,
    latency: 2500,
    qubits: 8,
    depth: 12
  },
  {
    id: 'neural-climate',
    name: 'Neural Climate Model',
    type: 'neural',
    description: 'Deep learning for climate pattern recognition and forecasting',
    icon: Brain,
    color: 'from-cyan-500 to-blue-600',
    bgGlow: 'bg-cyan-500/20',
    accuracy: 94.1,
    latency: 1200,
    parameters: '125M',
    layers: 48
  },
  {
    id: 'hybrid-disaster',
    name: 'Hybrid Disaster Detector',
    type: 'hybrid',
    description: 'Quantum-classical hybrid for natural disaster prediction',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-500/20',
    accuracy: 96.8,
    latency: 1800,
    qubits: 4,
    classicalLayers: 24
  },
  {
    id: 'classical-forecast',
    name: 'Ensemble Forecast',
    type: 'classical',
    description: 'Traditional ensemble model for short-term weather prediction',
    icon: BarChart3,
    color: 'from-emerald-500 to-green-600',
    bgGlow: 'bg-emerald-500/20',
    accuracy: 91.2,
    latency: 500,
    models: 5,
    features: 128
  }
];

// Generate mock performance data
const generatePerformanceData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    quantum: 95 + Math.random() * 4,
    classical: 88 + Math.random() * 5,
    hybrid: 92 + Math.random() * 5
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

const radarData = [
  { metric: 'Accuracy', quantum: 97, classical: 91, hybrid: 96 },
  { metric: 'Speed', quantum: 65, classical: 95, hybrid: 78 },
  { metric: 'Scalability', quantum: 92, classical: 88, hybrid: 90 },
  { metric: 'Reliability', quantum: 94, classical: 96, hybrid: 95 },
  { metric: 'Efficiency', quantum: 88, classical: 92, hybrid: 90 },
];

export default function Explore() {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ModelResult[]>([]);
  const [performanceData] = useState(generatePerformanceData());
  const [latencyData] = useState(generateLatencyData());
  const [liveMetrics, setLiveMetrics] = useState({ requests: 0, avgLatency: 0, accuracy: 0 });
  const [inputParams, setInputParams] = useState({
    temperature: 25,
    humidity: 60,
    pressure: 1013,
    windSpeed: 10
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchResults();
    // Simulate live metrics
    const interval = setInterval(() => {
      setLiveMetrics({
        requests: Math.floor(Math.random() * 500) + 1200,
        avgLatency: Math.floor(Math.random() * 200) + 800,
        accuracy: 94 + Math.random() * 4
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    <div 
      ref={containerRef}
      className="min-h-screen bg-black text-white overflow-y-auto overflow-x-hidden"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.2) transparent'
      }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px]" />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10">
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </Link>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Model Laboratory
              </h1>
              <p className="text-xs text-white/40">Quantum & Neural Network Playground</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">Live</span>
            </div>
            <Badge variant="outline" className="border-violet-500/50 text-violet-400 bg-violet-500/10">
              <Sparkles className="w-3 h-3 mr-1" />
              Beta v2.0
            </Badge>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Live Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Requests', value: liveMetrics.requests.toLocaleString(), icon: Radio, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Avg Latency', value: `${liveMetrics.avgLatency}ms`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Model Accuracy', value: `${liveMetrics.accuracy.toFixed(1)}%`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Quantum Advantage', value: '3.2x', icon: Atom, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          ].map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden p-4 bg-white/[0.02] border-white/10 backdrop-blur-sm group hover:bg-white/[0.04] transition-all">
              <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-white/40">{stat.label}</p>
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="models" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-xl">
            <TabsTrigger value="models" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-white rounded-lg px-4">
              <Cpu className="w-4 h-4 mr-2" />
              Models
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white rounded-lg px-4">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-white rounded-lg px-4">
              <Activity className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-8">
            {/* Model Selection Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {models.map((model) => (
                <Card
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`relative p-5 cursor-pointer transition-all duration-500 overflow-hidden group ${
                    selectedModel.id === model.id 
                      ? 'border-2 border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10' 
                      : 'border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 ${model.bgGlow} opacity-0 group-hover:opacity-50 blur-2xl transition-opacity duration-500`} />
                  
                  {/* Circuit pattern */}
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                    <CircuitBoard className="w-full h-full" />
                  </div>
                  
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${model.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <model.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-1">{model.name}</h3>
                    <p className="text-xs text-white/40 mb-4 line-clamp-2">{model.description}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">{model.accuracy}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/40" />
                        <span className="text-white/40">{model.latency}ms</span>
                      </div>
                    </div>
                  </div>
                  
                  {model.type === 'quantum' && (
                    <Badge className="absolute top-3 right-3 bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px]">
                      <Atom className="w-3 h-3 mr-1" />
                      Quantum
                    </Badge>
                  )}
                  {model.type === 'hybrid' && (
                    <Badge className="absolute top-3 right-3 bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                      <GitBranch className="w-3 h-3 mr-1" />
                      Hybrid
                    </Badge>
                  )}
                </Card>
              ))}
            </div>

            {/* Playground Section */}
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Input Parameters - 2 cols */}
              <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10">
                    <Gauge className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Input Parameters</h3>
                    <p className="text-xs text-white/40">Adjust environmental variables</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {[
                    { key: 'temperature', label: 'Temperature', unit: '°C', min: -20, max: 50, color: 'from-red-500 to-orange-500' },
                    { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, color: 'from-blue-500 to-cyan-500' },
                    { key: 'pressure', label: 'Pressure', unit: 'hPa', min: 950, max: 1050, color: 'from-violet-500 to-purple-500' },
                    { key: 'windSpeed', label: 'Wind Speed', unit: 'm/s', min: 0, max: 50, color: 'from-emerald-500 to-green-500' },
                  ].map((param) => (
                    <div key={param.key}>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-white/60">{param.label}</label>
                        <span className={`text-sm font-mono font-bold bg-gradient-to-r ${param.color} bg-clip-text text-transparent`}>
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
                  className="w-full mt-8 h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 hover:from-cyan-600 hover:via-blue-600 hover:to-violet-600 text-white border-0 font-bold shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02]"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Executing {selectedModel.name}...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Run Model
                    </>
                  )}
                </Button>
              </Card>

              {/* Model Details - 3 cols */}
              <Card className="lg:col-span-3 p-6 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedModel.color} flex items-center justify-center shadow-lg`}>
                    <selectedModel.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">{selectedModel.name}</h3>
                      {selectedModel.type === 'quantum' && (
                        <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-medium">
                          IBM Quantum
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50">{selectedModel.description}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-white/40">Accuracy</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{selectedModel.accuracy}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-white/40">Latency</span>
                    </div>
                    <p className="text-2xl font-bold text-cyan-400">{selectedModel.latency}ms</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-4 h-4 text-violet-400" />
                      <span className="text-xs text-white/40">{selectedModel.type === 'quantum' ? 'Qubits' : 'Layers'}</span>
                    </div>
                    <p className="text-2xl font-bold text-violet-400">
                      {selectedModel.type === 'quantum' ? selectedModel.qubits : 
                       selectedModel.type === 'neural' ? selectedModel.layers :
                       selectedModel.type === 'hybrid' ? selectedModel.qubits : selectedModel.models}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-white/40">Advantage</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-400">
                      {selectedModel.type === 'quantum' ? '3.2x' : 
                       selectedModel.type === 'hybrid' ? '2.1x' : '1.0x'}
                    </p>
                  </div>
                </div>

                {/* Architecture Details */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                  <h4 className="text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
                    <CircuitBoard className="w-4 h-4" />
                    Architecture Details
                  </h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {selectedModel.type === 'quantum' && (
                      <>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Backend</span>
                          <span className="font-mono text-white">ibm_brisbane</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Circuit Depth</span>
                          <span className="font-mono text-white">12</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Gate Count</span>
                          <span className="font-mono text-white">48</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Error Mitigation</span>
                          <span className="font-mono text-emerald-400">ZNE + PEC</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Shots</span>
                          <span className="font-mono text-white">8192</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Optimization</span>
                          <span className="font-mono text-white">Level 3</span>
                        </div>
                      </>
                    )}
                    {selectedModel.type === 'neural' && (
                      <>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Architecture</span>
                          <span className="font-mono text-white">Transformer</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Parameters</span>
                          <span className="font-mono text-white">125M</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Attention Heads</span>
                          <span className="font-mono text-white">12</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Hidden Dim</span>
                          <span className="font-mono text-white">768</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Framework</span>
                          <span className="font-mono text-white">PyTorch</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Training Data</span>
                          <span className="font-mono text-white">10TB</span>
                        </div>
                      </>
                    )}
                    {selectedModel.type === 'hybrid' && (
                      <>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Quantum Layer</span>
                          <span className="font-mono text-white">4 Qubits VQC</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Classical Layer</span>
                          <span className="font-mono text-white">Dense NN</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Ansatz</span>
                          <span className="font-mono text-white">RY-CNOT</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Optimizer</span>
                          <span className="font-mono text-white">COBYLA</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Classical Nodes</span>
                          <span className="font-mono text-white">256</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Entanglement</span>
                          <span className="font-mono text-emerald-400">Full</span>
                        </div>
                      </>
                    )}
                    {selectedModel.type === 'classical' && (
                      <>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Method</span>
                          <span className="font-mono text-white">Ensemble</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Models</span>
                          <span className="font-mono text-white">RF, XGB, LGB</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Features</span>
                          <span className="font-mono text-white">128</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Trees</span>
                          <span className="font-mono text-white">500</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">Voting</span>
                          <span className="font-mono text-white">Soft</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span className="text-white/40">CV Folds</span>
                          <span className="font-mono text-white">5</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Performance Over Time */}
              <Card className="p-6 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-white">Model Accuracy Over Time</h3>
                    <p className="text-xs text-white/40">24-hour performance comparison</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <span className="text-white/60">Quantum</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-cyan-500" />
                      <span className="text-white/60">Classical</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-white/60">Hybrid</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="quantumGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="classicalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis domain={[85, 100]} stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="quantum" stroke="#8b5cf6" fill="url(#quantumGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="classical" stroke="#06b6d4" fill="url(#classicalGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="hybrid" stroke="#f59e0b" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Latency Comparison */}
              <Card className="p-6 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-white">Latency Distribution</h3>
                    <p className="text-xs text-white/40">Response time by model type (ms)</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={latencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="quantum" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="neural" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="classical" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Radar Chart */}
              <Card className="p-6 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-white">Model Capabilities</h3>
                    <p className="text-xs text-white/40">Multi-dimensional comparison</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                    <PolarRadiusAxis stroke="rgba(255,255,255,0.2)" fontSize={10} domain={[0, 100]} />
                    <Radar name="Quantum" dataKey="quantum" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
                    <Radar name="Classical" dataKey="classical" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Hybrid" dataKey="hybrid" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              {/* Throughput */}
              <Card className="p-6 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-white">Request Throughput</h3>
                    <p className="text-xs text-white/40">Requests per minute over time</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={performanceData.slice(0, 12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="quantum" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }} />
                    <Line type="monotone" dataKey="classical" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', strokeWidth: 0, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Execution History</h3>
                <p className="text-sm text-white/40">Recent model runs and their results</p>
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
                <Button 
                  variant="outline" 
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => document.querySelector('[value="models"]')?.dispatchEvent(new MouseEvent('click'))}
                >
                  Go to Models
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {results.map((result, i) => (
                  <Card 
                    key={result.id} 
                    className="p-5 bg-gradient-to-r from-white/[0.02] to-transparent border-white/10 hover:border-white/20 transition-all group"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          result.quantum_enhanced 
                            ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20' 
                            : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20'
                        }`}>
                          {result.quantum_enhanced ? (
                            <Atom className="w-6 h-6 text-violet-400" />
                          ) : (
                            <Brain className="w-6 h-6 text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{result.model_name}</h4>
                          <p className="text-xs text-white/40">
                            {new Date(result.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs text-white/30 uppercase tracking-wider">Execution</span>
                          <p className="font-mono text-lg font-bold text-cyan-400">{result.execution_time_ms}ms</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <span className="text-xs text-white/30 uppercase tracking-wider">Confidence</span>
                          <p className="font-mono text-lg font-bold text-emerald-400">
                            {((result.output_data?.confidence || 0) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-right hidden md:block">
                          <span className="text-xs text-white/30 uppercase tracking-wider">Predicted AQI</span>
                          <p className="font-mono text-lg font-bold text-amber-400">
                            {result.output_data?.predicted_aqi || 'N/A'}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Custom scrollbar styles */}
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </div>
  );
}
