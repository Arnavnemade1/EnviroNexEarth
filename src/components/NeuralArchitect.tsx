import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Boxes, 
  Plus, 
  Trash2, 
  Play, 
  Download, 
  Layers, 
  Cpu,
  ChevronDown,
  ChevronUp,
  Copy,
  Zap,
  Activity,
  Settings,
  Code,
  FileJson,
  Sparkles,
  ArrowRight,
  GripVertical,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

interface Layer {
  id: string;
  type: 'input' | 'dense' | 'conv2d' | 'lstm' | 'dropout' | 'batchnorm' | 'attention' | 'quantum' | 'output';
  name: string;
  params: Record<string, number | string>;
  color: string;
}

const layerTemplates: Omit<Layer, 'id'>[] = [
  { type: 'input', name: 'Input Layer', params: { shape: '(batch, 24, 7)' }, color: 'from-emerald-500 to-green-500' },
  { type: 'dense', name: 'Dense Layer', params: { units: 128, activation: 'relu' }, color: 'from-blue-500 to-cyan-500' },
  { type: 'conv2d', name: 'Conv2D Layer', params: { filters: 64, kernel: 3, activation: 'relu' }, color: 'from-violet-500 to-purple-500' },
  { type: 'lstm', name: 'LSTM Layer', params: { units: 64, returnSeq: 'false' }, color: 'from-rose-500 to-pink-500' },
  { type: 'attention', name: 'Attention', params: { heads: 8, dim: 64 }, color: 'from-amber-500 to-orange-500' },
  { type: 'quantum', name: 'Quantum Layer', params: { qubits: 4, depth: 6 }, color: 'from-fuchsia-500 to-violet-500' },
  { type: 'dropout', name: 'Dropout', params: { rate: 0.2 }, color: 'from-slate-500 to-gray-500' },
  { type: 'batchnorm', name: 'BatchNorm', params: { momentum: 0.99 }, color: 'from-teal-500 to-cyan-500' },
  { type: 'output', name: 'Output Layer', params: { units: 1, activation: 'linear' }, color: 'from-red-500 to-rose-500' },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function NeuralArchitect() {
  const [layers, setLayers] = useState<Layer[]>([
    { id: generateId(), type: 'input', name: 'Input Layer', params: { shape: '(batch, 24, 7)' }, color: 'from-emerald-500 to-green-500' },
    { id: generateId(), type: 'dense', name: 'Dense Layer', params: { units: 256, activation: 'relu' }, color: 'from-blue-500 to-cyan-500' },
    { id: generateId(), type: 'dropout', name: 'Dropout', params: { rate: 0.3 }, color: 'from-slate-500 to-gray-500' },
    { id: generateId(), type: 'dense', name: 'Dense Layer', params: { units: 128, activation: 'relu' }, color: 'from-blue-500 to-cyan-500' },
    { id: generateId(), type: 'output', name: 'Output Layer', params: { units: 1, activation: 'linear' }, color: 'from-red-500 to-rose-500' },
  ]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [modelName, setModelName] = useState('MyCustomModel');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledStatus, setCompiledStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showCode, setShowCode] = useState(false);

  const addLayer = (template: Omit<Layer, 'id'>) => {
    const newLayer: Layer = { ...template, id: generateId() };
    
    // Insert before output layer if exists
    const outputIndex = layers.findIndex(l => l.type === 'output');
    if (outputIndex !== -1) {
      const newLayers = [...layers];
      newLayers.splice(outputIndex, 0, newLayer);
      setLayers(newLayers);
    } else {
      setLayers([...layers, newLayer]);
    }
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayer === id) setSelectedLayer(null);
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= layers.length) return;
    
    const newLayers = [...layers];
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    setLayers(newLayers);
  };

  const updateLayerParam = (layerId: string, paramKey: string, value: number | string) => {
    setLayers(layers.map(l => 
      l.id === layerId 
        ? { ...l, params: { ...l.params, [paramKey]: value } }
        : l
    ));
  };

  const compileModel = async () => {
    setIsCompiling(true);
    setCompiledStatus('idle');
    
    // Simulate compilation
    await new Promise(r => setTimeout(r, 1500));
    
    // Check for errors
    const hasInput = layers.some(l => l.type === 'input');
    const hasOutput = layers.some(l => l.type === 'output');
    
    if (!hasInput || !hasOutput) {
      setCompiledStatus('error');
    } else {
      setCompiledStatus('success');
    }
    
    setIsCompiling(false);
  };

  const calculateParams = () => {
    let total = 0;
    layers.forEach(layer => {
      if (layer.type === 'dense') total += (layer.params.units as number) * 128;
      if (layer.type === 'conv2d') total += (layer.params.filters as number) * (layer.params.kernel as number) ** 2 * 64;
      if (layer.type === 'lstm') total += (layer.params.units as number) * 4 * 128;
      if (layer.type === 'attention') total += (layer.params.heads as number) * (layer.params.dim as number) ** 2;
      if (layer.type === 'quantum') total += 2 ** (layer.params.qubits as number) * (layer.params.depth as number);
    });
    return total;
  };

  const generateCode = () => {
    let code = `import torch\nimport torch.nn as nn\n\nclass ${modelName}(nn.Module):\n    def __init__(self):\n        super().__init__()\n`;
    
    layers.forEach((layer, i) => {
      if (layer.type === 'dense') {
        code += `        self.fc${i} = nn.Linear(in_features, ${layer.params.units})\n`;
      } else if (layer.type === 'dropout') {
        code += `        self.dropout${i} = nn.Dropout(${layer.params.rate})\n`;
      } else if (layer.type === 'batchnorm') {
        code += `        self.bn${i} = nn.BatchNorm1d(features)\n`;
      }
    });
    
    code += `\n    def forward(self, x):\n`;
    layers.forEach((layer, i) => {
      if (layer.type === 'dense') {
        code += `        x = torch.relu(self.fc${i}(x))\n`;
      } else if (layer.type === 'dropout') {
        code += `        x = self.dropout${i}(x)\n`;
      }
    });
    code += `        return x\n`;
    
    return code;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20">
            <Boxes className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Neural Architect</h2>
            <p className="text-sm text-white/40">Design custom neural network architectures</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Input
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-48 bg-white/5 border-white/10 text-white text-sm"
            placeholder="Model name"
          />
          <Button 
            onClick={compileModel}
            disabled={isCompiling}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white"
          >
            {isCompiling ? (
              <Activity className="w-4 h-4 mr-2 animate-pulse" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isCompiling ? 'Compiling...' : 'Compile'}
          </Button>
          <Button 
            variant="outline" 
            className="border-white/20 text-white/60 hover:bg-white/5"
            onClick={() => setShowCode(!showCode)}
          >
            <Code className="w-4 h-4 mr-2" />
            {showCode ? 'Hide Code' : 'View Code'}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {compiledStatus !== 'idle' && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${
          compiledStatus === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {compiledStatus === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-sm font-medium">
            {compiledStatus === 'success' 
              ? 'Model compiled successfully! Ready for training.'
              : 'Compilation failed: Model must have Input and Output layers.'}
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Layer Palette */}
        <Card className="lg:col-span-3 p-4 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 h-fit">
          <h3 className="text-sm font-bold text-white mb-4">Layer Palette</h3>
          <div className="space-y-2">
            {layerTemplates.filter(t => t.type !== 'input' && t.type !== 'output').map(template => (
              <button
                key={template.type}
                onClick={() => addLayer(template)}
                className={`w-full p-3 rounded-lg bg-gradient-to-r ${template.color} bg-opacity-10 border border-white/10 hover:border-white/30 transition-all text-left group`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{template.name}</span>
                  <Plus className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                </div>
              </button>
            ))}
          </div>

          {/* Model Stats */}
          <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Layers</span>
              <span className="font-mono text-white">{layers.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Parameters</span>
              <span className="font-mono text-white">{(calculateParams() / 1000).toFixed(1)}K</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Est. Memory</span>
              <span className="font-mono text-white">{((calculateParams() * 4) / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        </Card>

        {/* Architecture Canvas */}
        <Card className="lg:col-span-6 p-6 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Model Architecture</h3>
            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
              {layers.length} Layers
            </Badge>
          </div>

          <div className="space-y-3">
            {layers.map((layer, index) => (
              <div key={layer.id} className="relative">
                {/* Connection Line */}
                {index > 0 && (
                  <div className="absolute left-1/2 -top-3 w-0.5 h-3 bg-gradient-to-b from-white/20 to-white/5" />
                )}
                
                <div 
                  onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
                  className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedLayer === layer.id 
                      ? 'border-white/40 bg-white/10' 
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Layer Icon */}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${layer.color} flex items-center justify-center shadow-lg`}>
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Layer Info */}
                    <div className="flex-1">
                      <p className="font-medium text-white">{layer.name}</p>
                      <p className="text-xs text-white/40 font-mono">
                        {Object.entries(layer.params).map(([k, v]) => `${k}=${v}`).join(', ')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); }}
                        className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-30"
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); }}
                        className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-30"
                        disabled={index === layers.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                        className="p-1.5 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                {index < layers.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-4 h-4 text-white/20 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Layer Config Panel */}
        <Card className="lg:col-span-3 p-4 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 h-fit">
          <h3 className="text-sm font-bold text-white mb-4">Layer Configuration</h3>
          
          {selectedLayer ? (
            <div className="space-y-4">
              {(() => {
                const layer = layers.find(l => l.id === selectedLayer);
                if (!layer) return null;

                return (
                  <>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                      <p className="text-sm font-medium text-white">{layer.name}</p>
                      <p className="text-xs text-white/40">{layer.type}</p>
                    </div>

                    {Object.entries(layer.params).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-xs text-white/40 uppercase mb-2 block">{key}</label>
                        {typeof value === 'number' ? (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-white/60">{key}</span>
                              <span className="text-sm font-mono text-white">{value}</span>
                            </div>
                            <Slider
                              value={[value]}
                              onValueChange={([v]) => updateLayerParam(layer.id, key, v)}
                              min={key === 'rate' ? 0 : key === 'momentum' ? 0.9 : 1}
                              max={key === 'rate' ? 1 : key === 'momentum' ? 1 : key === 'qubits' ? 12 : 512}
                              step={key === 'rate' || key === 'momentum' ? 0.05 : 1}
                            />
                          </>
                        ) : (
                          <Input
                            value={value}
                            onChange={(e) => updateLayerParam(layer.id, key, e.target.value)}
                            className="bg-white/5 border-white/10 text-white text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-8 text-white/30">
              <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a layer to configure</p>
            </div>
          )}

          {/* Export Options */}
          <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
            <Button variant="outline" className="w-full border-white/20 text-white/60 hover:bg-white/5 justify-start">
              <FileJson className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" className="w-full border-white/20 text-white/60 hover:bg-white/5 justify-start">
              <Code className="w-4 h-4 mr-2" />
              Export PyTorch
            </Button>
            <Button variant="outline" className="w-full border-white/20 text-white/60 hover:bg-white/5 justify-start">
              <Download className="w-4 h-4 mr-2" />
              Download ONNX
            </Button>
          </div>
        </Card>
      </div>

      {/* Code View */}
      {showCode && (
        <Card className="p-4 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Generated PyTorch Code</h3>
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-black/50 text-sm font-mono text-emerald-400 overflow-x-auto">
            {generateCode()}
          </pre>
        </Card>
      )}
    </div>
  );
}
