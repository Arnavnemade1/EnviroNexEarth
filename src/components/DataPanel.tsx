import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wind, Thermometer, Eye, Heart, Activity, TrendingUp, TrendingDown, Play, Pause, RotateCcw, Chrome as Home, ChartBar as BarChart3, Atom, Sparkles, Loader as Loader2, AlertTriangle, Shield } from 'lucide-react';
import { AirQualityData, PredictionData } from '@/types';
import { ForecastTimeline } from './ForecastTimeline';
import { PollutantBadge, PollutantDetailCard, getPollutantSeverity, getWHOExceedance, WHO_GUIDELINES, type PollutantType } from './PollutantSeverity';

type QuantumForecast = {
  model: { name: string; backend: string; horizonHours: number };
  generatedAt: string;
  hourly: Array<{ hourOffset: number; aqi: number; pm25: number; confidence: number }>;
};

interface DataPanelProps {
  cityName?: string;
  airQuality: AirQualityData | null;
  predictions: PredictionData[];
  quantumForecast?: QuantumForecast;
  onForecastToggle: (scenario: 'current' | 'clean_energy' | 'no_action') => void;
  isAnimating: boolean;
  onAnimationToggle: () => void;
  currentYear: number;
  onYearChange: (direction: 'next' | 'prev') => void;
  onBackToHome?: () => void;
  onShowQuantumAnalytics?: () => void;
  onShowHealth?: () => void;
  onShowClimatePredictions?: () => void;
  onShowDisasters?: () => void;
}

