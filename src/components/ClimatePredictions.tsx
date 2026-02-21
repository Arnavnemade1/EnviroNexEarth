import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles, Loader2, X, Clock, TrendingUp, AlertTriangle, CheckCircle,
  Car, Shirt, Dumbbell, TreePine, Heart, Zap, Plane, PartyPopper, Wheat, Bird,
  ChevronDown, ChevronUp, RefreshCw, Shield
} from 'lucide-react';
import { AirQualityData } from '@/types';

interface ClimatePredictionsProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  lat: number;
  lon: number;
  airQuality: AirQualityData;
}

interface HourlyPrediction {
  time: string;
  prediction: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
}

interface CategoryPrediction {
  icon: string;
  title: string;
  summary: string;
  hourlyPredictions: HourlyPrediction[];
  recommendation: string;
  peakImpactTime?: string;
  bestTimes?: string[];
  worstTimes?: string[];
  optimalWindows?: { start: string; end: string; activity: string }[];
  riskGroups?: string[];
  riskLevel?: string;
  bestEventTimes?: string[];
  peakDemandTime?: string;
}

interface PredictionsData {
  timestamp: string;
  location: string;
  predictions: Record<string, CategoryPrediction>;
  overallRiskScore: number;
  bestHourToday: string;
  worstHourToday: string;
  neuralMetadata?: {
    engine: string;
    simulations: number;
    processingTimeMs: number;
    confidenceInterval: string;
  };
}

const categoryIcons: Record<string, React.ReactNode> = {
  traffic: <Car className="w-5 h-5" />,
  clothing: <Shirt className="w-5 h-5" />,
  sports: <Dumbbell className="w-5 h-5" />,
  outdoor: <TreePine className="w-5 h-5" />,
  vitality: <Heart className="w-5 h-5" />,
  energy: <Zap className="w-5 h-5" />,
  travel: <Plane className="w-5 h-5" />,
  events: <PartyPopper className="w-5 h-5" />,
  agriculture: <Wheat className="w-5 h-5" />,
  wildlife: <Bird className="w-5 h-5" />,
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'text-clean-green border-clean-green/30 bg-clean-green/10';
    case 'medium': return 'text-accent border-accent/30 bg-accent/10';
    case 'high': return 'text-pollution-red border-pollution-red/30 bg-pollution-red/10';
    default: return 'text-muted-foreground border-muted/30 bg-muted/10';
  }
};

const getRiskColor = (score: number) => {
  if (score <= 30) return 'from-clean-green to-secondary';
  if (score <= 60) return 'from-accent to-orange-500';
  return 'from-orange-500 to-pollution-red';
};

