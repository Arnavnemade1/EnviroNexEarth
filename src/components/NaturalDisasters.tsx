import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Flame, CloudRain, Wind, Zap, Mountain, Sparkles } from 'lucide-react';
import { nasaEONET, type DisasterEvent } from '@/services/nasaEONET';
import { supabase } from '@/integrations/supabase/client';

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
}

export const NaturalDisasters = ({ onDisasterClick }: NaturalDisastersProps) => {
  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        setLoading(true);
        const [activeDisasters, pastDisasters] = await Promise.all([
          nasaEONET.getActiveDisasters(15),
          nasaEONET.getPastDisasters(10)
        ]);
        
        const allDisasters = showPast 
          ? [...activeDisasters, ...pastDisasters]
          : activeDisasters;
        
        setDisasters(allDisasters);
        
        // Generate AI summary of environmental impact
        if (allDisasters.length > 0) {
          generateAISummary(allDisasters);
        }
      } catch (error) {
        console.error('Failed to load disasters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisasters();
  }, [showPast]);

  const generateAISummary = async (disasters: DisasterEvent[]) => {
    if (disasters.length === 0) return;
    
    setLoadingSummary(true);
    try {
      const disasterSummary = disasters.slice(0, 5).map(d => 
        `${d.title} (${d.type}) at ${d.location} - Severity: ${d.severity}`
      ).join('\n');

      const { data, error } = await supabase.functions.invoke('disaster-impact-ai', {
        body: { disasters: disasterSummary }
      });

      if (error) {
        console.error('AI summary error:', error);
        throw error;
      }
      
      if (data?.summary) {
        setAiSummary(data.summary);
      } else {
        setAiSummary('AI analysis is currently unavailable.');
      }
    } catch (error: any) {
      console.error('AI summary generation failed:', error);
      // More specific error messages
      if (error?.message?.includes('rate limit')) {
        setAiSummary('⚠️ AI service temporarily rate limited. Please try again in a moment.');
      } else if (error?.message?.includes('credit')) {
        setAiSummary('⚠️ AI credits exhausted. Please add credits to continue using AI features.');
      } else {
        setAiSummary('Unable to generate AI summary at this time. Data is still loading...');
      }
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleDisasterClick = (disaster: DisasterEvent) => {
    if (onDisasterClick) {
      onDisasterClick(disaster.lat, disaster.lng);
    }
  };

  if (loading) {
    return (
      <div className="glass p-4 rounded-xl w-80">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass bg-transparent border-white/10 p-4 rounded-xl w-80 max-h-[calc(100vh-3rem)] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Natural Disasters
          <Badge variant="outline" className="text-xs border-primary/30">
            NASA EONET
          </Badge>
        </h3>
      </div>
      
      <div className="flex gap-2 mb-3">
        <Badge 
          variant={!showPast ? "default" : "outline"}
          className="cursor-pointer text-xs"
          onClick={() => setShowPast(false)}
        >
          Active ({disasters.filter((_, i) => i < 15).length})
        </Badge>
        <Badge 
          variant={showPast ? "default" : "outline"}
          className="cursor-pointer text-xs"
          onClick={() => setShowPast(true)}
        >
          Include Past
        </Badge>
      </div>
      
      {/* AI Environmental Impact Summary */}
      {aiSummary && (
        <Card className="mb-3 p-3 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-primary">AI Environmental Impact Analysis</span>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">{aiSummary}</p>
        </Card>
      )}
      
      {loadingSummary && !aiSummary && (
        <Card className="mb-3 p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Generating AI analysis...</span>
          </div>
        </Card>
      )}
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-3 pr-2">
          {disasters.length === 0 && !loading && (
            <Card className="p-4 text-center border-border/50">
              <p className="text-sm text-muted-foreground">No disasters found</p>
            </Card>
          )}
          {disasters.map((disaster) => (
            <Card 
              key={disaster.id}
              className="p-3 cursor-pointer hover:bg-accent/50 transition-colors border-border/50"
              onClick={() => handleDisasterClick(disaster)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DisasterIcon type={disaster.type} />
                  <span className="font-medium text-sm">{disaster.title}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getSeverityColor(disaster.severity)}`}
                >
                  {disaster.severity}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{disaster.location}</p>
              <p className="text-xs text-foreground/80">{disaster.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(disaster.date).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NaturalDisasters;