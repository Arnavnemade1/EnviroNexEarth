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
  Grid3X3,
  List,
  Verified,
  Flame,
  Sparkles,
  ExternalLink,
  Eye,
  GitFork,
  Loader2,
  Plus
} from 'lucide-react';
import { useMarketplace, MarketplaceModel } from '@/hooks/useMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const categories = ['All', 'Air Quality', 'Climate', 'Weather', 'Disaster', 'Environmental'];

export default function ModelMarketplace() {
  const { user } = useAuth();
  const { 
    models, 
    loading, 
    likedModels, 
    hasMore,
    fetchModels, 
    likeModel, 
    unlikeModel, 
    deployModel,
    submitModel,
    searchModels 
  } = useMarketplace();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [viewingModel, setViewingModel] = useState<MarketplaceModel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state for submitting a model
  const [newModel, setNewModel] = useState({
    name: '',
    author_name: '',
    description: '',
    category: 'Air Quality',
    accuracy: 90,
    tags: '',
    price: 'free' as 'free' | 'premium',
    is_public: true,
    is_featured: false,
    is_trending: false,
    model_path: null as string | null,
  });

  const filteredModels = searchModels(searchQuery, selectedCategory);
  const featuredModel = models.find(m => m.is_featured);

  const handleToggleLike = async (modelId: string) => {
    if (likedModels.includes(modelId)) {
      await unlikeModel(modelId);
    } else {
      await likeModel(modelId);
    }
  };

  const handleDeploy = async (modelId: string) => {
    await deployModel(modelId);
  };

  const handleSubmitModel = async () => {
    if (!newModel.name || !newModel.description || !newModel.author_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await submitModel({
        name: newModel.name,
        author_name: newModel.author_name,
        description: newModel.description,
        category: newModel.category,
        accuracy: newModel.accuracy,
        tags: newModel.tags.split(',').map(t => t.trim()).filter(Boolean),
        price: newModel.price,
        is_public: newModel.is_public,
        is_featured: false,
        is_trending: false,
        model_path: newModel.model_path,
      });
      setSubmitDialogOpen(false);
      setNewModel({
        name: '',
        author_name: '',
        description: '',
        category: 'Air Quality',
        accuracy: 90,
        tags: '',
        price: 'free',
        is_public: true,
        is_featured: false,
        is_trending: false,
        model_path: null,
      });
    } catch (err) {
      // Error already handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
      return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    } catch {
      return 'recently';
    }
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
            {models.length} Models Available
          </Badge>
          
          <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => {
                  if (!user) {
                    toast.error('Please sign in to submit models');
                    return;
                  }
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Submit Model
              </Button>
            </DialogTrigger>
            {user && (
              <DialogContent className="bg-black/95 border-white/10 text-white max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-400" />
                    Submit Your Model
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Model Name *</Label>
                    <Input 
                      value={newModel.name}
                      onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., QuantumAir Pro"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Author Name *</Label>
                    <Input 
                      value={newModel.author_name}
                      onChange={(e) => setNewModel(prev => ({ ...prev, author_name: e.target.value }))}
                      placeholder="e.g., Your Name or Organization"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea 
                      value={newModel.description}
                      onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what your model does..."
                      className="bg-white/5 border-white/10 min-h-[80px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select 
                        value={newModel.category} 
                        onValueChange={(val) => setNewModel(prev => ({ ...prev, category: val }))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/10">
                          {categories.filter(c => c !== 'All').map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Accuracy (%)</Label>
                      <Input 
                        type="number"
                        min={0}
                        max={100}
                        value={newModel.accuracy}
                        onChange={(e) => setNewModel(prev => ({ ...prev, accuracy: Number(e.target.value) }))}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tags (comma-separated)</Label>
                    <Input 
                      value={newModel.tags}
                      onChange={(e) => setNewModel(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="e.g., quantum, neural, real-time"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Pricing</Label>
                    <Select 
                      value={newModel.price} 
                      onValueChange={(val: 'free' | 'premium') => setNewModel(prev => ({ ...prev, price: val }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/10">
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleSubmitModel} 
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Submit Model
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            )}
          </Dialog>
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
      {featuredModel && (
        <Card className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30">
                <Flame className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-1">Featured</Badge>
                <h3 className="text-lg font-bold text-white">{featuredModel.name} by {featuredModel.author_name}</h3>
                <p className="text-sm text-white/50">{featuredModel.description.slice(0, 80)}... • {featuredModel.accuracy}% accuracy</p>
              </div>
            </div>
            <Button 
              className="bg-white text-black hover:bg-white/90"
              onClick={() => handleDeploy(featuredModel.id)}
            >
              <Download className="w-4 h-4 mr-2" />
              Deploy Now
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && models.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      )}

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
                  {model.is_featured && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                      Featured
                    </Badge>
                  )}
                  {model.is_trending && (
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
                  onClick={() => handleToggleLike(model.id)}
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
                <span className="text-sm text-white/60">{model.author_name}</span>
                <Verified className="w-4 h-4 text-blue-400" />
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
                  <span>{getTimeAgo(model.updated_at)}</span>
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
                <Button 
                  className="flex-1 bg-white text-black hover:bg-white/90 h-9"
                  onClick={() => handleDeploy(model.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Deploy
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white/60 hover:bg-white/5 h-9"
                  onClick={() => setViewingModel(model)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white/60 hover:bg-white/5 h-9"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/explore?model=${model.id}`);
                    toast.success('Link copied to clipboard!');
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredModels.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No models found matching your criteria</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && models.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            className="border-white/20 text-white/60 hover:bg-white/5"
            onClick={() => fetchModels(false)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Models'
            )}
          </Button>
        </div>
      )}

      {/* Model Details Dialog */}
      <Dialog open={!!viewingModel} onOpenChange={(open) => !open && setViewingModel(null)}>
        {viewingModel && (
          <DialogContent className="bg-black/95 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-xl">{viewingModel.name}</span>
                {viewingModel.is_featured && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Featured</Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2 text-white/60">
                <User className="w-4 h-4" />
                <span>{viewingModel.author_name}</span>
                <Verified className="w-4 h-4 text-blue-400" />
              </div>
              
              <p className="text-white/70">{viewingModel.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {viewingModel.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="border-white/20 text-white/60">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-4 gap-4 py-4 border-y border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">{viewingModel.accuracy}%</div>
                  <div className="text-xs text-white/40">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{viewingModel.downloads.toLocaleString()}</div>
                  <div className="text-xs text-white/40">Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{viewingModel.stars.toLocaleString()}</div>
                  <div className="text-xs text-white/40">Stars</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{viewingModel.forks}</div>
                  <div className="text-xs text-white/40">Forks</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => {
                    handleDeploy(viewingModel.id);
                    setViewingModel(null);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Deploy Model
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20"
                  onClick={() => handleToggleLike(viewingModel.id)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${likedModels.includes(viewingModel.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  {likedModels.includes(viewingModel.id) ? 'Liked' : 'Like'}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
