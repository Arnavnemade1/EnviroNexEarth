import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getEarth2Forecast, Earth2ForecastResponse, DailySummary } from '@/services/earth2Forecast';
import {
  Cpu, Cloud, Wind, Droplets, Thermometer, Eye, Gauge,
  RefreshCw, ChevronRight, Sparkles, Zap, Globe2, BarChart3
} from 'lucide-react';

interface Earth2ForecastCardProps {
  lat: number;
  lon: number;
  cityName: string;
}

export const Earth2ForecastCard = ({ lat, lon, cityName }: Earth2ForecastCardProps) => {
  const [forecast, setForecast] = useState<Earth2ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const { toast } = useToast();

  const fetchForecast = async () => {
    setIsLoading(true);
    try {
      const data = await getEarth2Forecast({ lat, lon, forecastDays: 7 });
      setForecast(data);
    } catch (error) {
      console.error('Forecast error:', error);
      toast({
        title: 'Forecast Error',
        description: error instanceof Error ? error.message : 'Failed to fetch forecast',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (precip: number, cloud: number) => {
    if (precip > 50) return <Droplets className="w-5 h-5 text-blue-400" />;
    if (cloud > 70) return <Cloud className="w-5 h-5 text-muted-foreground" />;
    return <Thermometer className="w-5 h-5 text-amber-400" />;
  };

  if (!forecast && !isLoading) {
    return (
      <Card className="glass border-primary/20 p-6 hover:border-primary/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <Globe2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                NVIDIA Earth-2
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                  FREE TIER
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">High-resolution ensemble forecasting</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <Cpu className="w-3 h-3 mr-1" />
              FourCastNet Compatible
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              40+ Ensemble Members
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              25km Resolution
            </Badge>
          </div>
          
          <Button
            onClick={fetchForecast}
            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate 7-Day Ensemble Forecast
          </Button>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="glass border-primary/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4 animate-pulse">
          Processing ensemble simulations...
        </p>
      </Card>
    );
  }

  if (!forecast) return null;

  const currentDay = forecast.dailySummary[selectedDay];

  return (
    <Card className="glass border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-emerald-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Earth-2 Forecast</h3>
              <p className="text-xs text-muted-foreground">{cityName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchForecast}
            disabled={isLoading}
            className="hover:bg-emerald-500/10"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Day Selector */}
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
          {forecast.dailySummary.map((day, i) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedDay === i
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              }`}
            >
              <div>{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</div>
              <div className="text-[10px] opacity-70">
                {new Date(day.date).toLocaleDateString('en', { day: 'numeric' })}
              </div>
            </button>
          ))}
        </div>

        {/* Current Day Stats */}
        {currentDay && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-muted-foreground">Temperature</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">
                  {currentDay.temperatureRange.max}°
                </span>
                <span className="text-xs text-muted-foreground">
                  / {currentDay.temperatureRange.min}°C
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-muted-foreground">Precipitation</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">
                  {currentDay.precipitationProbability}%
                </span>
                <span className="text-xs text-muted-foreground">chance</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-zinc-500/10 border border-slate-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Wind className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-muted-foreground">Wind Max</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">
                  {currentDay.windSpeedMax}
                </span>
                <span className="text-xs text-muted-foreground">km/h</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-muted-foreground">Confidence</span>
              </div>
              <div className="space-y-1">
                <span className="text-lg font-bold text-foreground">
                  {Math.round(currentDay.confidence)}%
                </span>
                <Progress value={currentDay.confidence} className="h-1" />
              </div>
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="pt-3 border-t border-muted/30">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-500/30">
                {forecast.model}
              </Badge>
              <span>•</span>
              <span>{forecast.metadata.resolution}</span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>{forecast.metadata.processingTimeMs}ms</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