export const DataPanel = ({
  cityName,
  airQuality,
  predictions,
  quantumForecast,
  onForecastToggle,
  isAnimating,
  onAnimationToggle,
  currentYear,
  onYearChange,
  onBackToHome,
  onShowQuantumAnalytics,
  onShowHealth,
  onShowClimatePredictions,
  onShowDisasters
}: DataPanelProps) => {
  const [selectedScenario, setSelectedScenario] = useState<'current' | 'clean_energy' | 'no_action'>('current');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showImpactDialog, setShowImpactDialog] = useState(false);
  const [impactAnalysis, setImpactAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-clean-green';
    if (aqi <= 100) return 'text-accent';
    if (aqi <= 150) return 'text-orange-400';
    return 'text-pollution-red';
  };

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    return 'Unhealthy';
  };

  const handleScenarioChange = (scenario: 'current' | 'clean_energy' | 'no_action') => {
    setSelectedScenario(scenario);
    onForecastToggle(scenario);
  };

  const handleYearChange = (direction: 'next' | 'prev') => {
    onYearChange(direction);
  };

  const getCurrentPrediction = () => {
    if (!predictions.length) return null;
    const yearIndex = Math.min(currentYear - new Date().getFullYear(), predictions.length - 1);
    return predictions[Math.max(0, yearIndex)];
  };

  const calculateHealthImpact = () => {
    if (!airQuality) return { outdoorDays: 0, asthmaRisk: 0, respiratoryIndex: 0, projectedAQI: 0 } as any;

    const year = currentYear; // 0..6

    // Scenario-specific pollutant multipliers (non-linear where it makes sense)
    const expo = (r: number, y: number) => Math.exp(-r * y);

    let pm25Factor = 1, o3Factor = 1, no2Factor = 1, so2Factor = 1;
    switch (selectedScenario) {
      case 'clean_energy':
        pm25Factor = Math.max(0.35, expo(0.18, year));
        o3Factor = Math.max(0.55, expo(0.08, year));
        no2Factor = Math.max(0.40, expo(0.15, year));
        so2Factor = Math.max(0.45, expo(0.14, year));
        break;
      case 'no_action':
        pm25Factor = 1 + 0.12 * year;
        o3Factor = 1 + 0.06 * year;
        no2Factor = 1 + 0.10 * year;
        so2Factor = 1 + 0.09 * year;
        break;
      default: // current trends
        pm25Factor = 1 + 0.03 * year;
        o3Factor = 1 + 0.02 * year;
        no2Factor = 1 + 0.025 * year;
        so2Factor = 1 + 0.02 * year;
    }

    // Project pollutants
    const pm25 = Math.max(1, Math.min(200, airQuality.pm25 * pm25Factor));
    const o3 = Math.max(1, Math.min(200, airQuality.o3 * o3Factor));
    const no2 = Math.max(1, Math.min(200, airQuality.no2 * no2Factor));
    const so2 = Math.max(1, Math.min(200, airQuality.so2 * so2Factor));

    // Rough AQI approximation emphasizing PM2.5 (dominant health driver)
    const aqiFromPM25 = Math.min(300, pm25 * 4);
    const aqiAdj = Math.min(300, aqiFromPM25 * 0.7 + o3 * 0.5 + no2 * 0.3);
    const projectedAQI = Math.round(Math.min(300, Math.max(0, aqiAdj)));

    // Health metrics (heuristic but grounded in epidemiology)
    const outdoorDays = Math.max(40, Math.min(330, 320 - projectedAQI * 1.1));
    const asthmaRisk = Math.min(200, Math.round(30 + pm25 * 0.6 + o3 * 0.2));
    const respiratoryIndex = Math.min(150, Math.round(pm25 * 0.7 + no2 * 0.3));

    return { outdoorDays, asthmaRisk, respiratoryIndex, projectedAQI };
  };

  const currentPrediction = getCurrentPrediction();
  const healthImpact = calculateHealthImpact();

  const handleHealthNavigation = () => {
    if (onShowHealth) {
      onShowHealth();
    } else if (cityName && airQuality) {
      navigate('/health', {
        state: {
          cityName,
          airQuality,
          forecast: quantumForecast?.hourly
        }
      });
    }
  };

  const handleGenerateImpactSummary = async () => {
    if (!airQuality || !cityName) return;

    setIsAnalyzing(true);
    setShowImpactDialog(true);
    setImpactAnalysis('');

    try {
      const { data, error } = await supabase.functions.invoke('analyze-impact', {
        body: {
          cityName,
          airQuality,
          quantumForecast,
          scenario: selectedScenario
        }
      });

      if (error) throw error;

      if (data?.analysis) {
        setImpactAnalysis(data.analysis);
      } else {
        throw new Error('No analysis received');
      }
    } catch (error) {
      console.error('Error generating impact summary:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to generate impact summary. Please try again.",
        variant: "destructive"
      });
      setShowImpactDialog(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      {/* Enviro AI Impact Summary Dialog */}
      <Dialog open={showImpactDialog} onOpenChange={setShowImpactDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] glass bg-gradient-to-br from-background/95 via-primary/5 to-background/90 backdrop-blur-xl border-primary/20 animate-scale-in">
          <DialogHeader className="animate-fade-in">
            <DialogTitle className="flex items-center gap-3 text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                <div className="absolute inset-0 w-8 h-8 animate-ping opacity-30">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </div>
              Enviro AI Impact Analysis
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              <div className="flex items-center gap-2 flex-wrap animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 animate-fade-in hover-scale">
                  🤖 Llama 3.3 70B
                </Badge>
                <Badge variant="outline" className="border-secondary/30 text-secondary bg-secondary/10 animate-fade-in hover-scale" style={{ animationDelay: '0.05s' }}>
                  📊 OpenMeteo Data
                </Badge>
                <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10 animate-fade-in hover-scale" style={{ animationDelay: '0.1s' }}>
                  ⚛️ Quantum Enhanced
                </Badge>
                <span className="text-sm">•</span>
                <span className="font-medium text-foreground">{cityName}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-8">
                <div className="relative">
                  <Loader2 className="w-20 h-20 animate-spin text-primary" />
                  <div className="absolute inset-0 w-20 h-20 animate-ping opacity-20">
                    <Sparkles className="w-20 h-20 text-primary" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 animate-pulse opacity-30">
                    <Atom className="w-20 h-20 text-secondary" />
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <p className="text-2xl font-bold text-foreground animate-pulse">Enviro AI Processing...</p>
                  <p className="text-sm text-muted-foreground">Analyzing environmental data with advanced AI</p>
                  <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
                    <Card className="glass p-4 animate-fade-in" style={{ animationDelay: '0s' }}>
                      <Atom className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
                      <p className="text-xs text-center text-muted-foreground">Quantum Forecasts</p>
                    </Card>
                    <Card className="glass p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <Wind className="w-8 h-8 text-secondary mx-auto mb-2 animate-pulse" />
                      <p className="text-xs text-center text-muted-foreground">Pollutant Analysis</p>
                    </Card>
                    <Card className="glass p-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                      <Heart className="w-8 h-8 text-accent mx-auto mb-2 animate-pulse" />
                      <p className="text-xs text-center text-muted-foreground">Health Impacts</p>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {impactAnalysis.split('\n').map((paragraph, idx) => {
                  const line = paragraph.trim();
                  if (!line) return null;

                  if (line.startsWith('## ')) {
                    return (
                      <Card key={idx} className="glass p-4 border-l-4 border-primary animate-fade-in hover-scale" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
                          <Sparkles className="w-6 h-6" />
                          {line.replace('## ', '')}
                        </h2>
                      </Card>
                    );
                  }

                  if (line.startsWith('### ')) {
                    return (
                      <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <h3 className="text-xl font-semibold text-secondary mt-4 mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                          {line.replace('### ', '')}
                        </h3>
                      </div>
                    );
                  }

                  if (line.startsWith('- ')) {
                    const content = line.replace('- ', '');
                    const icon = content.includes('AQI') ? <Activity className="w-4 h-4 text-primary" /> :
                      content.includes('PM') ? <Wind className="w-4 h-4 text-secondary" /> :
                        content.includes('health') || content.includes('Health') ? <Heart className="w-4 h-4 text-accent" /> :
                          <div className="w-2 h-2 bg-foreground/50 rounded-full" />;

                    return (
                      <Card key={idx} className="glass p-3 animate-fade-in hover-scale transition-all duration-300" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <div className="flex items-start gap-3">
                          {icon}
                          <span
                            className="text-sm text-foreground/90 leading-relaxed flex-1"
                            dangerouslySetInnerHTML={{
                              __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
                            }}
                          />
                        </div>
                      </Card>
                    );
                  }

                  if (line.startsWith('**') || line.includes('**')) {
                    const formatted = line.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-accent">$1</span>');
                    return (
                      <Card key={idx} className="glass p-4 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <p className="text-base text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
                      </Card>
                    );
                  }

                  return (
                    <p key={idx} className="text-base text-foreground/90 leading-relaxed animate-fade-in px-2" style={{ animationDelay: `${idx * 0.05}s` }}>
                      {line}
                    </p>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div className="fixed top-6 left-6 w-80 space-y-4 z-40 max-h-[calc(100vh-3rem)] overflow-y-auto scrollbar-thin">
        {/* Back to Home Button */}
        {onBackToHome && (
          <Button
            size="sm"
            variant="outline"
            onClick={onBackToHome}
            className="glass bg-transparent border-white/10 mb-2"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        )}
        {/* City Info Card */}
        {cityName && airQuality && (
          <Card className="glass bg-transparent border-white/10 animate-fade-in-up">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{cityName}</h2>
                  <p className="text-sm text-muted-foreground">Live Air Quality (OpenAQ)</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-lg font-bold ${getAQIColor(airQuality.aqi)} border-current`}
                >
                  {airQuality.aqi}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Air Quality</span>
                  <span className={getAQIColor(airQuality.aqi)}>
                    {getAQICategory(airQuality.aqi)}
                  </span>
                </div>
                <Progress
                  value={(airQuality.aqi / 200) * 100}
                  className="h-2"
                />
              </div>

              {/* Enhanced Pollutant Display with Severity */}
              <div className="space-y-2">
                {/* Worst Pollutant Alert */}
                {(() => {
                  const pollutants: { type: PollutantType; value: number }[] = [
                    { type: 'pm25', value: airQuality.pm25 },
                    { type: 'o3', value: airQuality.o3 },
                    { type: 'no2', value: airQuality.no2 },
                    { type: 'so2', value: airQuality.so2 }
                  ];
                  const worstPollutant = pollutants.reduce((worst, current) => {
                    const currentExceedance = getWHOExceedance(current.type, current.value);
                    const worstExceedance = getWHOExceedance(worst.type, worst.value);
                    return currentExceedance > worstExceedance ? current : worst;
                  }, pollutants[0]);
                  const exceedance = getWHOExceedance(worstPollutant.type, worstPollutant.value);
                  const severity = getPollutantSeverity(worstPollutant.type, worstPollutant.value);

                  if (exceedance > 100) {
                    return (
                      <div className={`p-2 rounded-lg ${severity.bgColor} border ${severity.borderColor} animate-pulse-slow`}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${severity.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${severity.color}`}>
                              {WHO_GUIDELINES[worstPollutant.type].name} {exceedance - 100}% above WHO limit
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {severity.recommendation.split(' ').slice(0, 8).join(' ')}...
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Pollutant Badges with Severity */}
                <div className="grid grid-cols-2 gap-2">
                  <PollutantBadge type="pm25" value={airQuality.pm25} size="sm" showLabel={true} />
                  <PollutantBadge type="o3" value={airQuality.o3} size="sm" showLabel={true} />
                  <PollutantBadge type="no2" value={airQuality.no2} size="sm" showLabel={true} />
                  <PollutantBadge type="so2" value={airQuality.so2} size="sm" showLabel={true} />
                </div>
              </div>

              {/* Enviro AI Impact Summary Button */}
              <Button
                onClick={handleGenerateImpactSummary}
                className="w-full mt-4 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-secondary/40 group"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                <span className="font-semibold">Enviro AI Impact Analysis</span>
              </Button>

              {/* ClimatePredict AI Button */}
              {onShowClimatePredictions && (
                <Button
                  onClick={onShowClimatePredictions}
                  className="w-full mt-2 bg-gradient-to-r from-secondary via-accent to-primary hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-accent/40 group relative overflow-hidden"
                  size="lg"
                >
                  <div className="absolute top-1 right-1">
                    <span className="text-[9px] font-bold bg-accent/90 text-accent-foreground px-1.5 py-0.5 rounded">BETA</span>
                  </div>
                  <TrendingUp className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  <span className="font-semibold">ClimatePredict AI</span>
                </Button>
              )}

              {/* Separator */}
              <div className="flex items-center gap-2 mt-4 mb-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Analysis Tools</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Quantum Analytics Button */}
              {onShowQuantumAnalytics && (
                <Button
                  size="sm"
                  className="w-full mt-2 bg-gradient-to-r from-primary to-secondary"
                  onClick={onShowQuantumAnalytics}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Quantum Analytics
                </Button>
              )}

              {/* Health Analysis Button */}
              {cityName && airQuality && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 glass"
                  onClick={handleHealthNavigation}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Health Analysis
                </Button>
              )}

              {/* Natural Disasters Button */}
              {onShowDisasters && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 glass"
                  onClick={onShowDisasters}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Natural Disasters
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Quantum 24h Forecast */}
        {quantumForecast && (
          <Card className="glass bg-transparent border-white/10 animate-fade-in-up border-2 border-primary/30">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Atom className="w-5 h-5 text-primary animate-spin" />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Quantum 24h Forecast
                  </h3>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  IBM Quantum Circuits
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground bg-primary/5 p-2 rounded">
                Powered by IBM Quantum Computing - leveraging quantum superposition for enhanced predictions.
              </div>
              <div className="text-sm text-muted-foreground">
                Next hour AQI: <span className={getAQIColor(quantumForecast.hourly[0]?.aqi || 0)}>
                  {quantumForecast.hourly[0]?.aqi ?? '—'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Min AQI (24h)</div>
                  <div className="font-medium">
                    {Math.min(...quantumForecast.hourly.map(h => h.aqi))}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Max AQI (24h)</div>
                  <div className="font-medium">
                    {Math.max(...quantumForecast.hourly.map(h => h.aqi))}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Horizon: {quantumForecast.model.horizonHours}h • Generated {new Date(quantumForecast.generatedAt).toLocaleTimeString()}
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced 2030 Forecast Timeline */}
        {predictions.length > 0 && airQuality && (
          <ForecastTimeline
            airQuality={airQuality}
            cityName={cityName || 'Unknown'}
            currentYear={currentYear}
            onYearChange={(year) => {
              // Adjust to handle the year offset
              const diff = year - currentYear;
              if (diff > 0) {
                for (let i = 0; i < diff; i++) onYearChange('next');
              } else if (diff < 0) {
                for (let i = 0; i < Math.abs(diff); i++) onYearChange('prev');
              }
            }}
            selectedScenario={selectedScenario}
            onScenarioChange={(scenario) => handleScenarioChange(scenario)}
          />
        )}
      </div>
    </>
  );
};

export default DataPanel;