import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shuffle, 
  RotateCw, 
  Maximize2, 
  Contrast, 
  Waves, 
  Scissors, 
  Play, 
  Pause,
  RefreshCw,
  Eye,
  Layers,
  Zap,
  ChevronRight,
  Sparkles,
  Activity,
  SunMoon,
  Move,
  FlipHorizontal,
  Grid3X3,
  Droplets,
  Blend,
  CircleDashed
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AugmentationTechnique {
  id: string;
  name: string;
  category: 'geometric' | 'color' | 'noise' | 'advanced';
  icon: any;
  description: string;
  parameters: {
    name: string;
    min: number;
    max: number;
    default: number;
    step: number;
  }[];
}

const augmentationTechniques: AugmentationTechnique[] = [
  {
    id: 'rotation',
    name: 'Random Rotation',
    category: 'geometric',
    icon: RotateCw,
    description: 'Rotate image by random angle',
    parameters: [{ name: 'Max Angle', min: 0, max: 180, default: 45, step: 5 }]
  },
  {
    id: 'flip',
    name: 'Horizontal Flip',
    category: 'geometric',
    icon: FlipHorizontal,
    description: 'Mirror image horizontally',
    parameters: [{ name: 'Probability', min: 0, max: 100, default: 50, step: 10 }]
  },
  {
    id: 'scale',
    name: 'Random Scale',
    category: 'geometric',
    icon: Maximize2,
    description: 'Scale image randomly',
    parameters: [{ name: 'Scale Range', min: 0.5, max: 2, default: 1.2, step: 0.1 }]
  },
  {
    id: 'translate',
    name: 'Random Translation',
    category: 'geometric',
    icon: Move,
    description: 'Shift image position',
    parameters: [{ name: 'Max Shift', min: 0, max: 50, default: 20, step: 5 }]
  },
  {
    id: 'brightness',
    name: 'Brightness Jitter',
    category: 'color',
    icon: SunMoon,
    description: 'Adjust brightness randomly',
    parameters: [{ name: 'Intensity', min: 0, max: 100, default: 30, step: 5 }]
  },
  {
    id: 'contrast',
    name: 'Contrast Adjustment',
    category: 'color',
    icon: Contrast,
    description: 'Modify contrast levels',
    parameters: [{ name: 'Range', min: 0.5, max: 2, default: 1.3, step: 0.1 }]
  },
  {
    id: 'saturation',
    name: 'Color Saturation',
    category: 'color',
    icon: Droplets,
    description: 'Adjust color saturation',
    parameters: [{ name: 'Factor', min: 0, max: 2, default: 1.2, step: 0.1 }]
  },
  {
    id: 'hue',
    name: 'Hue Shift',
    category: 'color',
    icon: Blend,
    description: 'Shift color hue',
    parameters: [{ name: 'Degrees', min: -180, max: 180, default: 30, step: 10 }]
  },
  {
    id: 'gaussian_noise',
    name: 'Gaussian Noise',
    category: 'noise',
    icon: Waves,
    description: 'Add random gaussian noise',
    parameters: [{ name: 'Std Dev', min: 0, max: 50, default: 10, step: 2 }]
  },
  {
    id: 'blur',
    name: 'Gaussian Blur',
    category: 'noise',
    icon: CircleDashed,
    description: 'Apply blur effect',
    parameters: [{ name: 'Kernel Size', min: 1, max: 15, default: 3, step: 2 }]
  },
  {
    id: 'cutout',
    name: 'Random Cutout',
    category: 'advanced',
    icon: Scissors,
    description: 'Randomly erase regions',
    parameters: [{ name: 'Num Holes', min: 1, max: 10, default: 3, step: 1 }]
  },
  {
    id: 'mixup',
    name: 'MixUp',
    category: 'advanced',
    icon: Shuffle,
    description: 'Blend with another sample',
    parameters: [{ name: 'Alpha', min: 0, max: 1, default: 0.4, step: 0.1 }]
  },
  {
    id: 'mosaic',
    name: 'Mosaic Augmentation',
    category: 'advanced',
    icon: Grid3X3,
    description: 'Combine multiple images',
    parameters: [{ name: 'Grid Size', min: 2, max: 4, default: 2, step: 1 }]
  },
];

