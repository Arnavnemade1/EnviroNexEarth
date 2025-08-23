import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Wind, 
  Thermometer, 
  Eye, 
  Heart, 
  Activity,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { AirQualityData, PredictionData } from '@/types';

interface DataPanelProps {
  cityName?: string;
  airQuality: AirQualityData | null;
  predictions: PredictionData[];
  onForecastToggle: (scenario: 'current' | 'clean_energy' | 'no_action') => void;
  isAnimating: boolean;
  onAnimationToggle: () => void;
  currentYear: number;
}

export const DataPanel = ({
  cityName,
  airQuality,
  predictions,
  onForecastToggle,
  isAnimating,
  onAnimationToggle,
  currentYear
}: DataPanelProps) => {
  const [selectedScenario, setSelectedScenario] = useState<'current' | 'clean_energy' | 'no_action'>('current');
  const [animationSpeed, setAnimationSpeed] = useState(1);

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

  const getCurrentPrediction = () => {
    if (!predictions.length) return null;
    const yearIndex = Math.min(currentYear - new Date().getFullYear(), predictions.length - 1);
    return predictions[Math.max(0, yearIndex)];
  };

  const currentPrediction = getCurrentPrediction();

  return (
    <div className="fixed top-6 left-6 w-80 space-y-4 z-40">
      {/* City Info Card */}
      {cityName && airQuality && (
        <Card className="glass p-6 animate-fade-in-up">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{cityName}</h2>
                <p className="text-sm text-muted-foreground">Live Air Quality</p>
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

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-primary" />
                <span>PM2.5: {airQuality.pm25}μg/m³</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-secondary" />
                <span>O₃: {airQuality.o3}μg/m³</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent" />
                <span>NO₂: {airQuality.no2}μg/m³</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-earth-blue" />
                <span>SO₂: {airQuality.so2}μg/m³</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Forecast Controls */}
      {predictions.length > 0 && (
        <Card className="glass p-6 animate-fade-in-up">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">2030 Forecast</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAnimationToggle}
                  className="glass"
                >
                  {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="glass"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Scenario Buttons */}
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={selectedScenario === 'current' ? 'default' : 'outline'}
                onClick={() => handleScenarioChange('current')}
                className="justify-start text-left h-auto p-3 glass"
              >
                <div>
                  <div className="font-medium">Current Trends</div>
                  <div className="text-xs text-muted-foreground">Continue as today</div>
                </div>
              </Button>
              
              <Button
                variant={selectedScenario === 'clean_energy' ? 'default' : 'outline'}
                onClick={() => handleScenarioChange('clean_energy')}
                className="justify-start text-left h-auto p-3 glass hover:bg-secondary/20"
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-clean-green" />
                  <div>
                    <div className="font-medium text-clean-green">Clean Energy</div>
                    <div className="text-xs text-muted-foreground">Rapid adoption</div>
                  </div>
                </div>
              </Button>
              
              <Button
                variant={selectedScenario === 'no_action' ? 'default' : 'outline'}
                onClick={() => handleScenarioChange('no_action')}
                className="justify-start text-left h-auto p-3 glass hover:bg-destructive/20"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pollution-red" />
                  <div>
                    <div className="font-medium text-pollution-red">No Action</div>
                    <div className="text-xs text-muted-foreground">Business as usual</div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Current Year Display */}
            <div className="flex items-center justify-center gap-2 py-2">
              <span className="text-2xl font-bold text-primary">
                {new Date().getFullYear() + currentYear}
              </span>
            </div>

            {/* Health Impact Preview */}
            {currentPrediction && (
              <div className="space-y-3 pt-3 border-t border-primary/20">
                <h4 className="font-medium text-foreground">Health Impact</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pollution-red" />
                      Outdoor Activity Days
                    </span>
                    <span className="text-sm font-medium text-pollution-red">
                      ↓ 28%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-accent" />
                      Asthma Risk
                    </span>
                    <span className="text-sm font-medium text-accent">
                      +45%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DataPanel;