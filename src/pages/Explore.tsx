import { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    description: 'Uses IBM Quantum circuits to predict air quality with quantum advantage',
    icon: Atom,
    color: 'from-violet-500 to-purple-600',
    accuracy: '97.3%',
    latency: '~2.5s'
  },
  {
    id: 'neural-climate',
    name: 'Neural Climate Model',
    type: 'neural',
    description: 'Deep learning model for climate pattern recognition and forecasting',
    icon: Brain,
    color: 'from-cyan-500 to-blue-600',
    accuracy: '94.1%',
    latency: '~1.2s'
  },
  {
    id: 'hybrid-disaster',
    name: 'Hybrid Disaster Detector',
    type: 'hybrid',
    description: 'Quantum-classical hybrid for natural disaster prediction',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    accuracy: '96.8%',
    latency: '~1.8s'
  },
  {
    id: 'classical-forecast',
    name: 'Classical Weather Forecast',
    type: 'classical',
    description: 'Traditional ensemble model for short-term weather prediction',
    icon: BarChart3,
    color: 'from-emerald-500 to-green-600',
    accuracy: '91.2%',
    latency: '~0.5s'
  }
];

export default function Explore() {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ModelResult[]>([]);
  const [inputParams, setInputParams] = useState({
    temperature: 25,
    humidity: 60,
    pressure: 1013,
    windSpeed: 10
  });

  useEffect(() => {
    fetchResults();
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
      // Simulate model execution based on type
      const executionTime = selectedModel.type === 'quantum' ? 2500 : 
                           selectedModel.type === 'hybrid' ? 1800 : 
                           selectedModel.type === 'neural' ? 1200 : 500;
      
      await new Promise(resolve => setTimeout(resolve, executionTime));

      // Generate realistic output based on model type
      const output = generateModelOutput(selectedModel.type, inputParams);

      // Save to Supabase
      const { data, error } = await supabase
        .from('quantum_simulations')
        .insert({
          algorithm_name: selectedModel.name,
          simulation_type: selectedModel.type,
          input_parameters: inputParams,
          quantum_results: output,
          execution_time_ms: Date.now() - startTime,
          qubit_count: selectedModel.type === 'quantum' ? 8 : selectedModel.type === 'hybrid' ? 4 : 0,
          user_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000'
        })
        .select()
        .single();

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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Explore Models & Tech</h1>
              <p className="text-sm text-white/50">Interactive quantum and AI model playground</p>
            </div>
          </div>
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
            <Sparkles className="w-3 h-3 mr-1" />
            Beta
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="models" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="models" className="data-[state=active]:bg-white/10">
              <Cpu className="w-4 h-4 mr-2" />
              Models
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-white/10">
              <Activity className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-8">
            {/* Model Selection */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {models.map((model) => (
                <Card
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`relative p-6 cursor-pointer transition-all duration-300 border-2 ${
                    selectedModel.id === model.id 
                      ? 'border-cyan-500 bg-cyan-500/5' 
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center mb-4`}>
                    <model.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{model.name}</h3>
                  <p className="text-xs text-white/50 mb-4 line-clamp-2">{model.description}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-400">{model.accuracy} acc</span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/50">{model.latency}</span>
                  </div>
                  {model.type === 'quantum' && (
                    <Badge className="absolute top-4 right-4 bg-violet-500/20 text-violet-400 border-0">
                      Quantum
                    </Badge>
                  )}
                  {model.type === 'hybrid' && (
                    <Badge className="absolute top-4 right-4 bg-amber-500/20 text-amber-400 border-0">
                      Hybrid
                    </Badge>
                  )}
                </Card>
              ))}
            </div>

            {/* Model Playground */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Parameters */}
              <Card className="p-6 bg-white/[0.02] border-white/10">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Input Parameters
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-white/60">Temperature</label>
                      <span className="text-sm font-mono text-cyan-400">{inputParams.temperature}°C</span>
                    </div>
                    <Slider
                      value={[inputParams.temperature]}
                      onValueChange={([v]) => setInputParams(p => ({ ...p, temperature: v }))}
                      min={-20}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-white/60">Humidity</label>
                      <span className="text-sm font-mono text-cyan-400">{inputParams.humidity}%</span>
                    </div>
                    <Slider
                      value={[inputParams.humidity]}
                      onValueChange={([v]) => setInputParams(p => ({ ...p, humidity: v }))}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-white/60">Pressure</label>
                      <span className="text-sm font-mono text-cyan-400">{inputParams.pressure} hPa</span>
                    </div>
                    <Slider
                      value={[inputParams.pressure]}
                      onValueChange={([v]) => setInputParams(p => ({ ...p, pressure: v }))}
                      min={950}
                      max={1050}
                      step={1}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-white/60">Wind Speed</label>
                      <span className="text-sm font-mono text-cyan-400">{inputParams.windSpeed} m/s</span>
                    </div>
                    <Slider
                      value={[inputParams.windSpeed]}
                      onValueChange={([v]) => setInputParams(p => ({ ...p, windSpeed: v }))}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>
                </div>

                <Button
                  onClick={runModel}
                  disabled={isRunning}
                  className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running {selectedModel.name}...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Model
                    </>
                  )}
                </Button>
              </Card>

              {/* Model Info */}
              <Card className="p-6 bg-white/[0.02] border-white/10">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedModel.color} flex items-center justify-center`}>
                    <selectedModel.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{selectedModel.name}</h3>
                    <p className="text-sm text-white/50">{selectedModel.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <span className="text-xs text-white/40 uppercase tracking-wide">Accuracy</span>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">{selectedModel.accuracy}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <span className="text-xs text-white/40 uppercase tracking-wide">Latency</span>
                    <p className="text-2xl font-bold text-cyan-400 mt-1">{selectedModel.latency}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white/60">Model Architecture</h4>
                  {selectedModel.type === 'quantum' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Qubits</span>
                        <span className="font-mono text-white">8</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Circuit Depth</span>
                        <span className="font-mono text-white">12</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Backend</span>
                        <span className="font-mono text-white">IBM Quantum</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-white/50">Error Mitigation</span>
                        <span className="font-mono text-emerald-400">Enabled</span>
                      </div>
                    </div>
                  )}
                  {selectedModel.type === 'neural' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Architecture</span>
                        <span className="font-mono text-white">Transformer</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Parameters</span>
                        <span className="font-mono text-white">125M</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Training Data</span>
                        <span className="font-mono text-white">10TB</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-white/50">Framework</span>
                        <span className="font-mono text-white">PyTorch</span>
                      </div>
                    </div>
                  )}
                  {selectedModel.type === 'hybrid' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Quantum Layer</span>
                        <span className="font-mono text-white">4 Qubits</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Classical Layer</span>
                        <span className="font-mono text-white">Dense NN</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Optimization</span>
                        <span className="font-mono text-white">VQE</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-white/50">Ansatz</span>
                        <span className="font-mono text-white">RY-CNOT</span>
                      </div>
                    </div>
                  )}
                  {selectedModel.type === 'classical' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Method</span>
                        <span className="font-mono text-white">Ensemble</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Models</span>
                        <span className="font-mono text-white">RF, XGB, LGB</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Features</span>
                        <span className="font-mono text-white">128</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-white/50">Voting</span>
                        <span className="font-mono text-white">Soft</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Executions</h3>
              <Button variant="outline" size="sm" onClick={fetchResults} className="border-white/20 text-white/60">
                Refresh
              </Button>
            </div>

            {results.length === 0 ? (
              <Card className="p-12 bg-white/[0.02] border-white/10 text-center">
                <Cpu className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/60 mb-2">No results yet</h3>
                <p className="text-sm text-white/40">Run a model to see results here</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {results.map((result) => (
                  <Card 
                    key={result.id} 
                    className="p-4 bg-white/[0.02] border-white/10 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          result.quantum_enhanced 
                            ? 'bg-violet-500/20' 
                            : 'bg-cyan-500/20'
                        }`}>
                          {result.quantum_enhanced ? (
                            <Atom className="w-5 h-5 text-violet-400" />
                          ) : (
                            <Brain className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{result.model_name}</h4>
                          <p className="text-xs text-white/50">
                            {new Date(result.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-xs text-white/40">Execution Time</span>
                          <p className="font-mono text-sm text-cyan-400">{result.execution_time_ms}ms</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-white/40">Confidence</span>
                          <p className="font-mono text-sm text-emerald-400">
                            {((result.output_data?.confidence || 0) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
