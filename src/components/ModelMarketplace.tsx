import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Store, 
  Search, 
  Star, 
  Download, 
  Heart,
  TrendingUp,
  Clock,
  User,
  Filter,
  Grid3X3,
  List,
  Verified,
  Flame,
  Sparkles,
  ExternalLink,
  Eye,
  GitFork
} from 'lucide-react';

interface MarketplaceModel {
  id: string;
  name: string;
  author: string;
  authorVerified: boolean;
  description: string;
  category: string;
  accuracy: number;
  downloads: number;
  stars: number;
  forks: number;
  lastUpdated: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  price: 'free' | 'premium';
}

const marketplaceModels: MarketplaceModel[] = [
  {
    id: '1',
    name: 'QuantumAir Pro',
    author: 'NVIDIA Research',
    authorVerified: true,
    description: 'State-of-the-art quantum-enhanced air quality prediction with 99.2% accuracy on global datasets.',
    category: 'Air Quality',
    accuracy: 99.2,
    downloads: 15420,
    stars: 892,
    forks: 234,
    lastUpdated: '2 days ago',
    tags: ['quantum', 'production-ready', 'gpu-optimized'],
    featured: true,
    trending: true,
    price: 'free'
  },
  {
    id: '2',
    name: 'ClimateForecaster v3',
    author: 'DeepMind',
    authorVerified: true,
    description: 'Advanced neural climate prediction using transformer architecture with multi-horizon forecasting.',
    category: 'Climate',
    accuracy: 97.8,
    downloads: 28910,
    stars: 1456,
    forks: 567,
    lastUpdated: '1 week ago',
    tags: ['neural', 'transformer', 'multi-horizon'],
    featured: true,
    trending: false,
    price: 'free'
  },
  {
    id: '3',
    name: 'DisasterNet',
    author: 'MIT CSAIL',
    authorVerified: true,
    description: 'Real-time natural disaster detection and impact prediction using hybrid quantum-classical approach.',
    category: 'Disaster',
    accuracy: 96.4,
    downloads: 8932,
    stars: 673,
    forks: 189,
    lastUpdated: '3 days ago',
    tags: ['hybrid', 'real-time', 'early-warning'],
    featured: false,
    trending: true,
    price: 'premium'
  },
  {
    id: '4',
    name: 'EcoSense Ensemble',
    author: 'Google Research',
    authorVerified: true,
    description: 'Multi-model ensemble for environmental sensing with automatic model selection.',
    category: 'Environmental',
    accuracy: 95.9,
    downloads: 12340,
    stars: 521,
    forks: 145,
    lastUpdated: '5 days ago',
    tags: ['ensemble', 'auto-ml', 'multi-sensor'],
    featured: false,
    trending: false,
    price: 'free'
  },
  {
    id: '5',
    name: 'PollutionTracker Pro',
    author: 'IBM Quantum',
    authorVerified: true,
    description: 'Quantum machine learning for industrial pollution source tracking and attribution.',
    category: 'Air Quality',
    accuracy: 98.1,
    downloads: 6543,
    stars: 412,
    forks: 98,
    lastUpdated: '1 day ago',
    tags: ['quantum', 'industrial', 'source-tracking'],
    featured: false,
    trending: true,
    price: 'premium'
  },
  {
    id: '6',
    name: 'WeatherNow v2',
    author: 'OpenAI',
    authorVerified: true,
    description: 'GPT-powered weather prediction with natural language explanations and uncertainty quantification.',
    category: 'Weather',
    accuracy: 94.7,
    downloads: 45670,
    stars: 2341,
    forks: 789,
    lastUpdated: '1 week ago',
    tags: ['llm', 'explainable', 'uncertainty'],
    featured: true,
    trending: false,
    price: 'free'
  },
];

const categories = ['All', 'Air Quality', 'Climate', 'Weather', 'Disaster', 'Environmental'];

export default function ModelMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [likedModels, setLikedModels] = useState<string[]>([]);

  const filteredModels = marketplaceModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleLike = (modelId: string) => {
    setLikedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
            <Store className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Model Marketplace</h2>
            <p className="text-sm text-white/40">Discover, deploy, and share AI models</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            {marketplaceModels.length} Models Available
          </Badge>
          <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
            <Sparkles className="w-4 h-4 mr-2" />
            Submit Model
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search models, tags, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 text-xs font-medium transition-all ${
                  selectedCategory === cat 
                    ? 'bg-white text-black' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Banner */}
      <Card className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30">
              <Flame className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-1">Featured</Badge>
              <h3 className="text-lg font-bold text-white">QuantumAir Pro by NVIDIA Research</h3>
              <p className="text-sm text-white/50">State-of-the-art quantum-enhanced air quality prediction • 99.2% accuracy</p>
            </div>
          </div>
          <Button className="bg-white text-black hover:bg-white/90">
            <Download className="w-4 h-4 mr-2" />
            Deploy Now
          </Button>
        </div>
      </Card>

      {/* Models Grid */}
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredModels.map(model => (
          <Card 
            key={model.id} 
            className={`group p-5 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 hover:border-white/20 transition-all ${
              viewMode === 'list' ? 'flex items-center gap-6' : ''
            }`}
          >
            <div className={viewMode === 'list' ? 'flex-1' : ''}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {model.featured && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                      Featured
                    </Badge>
                  )}
                  {model.trending && (
                    <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px]">
                      <TrendingUp className="w-3 h-3 mr-1" /> Trending
                    </Badge>
                  )}
                  {model.price === 'premium' && (
                    <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px]">
                      Premium
                    </Badge>
                  )}
                </div>
                <button 
                  onClick={() => toggleLike(model.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className={`w-5 h-5 transition-colors ${
                    likedModels.includes(model.id) ? 'fill-rose-500 text-rose-500' : 'text-white/40 hover:text-rose-400'
                  }`} />
                </button>
              </div>

              {/* Title & Author */}
              <h3 className="font-bold text-white text-lg mb-1">{model.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-3 h-3 text-white/40" />
                <span className="text-sm text-white/60">{model.author}</span>
                {model.authorVerified && <Verified className="w-4 h-4 text-blue-400" />}
              </div>

              {/* Description */}
              <p className="text-sm text-white/50 mb-4 line-clamp-2">{model.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {model.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-white/5 text-white/40">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>{model.stars.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{model.downloads.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  <span>{model.forks}</span>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3" />
                  <span>{model.lastUpdated}</span>
                </div>
              </div>

              {/* Accuracy Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/40">Accuracy</span>
                  <span className="font-mono text-emerald-400 font-bold">{model.accuracy}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    style={{ width: `${model.accuracy}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 bg-white text-black hover:bg-white/90 h-9">
                  <Download className="w-4 h-4 mr-2" />
                  Deploy
                </Button>
                <Button variant="outline" className="border-white/20 text-white/60 hover:bg-white/5 h-9">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="border-white/20 text-white/60 hover:bg-white/5 h-9">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" className="border-white/20 text-white/60 hover:bg-white/5">
          Load More Models
        </Button>
      </div>
    </div>
  );
}
