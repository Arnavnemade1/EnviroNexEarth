import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface MarketplaceModel {
  id: string;
  user_id: string;
  name: string;
  author_name: string;
  description: string;
  category: string;
  accuracy: number;
  downloads: number;
  stars: number;
  forks: number;
  tags: string[];
  model_path: string | null;
  is_featured: boolean;
  is_trending: boolean;
  price: 'free' | 'premium';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface UseMarketplaceReturn {
  models: MarketplaceModel[];
  loading: boolean;
  error: string | null;
  likedModels: string[];
  hasMore: boolean;
  fetchModels: (reset?: boolean) => Promise<void>;
  likeModel: (modelId: string) => Promise<void>;
  unlikeModel: (modelId: string) => Promise<void>;
  deployModel: (modelId: string) => Promise<void>;
  submitModel: (model: Omit<MarketplaceModel, 'id' | 'user_id' | 'downloads' | 'stars' | 'forks' | 'created_at' | 'updated_at'>) => Promise<void>;
  searchModels: (query: string, category: string) => MarketplaceModel[];
}

const PAGE_SIZE = 12;

export function useMarketplace(): UseMarketplaceReturn {
  const { user } = useAuth();
  const [models, setModels] = useState<MarketplaceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedModels, setLikedModels] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchModels = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      
      const { data, error: fetchError } = await (supabase as any)
        .from('marketplace_models')
        .select('*')
        .eq('is_public', true)
        .order('downloads', { ascending: false })
        .range(currentOffset, currentOffset + PAGE_SIZE - 1);
      
      if (fetchError) throw fetchError;
      
      const typedData = (data || []).map((item: any) => ({
        ...item,
        tags: item.tags || [],
        price: item.price || 'free',
      })) as MarketplaceModel[];
      
      if (reset) {
        setModels(typedData);
        setOffset(PAGE_SIZE);
      } else {
        setModels(prev => [...prev, ...typedData]);
        setOffset(prev => prev + PAGE_SIZE);
      }
      
      setHasMore(typedData.length === PAGE_SIZE);
    } catch (err: any) {
      console.error('Error fetching models:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  const fetchLikedModels = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('marketplace_likes')
        .select('model_id')
        .eq('user_id', user.id);
      
      if (fetchError) throw fetchError;
      
      setLikedModels((data || []).map((item: any) => item.model_id));
    } catch (err) {
      console.error('Error fetching liked models:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchModels(true);
  }, []);

  useEffect(() => {
    if (user) {
      fetchLikedModels();
    } else {
      setLikedModels([]);
    }
  }, [user, fetchLikedModels]);

  const likeModel = async (modelId: string) => {
    if (!user) {
      toast.error('Please sign in to like models');
      return;
    }

    try {
      const { error: insertError } = await (supabase as any)
        .from('marketplace_likes')
        .insert({ user_id: user.id, model_id: modelId });
      
      if (insertError) throw insertError;
      
      setLikedModels(prev => [...prev, modelId]);
      
      // Update stars count in the models list
      setModels(prev => prev.map(m => 
        m.id === modelId ? { ...m, stars: m.stars + 1 } : m
      ));
      
      // Also update in database
      await (supabase as any)
        .from('marketplace_models')
        .update({ stars: models.find(m => m.id === modelId)!.stars + 1 })
        .eq('id', modelId);
      
      toast.success('Model liked!');
    } catch (err: any) {
      console.error('Error liking model:', err);
      toast.error('Failed to like model');
    }
  };

  const unlikeModel = async (modelId: string) => {
    if (!user) return;

    try {
      const { error: deleteError } = await (supabase as any)
        .from('marketplace_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('model_id', modelId);
      
      if (deleteError) throw deleteError;
      
      setLikedModels(prev => prev.filter(id => id !== modelId));
      
      // Update stars count
      setModels(prev => prev.map(m => 
        m.id === modelId ? { ...m, stars: Math.max(0, m.stars - 1) } : m
      ));
      
      toast.success('Model unliked');
    } catch (err: any) {
      console.error('Error unliking model:', err);
      toast.error('Failed to unlike model');
    }
  };

  const deployModel = async (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;

    try {
      // Increment download count
      const { error: updateError } = await (supabase as any)
        .from('marketplace_models')
        .update({ downloads: model.downloads + 1 })
        .eq('id', modelId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setModels(prev => prev.map(m => 
        m.id === modelId ? { ...m, downloads: m.downloads + 1 } : m
      ));
      
      toast.success(`Deploying ${model.name}...`, {
        description: 'Model deployment initiated. This may take a few moments.',
      });
      
      // If model has a file path in storage, download it
      if (model.model_path) {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('models')
          .download(model.model_path);
        
        if (downloadError) {
          console.error('Download error:', downloadError);
        } else if (fileData) {
          // Create download link
          const url = URL.createObjectURL(fileData);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${model.name.replace(/\s+/g, '_')}_model.bin`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast.success(`${model.name} downloaded!`, {
            description: 'Model file saved to your downloads.',
          });
          return;
        }
      }
      
      // If no file, export model config as JSON
      const modelConfig = {
        id: model.id,
        name: model.name,
        author: model.author_name,
        category: model.category,
        accuracy: model.accuracy,
        tags: model.tags,
        description: model.description,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        config: {
          architecture: model.category === 'Climate' ? 'transformer' : 'cnn',
          layers: model.category === 'Climate' ? 12 : 8,
          parameters: Math.floor(model.accuracy * 1000000),
          quantized: model.price === 'premium',
        }
      };
      
      const blob = new Blob([JSON.stringify(modelConfig, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.name.replace(/\s+/g, '_')}_config.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Save to exported_models if user is logged in
      if (user) {
        await (supabase as any)
          .from('exported_models')
          .insert({
            user_id: user.id,
            name: model.name,
            description: model.description,
            format: 'json',
            model_path: `exports/${user.id}/${model.id}.json`,
            is_public: false,
            performance_metrics: {
              accuracy: model.accuracy,
              category: model.category,
            },
          });
      }
      
      toast.success(`${model.name} exported successfully!`, {
        description: 'Model configuration saved to your downloads.',
      });
    } catch (err: any) {
      console.error('Error deploying model:', err);
      toast.error('Failed to deploy model');
    }
  };

  const submitModel = async (modelData: Omit<MarketplaceModel, 'id' | 'user_id' | 'downloads' | 'stars' | 'forks' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Please sign in to submit models');
      return;
    }

    try {
      const { data, error: insertError } = await (supabase as any)
        .from('marketplace_models')
        .insert({
          ...modelData,
          user_id: user.id,
          downloads: 0,
          stars: 0,
          forks: 0,
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Add to local state
      setModels(prev => [data as MarketplaceModel, ...prev]);
      
      toast.success('Model submitted successfully!', {
        description: 'Your model is now live in the marketplace.',
      });
    } catch (err: any) {
      console.error('Error submitting model:', err);
      toast.error('Failed to submit model');
      throw err;
    }
  };

  const searchModels = (query: string, category: string): MarketplaceModel[] => {
    return models.filter(model => {
      const matchesSearch = !query || 
        model.name.toLowerCase().includes(query.toLowerCase()) ||
        model.description.toLowerCase().includes(query.toLowerCase()) ||
        model.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      const matchesCategory = category === 'All' || model.category === category;
      
      return matchesSearch && matchesCategory;
    });
  };

  return {
    models,
    loading,
    error,
    likedModels,
    hasMore,
    fetchModels,
    likeModel,
    unlikeModel,
    deployModel,
    submitModel,
    searchModels,
  };
}