export const ClimatePredictions = ({
  isOpen,
  onClose,
  cityName,
  lat,
  lon,
  airQuality
}: ClimatePredictionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionsData | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPredictions = async () => {
    setIsLoading(true);
    setPredictions(null);

    try {
      const { data, error } = await supabase.functions.invoke('climate-predictions', {
        body: {
          climateData: {
            cityName,
            lat,
            lon,
            airQuality
          }
        }
      });

      if (error) throw error;

      if (data?.success && data?.predictions) {
        setPredictions(data.predictions);
      } else {
        throw new Error(data?.error || 'Failed to generate predictions');
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "Unable to generate predictions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 glass bg-gradient-to-br from-background/98 via-primary/5 to-background/95 backdrop-blur-2xl border-primary/20 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                    <Sparkles className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 font-bold">
                      BETA
                    </Badge>
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    ClimatePredict AI
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-1">
                    24-hour predictions powered by IBM Quantum • {cityName}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-primary/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[calc(95vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Generate Button */}
              {!predictions && !isLoading && (
                <Card className="glass border-primary/20 p-8 text-center space-y-6">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">Climate Intelligence Ready</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Analyze current climate conditions to predict impacts on traffic, infrastructure, energy, vitality, events, and more for the next 24 hours.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Object.entries(categoryIcons).map(([key, icon]) => (
                      <div key={key} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground">
                        {icon}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={fetchPredictions}
                    size="lg"
                    className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-primary-foreground font-semibold px-8 shadow-lg shadow-primary/30"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate 24h Predictions
                  </Button>
                </Card>
              )}

              {/* Loading State */}
              {isLoading && (
                <Card className="glass border-primary/20 p-12 text-center space-y-8">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-accent animate-spin opacity-30" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground animate-pulse">Analyzing Climate Data...</h3>
                    <p className="text-muted-foreground">Generating predictions across 10 categories</p>
                  </div>
                  <div className="grid grid-cols-5 gap-3 max-w-lg mx-auto">
                    {Object.entries(categoryIcons).slice(0, 5).map(([key, icon], i) => (
                      <div
                        key={key}
                        className="w-12 h-12 rounded-xl glass flex items-center justify-center text-primary animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {icon}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-3 max-w-lg mx-auto">
                    {Object.entries(categoryIcons).slice(5, 10).map(([key, icon], i) => (
                      <div
                        key={key}
                        className="w-12 h-12 rounded-xl glass flex items-center justify-center text-secondary animate-pulse"
                        style={{ animationDelay: `${(i + 5) * 0.1}s` }}
                      >
                        {icon}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Predictions Display */}
              {predictions && (
                <div className="space-y-6">
                  {/* Overview Card */}
                  <Card className="glass border-primary/20 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getRiskColor(predictions.overallRiskScore)} flex items-center justify-center`}>
                          <span className="text-2xl font-bold text-white">{predictions.overallRiskScore}</span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                          <p className="text-lg font-semibold text-foreground">
                            {predictions.overallRiskScore <= 30 ? 'Low Impact Day' :
                              predictions.overallRiskScore <= 60 ? 'Moderate Impact Day' : 'High Impact Day'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-2 text-clean-green">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-lg font-semibold">{predictions.bestHourToday}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Best Hour</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-2 text-pollution-red">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="text-lg font-semibold">{predictions.worstHourToday}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Worst Hour</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchPredictions}
                        className="border-primary/30 hover:bg-primary/10"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </Card>

                  {/* Prediction Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(predictions.predictions).map(([key, category]) => (
                      <Card
                        key={key}
                        className="glass border-primary/10 overflow-hidden transition-all duration-300 hover:border-primary/30"
                      >
                        {/* Category Header */}
                        <button
                          onClick={() => toggleCategory(key)}
                          className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
                              {categoryIcons[key] || <Sparkles className="w-5 h-5" />}
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-foreground">{category.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">{category.summary}</p>
                            </div>
                          </div>
                          {expandedCategory === key ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>

                        {/* Expanded Content */}
                        {expandedCategory === key && (
                          <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-primary/10">
                            {/* Recommendation */}
                            <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                              <p className="text-sm text-foreground">
                                <span className="font-semibold text-primary">💡 Recommendation:</span> {category.recommendation}
                              </p>
                            </div>

                            {/* Key Times */}
                            <div className="flex flex-wrap gap-2">
                              {category.peakImpactTime && (
                                <Badge variant="outline" className="border-accent/30 text-accent">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Peak: {category.peakImpactTime}
                                </Badge>
                              )}
                              {category.bestTimes?.map((time, i) => (
                                <Badge key={i} variant="outline" className="border-clean-green/30 text-clean-green">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Best: {time}
                                </Badge>
                              ))}
                              {category.worstTimes?.map((time, i) => (
                                <Badge key={i} variant="outline" className="border-pollution-red/30 text-pollution-red">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Avoid: {time}
                                </Badge>
                              ))}
                            </div>

                            {/* Hourly Predictions */}
                            {category.hourlyPredictions && category.hourlyPredictions.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hourly Breakdown</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                                  {category.hourlyPredictions.slice(0, 6).map((hourly, i) => (
                                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                                      <Badge
                                        variant="outline"
                                        className={`shrink-0 ${getSeverityColor(hourly.severity)}`}
                                      >
                                        {hourly.time}
                                      </Badge>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground">{hourly.prediction}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Progress value={hourly.confidence} className="h-1 flex-1" />
                                          <span className="text-xs text-muted-foreground">{hourly.confidence}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Risk Groups for Atmospheric Vitality */}
                            {category.riskGroups && category.riskGroups.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-muted-foreground">At Risk:</span>
                                {category.riskGroups.map((group, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {group}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Optimal Windows for Outdoor */}
                            {category.optimalWindows && category.optimalWindows.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Optimal Windows</p>
                                {category.optimalWindows.map((window, i) => (
                                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-clean-green/10 border border-clean-green/20">
                                    <Clock className="w-4 h-4 text-clean-green" />
                                    <span className="text-sm text-foreground">
                                      {window.start} - {window.end}: <span className="text-clean-green">{window.activity}</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="text-center text-xs text-muted-foreground pt-4 border-t border-primary/10 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="outline" className="border-primary/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Powered by IBM Quantum Neural Engine
                      </Badge>
                      <span>•</span>
                      <span>Generated at {new Date(predictions.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {predictions.neuralMetadata && (
                      <div className="flex items-center justify-center gap-3 opacity-60">
                        <span>Engine: {predictions.neuralMetadata.engine}</span>
                        <span>•</span>
                        <span>Simulations: {predictions.neuralMetadata.simulations.toLocaleString()}</span>
                        <span>•</span>
                        <span>Confidence: {predictions.neuralMetadata.confidenceInterval}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
