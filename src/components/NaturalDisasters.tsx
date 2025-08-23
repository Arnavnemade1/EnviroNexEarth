import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Flame, CloudRain, Wind, Zap } from 'lucide-react';

interface DisasterEvent {
  id: string;
  title: string;
  type: 'wildfire' | 'flood' | 'storm' | 'earthquake' | 'drought';
  location: string;
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  date: string;
  description: string;
}

const DisasterIcon = ({ type }: { type: DisasterEvent['type'] }) => {
  switch (type) {
    case 'wildfire':
      return <Flame className="w-4 h-4 text-orange-500" />;
    case 'flood':
      return <CloudRain className="w-4 h-4 text-blue-500" />;
    case 'storm':
      return <Wind className="w-4 h-4 text-purple-500" />;
    case 'earthquake':
      return <Zap className="w-4 h-4 text-red-500" />;
    case 'drought':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
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

  useEffect(() => {
    // Simulate NASA disaster API data
    const generateDisasters = () => {
      const mockDisasters: DisasterEvent[] = [
        {
          id: '1',
          title: 'California Wildfire',
          type: 'wildfire',
          location: 'Los Angeles, CA',
          lat: 34.0522,
          lng: -118.2437,
          severity: 'high',
          date: '2024-08-20',
          description: 'Large wildfire burning across multiple counties'
        },
        {
          id: '2',
          title: 'Florida Hurricane Watch',
          type: 'storm',
          location: 'Miami, FL',
          lat: 25.7617,
          lng: -80.1918,
          severity: 'extreme',
          date: '2024-08-22',
          description: 'Category 3 hurricane approaching the coast'
        },
        {
          id: '3',
          title: 'Texas Drought',
          type: 'drought',
          location: 'Dallas, TX',
          lat: 32.7767,
          lng: -96.7970,
          severity: 'medium',
          date: '2024-08-15',
          description: 'Severe drought conditions affecting agriculture'
        },
        {
          id: '4',
          title: 'Philippine Typhoon',
          type: 'storm',
          location: 'Manila, Philippines',
          lat: 14.5995,
          lng: 120.9842,
          severity: 'high',
          date: '2024-08-21',
          description: 'Typhoon bringing heavy rains and flooding'
        },
        {
          id: '5',
          title: 'Australian Bushfire',
          type: 'wildfire',
          location: 'Sydney, Australia',
          lat: -33.8688,
          lng: 151.2093,
          severity: 'medium',
          date: '2024-08-19',
          description: 'Bushfire threatening residential areas'
        }
      ];
      
      setDisasters(mockDisasters);
      setLoading(false);
    };

    generateDisasters();
  }, []);

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
    <div className="glass p-4 rounded-xl w-80 max-h-96">
      <h3 className="font-bold text-lg mb-3 text-primary flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Natural Disasters
      </h3>
      <ScrollArea className="h-80">
        <div className="space-y-3">
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