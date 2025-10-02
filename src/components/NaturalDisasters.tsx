import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Flame, CloudRain, Wind, Zap, Mountain, Sparkles, RefreshCw, MapPin, Calendar, ExternalLink } from 'lucide-react';
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
  const [refreshing, setRefreshing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity'>('date');

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        if (!refreshing) setLoading(true);
        const [activeDisasters, pastDisasters] = await Promise.all([
          nasaEONET.getActiveDisasters(25),
          nasaEONET.getPastDisasters(15)
        ]);
        
        const allDisasters = showPast 
          ? [...activeDisasters, ...pastDisasters]
          : activeDisasters;
        
        // Filter by type if selected
        const filteredDisasters = selectedType === 'all' 
          ? allDisasters 
          : allDisasters.filter(d => d.type === selectedType);
        
        // Sort disasters
        const sortedDisasters = filteredDisasters.sort((a, b) => {
          if (sortBy === 'date') {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          } else {
            const severityOrder = { 'extreme': 4, 'high': 3, 'medium': 2, 'low': 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
          }
        });
        
        setDisasters(sortedDisasters);
        
        // Generate AI summary of environmental impact
        if (sortedDisasters.length > 0) {
          generateAISummary(sortedDisasters);
        }
      } catch (error) {
        console.error('Failed to load disasters:', error);
        toast({
          title: "Failed to load disaster data",
          description: "Please check your connection and try again",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchDisasters();
  }, [showPast, selectedType, sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Trigger re-fetch by updating a dependency
    setShowPast(prev => prev);
  };

  const generateAISummary = async (disasters: DisasterEvent[]) => {
    if (disasters.length === 0) return;
    
    setLoadingSummary(true);
    try {
      const disasterSummary = disasters.slice(0, 8).map(d => 
        `${d.title} (${d.type}) at ${d.location} - Severity: ${d.severity} - Date: ${new Date(d.date).toLocaleDateString()}`
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

  const getDisasterTypeOptions = () => [
    { value: 'all', label: 'All Types', count: disasters.length },
    { value: 'wildfire', label: 'Wildfires', count: disasters.filter(d => d.type === 'wildfire').length },
    { value: 'storm', label: 'Storms', count: disasters.filter(d => d.type === 'storm' || d.type === 'severeStorm').length },
    { value: 'flood', label: 'Floods', count: disasters.filter(d => d.type === 'flood').length },
    { value: 'earthquake', label: 'Earthquakes', count: disasters.filter(d => d.type === 'earthquake').length },
    { value: 'volcano', label: 'Volcanoes', count: disasters.filter(d => d.type === 'volcano').length }
  ].filter(option => option.count > 0);

  if (loading) {
    return (
      <div className="glass p-4 rounded-xl w-80 bg-transparent border-white/10">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass bg-transparent border-white/10 p-4 rounded-xl w-80 max-h-[calc(100vh-3rem)] flex flex-col shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Natural Disasters
          <Badge variant="outline" className="text-xs border-primary/30">
            NASA EONET
          </Badge>
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={refreshing}
          className="glass bg-transparent border-white/10 hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* Filter Controls */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant={!showPast ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setShowPast(false)}
          >
            Active ({disasters.filter((_, i) => i < 25).length})
          </Badge>
          <Badge 
            variant={showPast ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setShowPast(true)}
          >
            Include Past
          </Badge>
        </div>
        
        {/* Type Filter */}
        <div className="flex gap-1 flex-wrap">
          {getDisasterTypeOptions().map(option => (
            <Badge
              key={option.value}
              variant={selectedType === option.value ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedType(option.value)}
            >
              {option.label} ({option.count})
            </Badge>
          ))}
        </div>
        
        {/* Sort Options */}
        <div className="flex gap-2">
          <Badge
            variant={sortBy === 'date' ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setSortBy('date')}
          >
            <Calendar className="w-3 h-3 mr-1" />
            By Date
          </Badge>
          <Badge
            variant={sortBy === 'severity' ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setSortBy('severity')}
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            By Severity
          </Badge>
        </div>
      </div>
      
      {/* Remove old filter section */}
      <div className="hidden gap-2 mb-3">
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
        <Card className="mb-4 p-3 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-primary">AI Environmental Impact Analysis</span>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">{aiSummary}</p>
        </Card>
      )}
      
      {loadingSummary && !aiSummary && (
        <Card className="mb-4 p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Generating AI analysis...</span>
          </div>
        </Card>
      )}
      
      {/* Statistics Summary */}
      {disasters.length > 0 && (
        <Card className="mb-4 p-3 bg-muted/10 border-border/30">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">{disasters.length}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">
                {disasters.filter(d => d.severity === 'extreme' || d.severity === 'high').length}
              </div>
              <div className="text-xs text-muted-foreground">High Risk</div>
            </div>
          </div>
        </Card>
      )}
      
      <ScrollArea className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20">
        <div className="space-y-3 pr-2 pb-2">
          {disasters.length === 0 && !loading && (
            <Card className="p-6 text-center border-border/50 bg-muted/5">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No disasters found for current filters</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedType('all');
                  setShowPast(true);
                }}
                className="mt-2 glass"
              >
                Show All Events
              </Button>
            </Card>
          )}
          {disasters.map((disaster) => (
            <Card 
              key={disaster.id}
              className="p-4 cursor-pointer hover:bg-accent/20 transition-all duration-200 border-border/50 hover:border-primary/30 hover:shadow-lg group"
              onClick={() => handleDisasterClick(disaster)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DisasterIcon type={disaster.type} />
                  <span className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {disaster.title}
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getSeverityColor(disaster.severity)} flex-shrink-0 ml-2`}
                >
                  {disaster.severity}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{disaster.location}</span>
                </div>
                
                <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">
                  {disaster.description}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(disaster.date).toLocaleDateString()}</span>
                  </div>
                  {disaster.source !== 'NASA EONET' && (
                    <div className="flex items-center gap-1 text-primary/70">
                      <ExternalLink className="w-3 h-3" />
                      <span>Source</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Hover indicator */}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary">
                Click to view on globe →
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      {/* Footer Info */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-xs text-muted-foreground text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Powered by NASA EONET</span>
          </div>
          <div>Real-time natural disaster tracking</div>
        </div>
      </div>
    </div>
  );
};

export default NaturalDisasters;