// Sample data grid visualization
const generateDataGrid = (size: number = 8) => {
  return Array.from({ length: size * size }, (_, i) => ({
    id: i,
    originalValue: Math.random(),
    augmentedValue: 0,
    x: i % size,
    y: Math.floor(i / size),
  }));
};

// Apply augmentation transforms visually
const applyAugmentation = (
  data: ReturnType<typeof generateDataGrid>,
  techniques: string[],
  params: Record<string, number>
) => {
  return data.map(cell => {
    let value = cell.originalValue;
    
    techniques.forEach(tech => {
      switch (tech) {
        case 'rotation':
          value = (value + 0.2 * (params.rotation || 45) / 180) % 1;
          break;
        case 'flip':
          if (Math.random() < (params.flip || 50) / 100) value = 1 - value;
          break;
        case 'brightness':
          value = Math.min(1, Math.max(0, value + ((params.brightness || 30) / 100 - 0.5) * 0.4));
          break;
        case 'contrast':
          const contrast = params.contrast || 1.3;
          value = Math.min(1, Math.max(0, (value - 0.5) * contrast + 0.5));
          break;
        case 'gaussian_noise':
          const noise = (Math.random() - 0.5) * (params.gaussian_noise || 10) / 100;
          value = Math.min(1, Math.max(0, value + noise));
          break;
        case 'blur':
          // Simulate blur by averaging nearby
          value = value * 0.7 + 0.3 * Math.random();
          break;
        case 'cutout':
          if (Math.random() < 0.2) value = 0;
          break;
        case 'mixup':
          const alpha = params.mixup || 0.4;
          value = value * (1 - alpha) + Math.random() * alpha;
          break;
        default:
          value = (value + Math.random() * 0.1) % 1;
      }
    });
    
    return {
      ...cell,
      augmentedValue: value,
    };
  });
};

