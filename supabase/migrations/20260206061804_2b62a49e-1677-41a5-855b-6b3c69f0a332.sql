-- Create marketplace_models table for the Model Marketplace
CREATE TABLE public.marketplace_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  author_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  accuracy NUMERIC DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  model_path TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  price TEXT DEFAULT 'free',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace_likes table to track user likes
CREATE TABLE public.marketplace_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  model_id UUID NOT NULL REFERENCES public.marketplace_models(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, model_id)
);

-- Enable RLS
ALTER TABLE public.marketplace_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_likes ENABLE ROW LEVEL SECURITY;

-- Policies for marketplace_models
CREATE POLICY "Everyone can view public marketplace models"
  ON public.marketplace_models FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own models"
  ON public.marketplace_models FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own models"
  ON public.marketplace_models FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own models"
  ON public.marketplace_models FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for marketplace_likes
CREATE POLICY "Users can view all likes"
  ON public.marketplace_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like models"
  ON public.marketplace_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike models"
  ON public.marketplace_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_marketplace_models_updated_at
  BEFORE UPDATE ON public.marketplace_models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some seed data for the marketplace
INSERT INTO public.marketplace_models (user_id, name, author_name, description, category, accuracy, downloads, stars, forks, tags, is_featured, is_trending, price)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'QuantumAir Pro', 'NVIDIA Research', 'State-of-the-art quantum-enhanced air quality prediction with 99.2% accuracy on global datasets.', 'Air Quality', 99.2, 15420, 892, 234, ARRAY['quantum', 'production-ready', 'gpu-optimized'], true, true, 'free'),
  ('00000000-0000-0000-0000-000000000000', 'ClimateForecaster v3', 'DeepMind', 'Advanced neural climate prediction using transformer architecture with multi-horizon forecasting.', 'Climate', 97.8, 28910, 1456, 567, ARRAY['neural', 'transformer', 'multi-horizon'], true, false, 'free'),
  ('00000000-0000-0000-0000-000000000000', 'DisasterNet', 'MIT CSAIL', 'Real-time natural disaster detection and impact prediction using hybrid quantum-classical approach.', 'Disaster', 96.4, 8932, 673, 189, ARRAY['hybrid', 'real-time', 'early-warning'], false, true, 'premium'),
  ('00000000-0000-0000-0000-000000000000', 'EcoSense Ensemble', 'Google Research', 'Multi-model ensemble for environmental sensing with automatic model selection.', 'Environmental', 95.9, 12340, 521, 145, ARRAY['ensemble', 'auto-ml', 'multi-sensor'], false, false, 'free'),
  ('00000000-0000-0000-0000-000000000000', 'PollutionTracker Pro', 'IBM Quantum', 'Quantum machine learning for industrial pollution source tracking and attribution.', 'Air Quality', 98.1, 6543, 412, 98, ARRAY['quantum', 'industrial', 'source-tracking'], false, true, 'premium'),
  ('00000000-0000-0000-0000-000000000000', 'WeatherNow v2', 'OpenAI', 'GPT-powered weather prediction with natural language explanations and uncertainty quantification.', 'Weather', 94.7, 45670, 2341, 789, ARRAY['llm', 'explainable', 'uncertainty'], true, false, 'free');