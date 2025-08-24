import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  RotateCcw,
  Home
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
  onYearChange: (direction: 'next' | 'prev') => void;
  onBackToHome?: () => void;
}

export const DataPanel = ({
  cityName,
  airQuality,
  predictions,
  onForecastToggle,
  isAnimating,
  onAnimationToggle,
  currentYear,
  onYearChange,
  onBackToHome
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

  const handleYearChange = (direction: 'next' | 'prev') => {
    onYearChange(direction);
  };

  const getCurrentPrediction = () => {
    if (!predictions.length) return null;
    const yearIndex = Math.min(currentYear - new Date().getFullYear(), predictions.length - 1);
    return predictions[Math.max(0, yearIndex)];
  };

  const calculateHealthImpact = () => {
    if (!airQuality) return { outdoorDays: 0, asthmaRisk: 0, respiratoryIndex: 0 };
    
    const baseAQI = airQuality.aqi;
    const yearMultiplier = 1 + (currentYear * 0.1);
    
    let scenarioMultiplier = 1;
    if (selectedScenario === 'clean_energy') {
      scenarioMultiplier = Math.max(0.3, 1 - (currentYear * 0.12)); // Improves over time
    } else if (selectedScenario === 'no_action') {
      scenarioMultiplier = 1 + (currentYear * 0.08); // Gets worse over time
    } else {
      scenarioMultiplier = 1 + (currentYear * 0.03); // Slight deterioration
    }
    
    const projectedAQI = Math.min(300, baseAQI * scenarioMultiplier);
    
    return {
      outdoorDays: Math.max(50, 300 - (projectedAQI * 1.2)),
      asthmaRisk: Math.min(200, projectedAQI * 0.4),
      respiratoryIndex: Math.min(150, projectedAQI * 0.6),
      projectedAQI
    };
  };

  const currentPrediction = getCurrentPrediction();
  const healthImpact = calculateHealthImpact();

  return (
    <div className="fixed top-6 left-6 w-80 space-y-4 z-40 max-h-[calc(100vh-3rem)] overflow-y-auto">
      {/* Back to Home Button */}
      {onBackToHome && (
        <Button
          size="sm"
          variant="outline"
          onClick={onBackToHome}
          className="glass mb-2"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      )}
      {/* City Info Card */}
      {cityName && airQuality && (
        <Card className="glass animate-fade-in-up">
          <div className="p-6 space-y-4">
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
        <Card className="glass animate-fade-in-up">
          <div className="p-4 border-b border-primary/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">2030 Forecast</h3>
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
          
          <div className="max-h-80 overflow-y-auto">
            <div className="p-4 space-y-4">
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

              {/* Year Controls */}
              <div className="space-y-3 pt-3 border-t border-primary/20">
                <div className="flex items-center justify-center gap-2 py-2">
                  <span className="text-2xl font-bold text-primary">
                    {new Date().getFullYear() + currentYear}
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleYearChange('prev')}
                    disabled={currentYear === 0}
                    className="glass flex-1"
                  >
                    Previous Year
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleYearChange('next')}
                    disabled={currentYear >= 6}
                    className="glass flex-1"
                  >
                    Next Year
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Year {currentYear + 1} of 7
                </div>
              </div>

              {/* Health Impact Preview */}
              <div className="space-y-3 pt-3 border-t border-primary/20">
                <h4 className="font-medium text-foreground">Health Impact Forecast</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4 text-clean-green" />
                      Outdoor Activity Days
                    </span>
                    <span className={`text-sm font-medium ${
                      selectedScenario === 'clean_energy' ? 'text-clean-green' : 
                      selectedScenario === 'no_action' ? 'text-pollution-red' : 'text-accent'
                    }`}>
                      {Math.round(healthImpact.outdoorDays)} days/year
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-accent" />
                      Asthma Risk Index
                    </span>
                    <span className={`text-sm font-medium ${
                      selectedScenario === 'clean_energy' ? 'text-clean-green' : 
                      selectedScenario === 'no_action' ? 'text-pollution-red' : 'text-accent'
                    }`}>
                      {Math.round(healthImpact.asthmaRisk)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4 text-earth-blue" />
                      Projected AQI
                    </span>
                    <span className={`text-sm font-medium ${getAQIColor(healthImpact.projectedAQI)}`}>
                      {Math.round(healthImpact.projectedAQI)}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground mt-2 p-2 glass rounded">
                    <strong>Scenario Impact:</strong><br/>
                    {selectedScenario === 'clean_energy' && 
                      "Clean energy adoption reduces pollution by 60-80%, improving health outcomes significantly."
                    }
                    {selectedScenario === 'no_action' && 
                      "Without intervention, air quality deteriorates, increasing respiratory risks and reducing quality of life."
                    }
                    {selectedScenario === 'current' && 
                      "Current trends show gradual improvement but not enough to meet WHO standards."
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DataPanel;