export default function DataAugmentationVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(['rotation', 'flip', 'brightness']);
  const [dataGrid, setDataGrid] = useState(generateDataGrid());
  const [augmentedGrid, setAugmentedGrid] = useState(dataGrid);
  const [params, setParams] = useState<Record<string, number>>({});
  const [sampleCount, setSampleCount] = useState(0);
  const [augmentationSpeed, setAugmentationSpeed] = useState(500);
  const [datasetType, setDatasetType] = useState('environmental');
  const [showDiff, setShowDiff] = useState(false);
  const [liveStats, setLiveStats] = useState({ variance: 0, coverage: 0, diversity: 0 });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize default params
  useEffect(() => {
    const defaultParams: Record<string, number> = {};
    augmentationTechniques.forEach(tech => {
      tech.parameters.forEach(p => {
        defaultParams[tech.id] = p.default;
      });
    });
    setParams(defaultParams);
  }, []);

  // Real-time augmentation animation
  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const newData = generateDataGrid();
      const augmented = applyAugmentation(newData, selectedTechniques, params);
      setDataGrid(newData);
      setAugmentedGrid(augmented);
      setSampleCount(prev => prev + 1);
      
      // Calculate live stats
      const variance = augmented.reduce((acc, cell) => 
        acc + Math.pow(cell.augmentedValue - cell.originalValue, 2), 0) / augmented.length;
      const coverage = selectedTechniques.length / augmentationTechniques.length * 100;
      const diversity = Math.min(100, variance * 500 + selectedTechniques.length * 10);
      
      setLiveStats({
        variance: parseFloat(variance.toFixed(4)),
        coverage: parseFloat(coverage.toFixed(1)),
        diversity: parseFloat(diversity.toFixed(1))
      });
    }, augmentationSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, selectedTechniques, params, augmentationSpeed]);

  // Manual augmentation trigger
  const triggerAugmentation = useCallback(() => {
    const augmented = applyAugmentation(dataGrid, selectedTechniques, params);
    setAugmentedGrid(augmented);
    setSampleCount(prev => prev + 1);
  }, [dataGrid, selectedTechniques, params]);

  const toggleTechnique = (id: string) => {
    setSelectedTechniques(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const resetVisualization = () => {
    setIsPlaying(false);
    const newData = generateDataGrid();
    setDataGrid(newData);
    setAugmentedGrid(newData);
    setSampleCount(0);
    setLiveStats({ variance: 0, coverage: 0, diversity: 0 });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'geometric': return 'text-violet-400 bg-violet-500/20 border-violet-500/30';
      case 'color': return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
      case 'noise': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'advanced': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20">
            <Sparkles className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Data Augmentation Visualizer</h2>
            <p className="text-xs text-white/40">Real-time transformation preview with {augmentationTechniques.length} techniques</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={datasetType} onValueChange={setDatasetType}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="environmental">Environmental Data</SelectItem>
              <SelectItem value="satellite">Satellite Imagery</SelectItem>
              <SelectItem value="sensor">Sensor Readings</SelectItem>
              <SelectItem value="timeseries">Time Series</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>Show Diff</span>
            <Switch checked={showDiff} onCheckedChange={setShowDiff} />
          </div>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Samples Generated', value: sampleCount.toLocaleString(), icon: Layers, color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-cyan-500/5' },
          { label: 'Data Variance', value: liveStats.variance.toString(), icon: Activity, color: 'text-violet-400', gradient: 'from-violet-500/20 to-violet-500/5' },
          { label: 'Technique Coverage', value: `${liveStats.coverage.toFixed(0)}%`, icon: Eye, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-emerald-500/5' },
          { label: 'Diversity Score', value: `${liveStats.diversity.toFixed(0)}%`, icon: Zap, color: 'text-amber-400', gradient: 'from-amber-500/20 to-amber-500/5' },
        ].map(stat => (
          <Card key={stat.label} className={`p-3 bg-gradient-to-br ${stat.gradient} border-white/5`}>
            <div className="flex items-center gap-2">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className="text-[10px] text-white/50 uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className={`text-lg font-bold font-mono ${stat.color} mt-1`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Techniques Panel */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-pink-400" />
                Augmentation Pipeline
              </h3>
              <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-[10px]">
                {selectedTechniques.length} active
              </Badge>
            </div>
            
            {/* Category Groups */}
            {['geometric', 'color', 'noise', 'advanced'].map(category => (
              <div key={category} className="mb-4">
                <h4 className="text-[10px] uppercase tracking-wider text-white/30 mb-2 flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  {category}
                </h4>
                <div className="space-y-1.5">
                  {augmentationTechniques
                    .filter(t => t.category === category)
                    .map(technique => (
                      <button
                        key={technique.id}
                        onClick={() => toggleTechnique(technique.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${
                          selectedTechniques.includes(technique.id)
                            ? `${getCategoryColor(category)} border`
                            : 'bg-white/5 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <technique.icon className={`w-4 h-4 ${
                            selectedTechniques.includes(technique.id) 
                              ? getCategoryColor(category).split(' ')[0]
                              : 'text-white/40'
                          }`} />
                          <span className={`text-xs ${
                            selectedTechniques.includes(technique.id) ? 'text-white' : 'text-white/60'
                          }`}>
                            {technique.name}
                          </span>
                        </div>
                        {selectedTechniques.includes(technique.id) && (
                          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        )}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </Card>

          {/* Parameter Controls */}
          <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Parameters
            </h3>
            
            <div className="space-y-4">
              {selectedTechniques.slice(0, 4).map(techId => {
                const tech = augmentationTechniques.find(t => t.id === techId);
                if (!tech) return null;
                const param = tech.parameters[0];
                
                return (
                  <div key={techId}>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs text-white/60">{tech.name}</label>
                      <span className="text-xs font-mono text-cyan-400">{params[techId] || param.default}</span>
                    </div>
                    <Slider
                      value={[params[techId] || param.default]}
                      onValueChange={([v]) => setParams(p => ({ ...p, [techId]: v }))}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="w-full"
                    />
                  </div>
                );
              })}
              
              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-white/60">Animation Speed</label>
                  <span className="text-xs font-mono text-amber-400">{augmentationSpeed}ms</span>
                </div>
                <Slider
                  value={[augmentationSpeed]}
                  onValueChange={([v]) => setAugmentationSpeed(v)}
                  min={100}
                  max={2000}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Visualization Panel */}
        <div className="lg:col-span-8 space-y-4">
          {/* Control Bar */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-6 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
              } text-white border-0`}
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? 'Pause' : 'Start'} Stream
            </Button>
            
            <Button
              onClick={triggerAugmentation}
              variant="outline"
              className="border-white/20 text-white/60 hover:bg-white/5"
              disabled={isPlaying}
            >
              <Zap className="w-4 h-4 mr-2" />
              Single Transform
            </Button>
            
            <Button
              onClick={resetVisualization}
              variant="outline"
              className="border-white/20 text-white/60 hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Data Visualization Grid */}
          <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Transformation Preview</h3>
              <Badge className={`text-[10px] ${isPlaying ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/10 text-white/50 border-white/10'}`}>
                {isPlaying ? '● Live' : '○ Paused'}
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Data */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <span className="text-xs text-white/50 uppercase tracking-wider">Original</span>
                </div>
                <div className="grid grid-cols-8 gap-1 aspect-square">
                  {dataGrid.map(cell => (
                    <div
                      key={cell.id}
                      className="rounded-sm transition-all duration-300"
                      style={{
                        backgroundColor: `hsl(220, 80%, ${20 + cell.originalValue * 60}%)`,
                        opacity: 0.8 + cell.originalValue * 0.2
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Augmented Data */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                  <span className="text-xs text-white/50 uppercase tracking-wider">Augmented</span>
                </div>
                <div className="grid grid-cols-8 gap-1 aspect-square">
                  {augmentedGrid.map(cell => {
                    const diff = Math.abs(cell.augmentedValue - cell.originalValue);
                    return (
                      <div
                        key={cell.id}
                        className="rounded-sm transition-all duration-300"
                        style={{
                          backgroundColor: showDiff 
                            ? `hsl(${diff > 0.2 ? 0 : 120}, 70%, ${30 + diff * 50}%)`
                            : `hsl(320, 80%, ${20 + cell.augmentedValue * 60}%)`,
                          opacity: 0.8 + cell.augmentedValue * 0.2,
                          transform: isPlaying ? `scale(${0.9 + Math.random() * 0.2})` : 'scale(1)',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Pipeline Visualization */}
          <Card className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Active Pipeline
            </h3>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
                  <Layers className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="text-xs text-white/60">Input</span>
              </div>
              
              {selectedTechniques.map((techId, index) => {
                const tech = augmentationTechniques.find(t => t.id === techId);
                if (!tech) return null;
                
                return (
                  <div key={techId} className="flex items-center gap-2 shrink-0">
                    <ChevronRight className="w-4 h-4 text-white/20" />
                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${getCategoryColor(tech.category)} border transition-all ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <tech.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{tech.name}</span>
                    </div>
                  </div>
                );
              })}
              
              <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
              <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 shrink-0">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500/30 to-green-500/30 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-xs text-emerald-400">Output</span>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-400 font-mono">
                  {(selectedTechniques.length * sampleCount).toLocaleString()}
                </div>
                <div className="text-[10px] text-white/40 uppercase mt-1">Total Transforms</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 font-mono">
                  {Math.pow(2, selectedTechniques.length).toLocaleString()}
                </div>
                <div className="text-[10px] text-white/40 uppercase mt-1">Combinations</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {selectedTechniques.length > 0 ? `${(sampleCount * selectedTechniques.length / 10).toFixed(1)}x` : '1.0x'}
                </div>
                <div className="text-[10px] text-white/40 uppercase mt-1">Data Multiplier</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
