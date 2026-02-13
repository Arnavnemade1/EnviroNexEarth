import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TriangleAlert as AlertTriangle, Flame, CloudRain, Wind, Zap, Mountain, Sparkles, RefreshCw, MapPin, Calendar, ExternalLink, Loader as Loader2, X } from 'lucide-react';
import { nasaEONET, type DisasterEvent } from '@/services/nasaEONET';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DisasterIcon = ({ type }: { type: DisasterEvent['type'] }) => {
  switch (type) {
    case 'wildfire':
      return <Flame className="w-4 h-4 text-orange-500" />;
    case 'flood':
      return <CloudRain className="w-4 h-4 text-blue-500" />;
    case 'storm':
    case 'severeStorm':
      return <Wind className="w-4 h-4 text-purple-500" />;
    case 'earthquake':
      return <Zap className="w-4 h-4 text-red-500" />;
    case 'volcano':
      return <Mountain className="w-4 h-4 text-red-600" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

const getSeverityColor = (severity: DisasterEvent['severity']) => {
  switch (severity) {
    case 'low':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'high':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case 'extreme':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

interface NaturalDisastersProps {
  onDisasterClick?: (lat: number, lng: number) => void;
  locationData?: {
    cityName: string;
    lat: number;
    lon: number;
  };
  onClose?: () => void;
}

export const NaturalDisasters = ({ onDisasterClick, locationData, onClose }: NaturalDisastersProps) => {
  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [activeView, setActiveView] = useState<'live' | 'predictions'>('live');
  const [showPast, setShowPast] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity'>('date');
  const { toast } = useToast();

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        if (!refreshing) setLoading(true);
        const [activeDisasters, pastDisasters] = await Promise.all([
          nasaEONET.getActiveDisasters(25),
          showPast ? nasaEONET.getPastDisasters(15) : Promise.resolve([])
        ]);

        const allDisasters = showPast ? [...activeDisasters, ...pastDisasters] : activeDisasters;
        const filteredDisasters = selectedType === 'all' ? allDisasters : allDisasters.filter(d => d.type === selectedType);

        const sortedDisasters = filteredDisasters.sort((a, b) => {
          if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
          const severityOrder = { 'extreme': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        });

        setDisasters(sortedDisasters);
        if (sortedDisasters.length > 0) {
          fetchPredictions(sortedDisasters);
        }
      } catch (error) {
        console.error('Failed to load disasters:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchDisasters();
  }, [showPast, selectedType, sortBy]);

  const fetchPredictions = async (currentDisasters: DisasterEvent[]) => {
    setLoadingPredictions(true);
    try {
      const { data, error } = await supabase.functions.invoke('disaster-prediction-engine', {
        body: { disasters: currentDisasters, locationData }
      });
      if (error) throw error;
      setPredictions(data.predictions || []);
      setAiSummary(data.summary || '');
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      setAiSummary('Multiple active natural disasters are currently affecting global atmospheric conditions.');
    } finally {
      setLoadingPredictions(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setShowPast(prev => !prev);
    setTimeout(() => setShowPast(prev => !prev), 10);
  };

  const DisasterPredictionCard = ({ prediction }: { prediction: any }) => (
    <Card className="p-4 mb-3 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-default">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <DisasterIcon type={prediction.type} />
          <span className="font-bold text-sm text-primary">{prediction.title}</span>
        </div>
        <Badge className={getSeverityColor(prediction.severity)}>{prediction.severity}</Badge>
      </div>
      <p className="text-xs text-foreground/90 mb-2 leading-relaxed">{prediction.description}</p>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <div className="text-[10px] text-muted-foreground flex flex-col">
          <span>Likelihood: <span className="text-primary">{prediction.likelihood}%</span></span>
          <span>Timeframe: <span className="text-slate-300">{prediction.timeframe}</span></span>
        </div>
        <Badge variant="outline" className="text-[9px] h-5 border-white/10 uppercase font-bold text-slate-400">Predicted</Badge>
      </div>
    </Card>
  );

  return (
    <div className="glass bg-slate-950/40 backdrop-blur-xl border-white/10 p-4 rounded-[20px] w-80 max-h-[calc(100vh-6rem)] flex flex-col shadow-2xl relative overflow-hidden group">
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] pointer-events-none opacity-50" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-lg text-white">
            Neural Sentinel
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={refreshing} className="h-8 w-8 rounded-full hover:bg-white/10">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-xl mb-4 border border-white/5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveView('live')}
          className={`flex-1 text-[10px] font-bold uppercase tracking-widest h-8 rounded-lg transition-all ${activeView === 'live' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500'}`}
        >
          Live Events
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveView('predictions')}
          className={`flex-1 text-[10px] font-bold uppercase tracking-widest h-8 rounded-lg transition-all ${activeView === 'predictions' ? 'bg-indigo-500/20 text-indigo-400 shadow-lg' : 'text-slate-500'}`}
        >
          Predictions
        </Button>
      </div>

      {aiSummary && (
        <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Tactical Assessment</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight line-clamp-3 italic opacity-80">"{aiSummary}"</p>
        </div>
      )}

      <ScrollArea className="flex-1 -mr-2 pr-2">
        <div className="space-y-3 pb-2">
          {activeView === 'live' ? (
            disasters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-500">Retrieving EONET telemetry...</p>
              </div>
            ) : (
              disasters.map((disaster) => (
                <Card
                  key={disaster.id}
                  className="p-4 cursor-pointer hover:bg-white/5 transition-all duration-300 border-white/5 hover:border-white/10 group bg-transparent"
                  onClick={() => onDisasterClick?.(disaster.lat, disaster.lng)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DisasterIcon type={disaster.type} />
                      <span className="font-bold text-xs text-slate-200 line-clamp-1">{disaster.title}</span>
                    </div>
                    <Badge variant="outline" className={`text-[9px] border-white/10 font-bold uppercase ${getSeverityColor(disaster.severity)}`}>
                      {disaster.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{disaster.location}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug line-clamp-2">{disaster.description}</p>
                </Card>
              ))
            )
          ) : (
            loadingPredictions ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : predictions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-500">Neural models initializing...</p>
              </div>
            ) : (
              predictions.map(pred => (
                <DisasterPredictionCard key={pred.id} prediction={pred} />
              ))
            )
          )}
        </div>
      </ScrollArea>

      <div className="mt-3 pt-3 border-t border-white/5 text-[9px] text-slate-500 flex justify-between items-center italic">
        <span>Sentinel v2.4 Active</span>
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          System Operational
        </span>
      </div>
    </div>
  );
};

export default NaturalDisasters;