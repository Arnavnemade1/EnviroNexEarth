import { useEffect, useState, useRef } from 'react';
import Globe from 'worldwind-react-globe';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';
import { SatelliteData } from '@/types';

interface GlobeComponentProps {
  onCityClick?: (lat: number, lng: number) => void;
  selectedCity?: { lat: number; lng: number } | null;
  pollutionData?: Array<{ lat: number; lng: number; value: number; color: string }>;
  showSatellites?: boolean;
}

export const GlobeComponent = ({
  onCityClick,
  selectedCity,
  pollutionData = [],
  showSatellites = true
}: GlobeComponentProps) => {
  const globeRef = useRef<any>(null);
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteData | null>(null);

  // WorldWind layer configuration
  // Using NASA Blue Marble, atmosphere, stars, and controls
  const layers = [
    'blue-marble',           // NASA satellite imagery
    'blue-marble-landsat',   // Enhanced with Landsat
    'atmosphere-day-night',  // Atmosphere with day/night shading
    'stars',                 // Starfield background
    'coordinates',           // Lat/long grid (optional)
    'view-controls'          // Navigation controls
  ];

  // Major cities for visualization
  const cityLights = [
    { lat: 40.7128, lng: -74.0060, size: 10, name: 'New York' },
    { lat: 34.0522, lng: -118.2437, size: 8, name: 'Los Angeles' },
    { lat: 51.5074, lng: -0.1278, size: 8, name: 'London' },
    { lat: 48.8566, lng: 2.3522, size: 8, name: 'Paris' },
    { lat: 35.6762, lng: 139.6503, size: 12, name: 'Tokyo' },
    { lat: 31.2304, lng: 121.4737, size: 10, name: 'Shanghai' },
    { lat: 28.6139, lng: 77.2090, size: 9, name: 'Delhi' },
    { lat: 19.4326, lng: -99.1332, size: 8, name: 'Mexico City' },
    { lat: -23.5505, lng: -46.6333, size: 9, name: 'São Paulo' },
    { lat: 30.0444, lng: 31.2357, size: 8, name: 'Cairo' },
    { lat: 25.2048, lng: 55.2708, size: 9, name: 'Dubai' },
    { lat: -33.8688, lng: 151.2093, size: 7, name: 'Sydney' },
  ];

  // Generate satellite data
  useEffect(() => {
    const sats: SatelliteData[] = [
      {
        id: 'iss',
        name: 'International Space Station',
        lat: 51.6461,
        lng: 0.0,
        altitude: 408,
        velocity: 7.66,
        description: 'The ISS orbits Earth approximately every 90 minutes at an altitude of ~408 km'
      },
      {
        id: 'hubble',
        name: 'Hubble Space Telescope',
        lat: 28.5,
        lng: -80.6,
        altitude: 547,
        velocity: 7.59,
        description: 'NASA\'s premier space telescope, capturing stunning images of the universe since 1990'
      },
      {
        id: 'landsat8',
        name: 'Landsat-8',
        lat: -15.8,
        lng: 120.3,
        altitude: 705,
        velocity: 7.47,
        description: 'Earth observation satellite providing critical data for environmental monitoring'
      },
      {
        id: 'terra',
        name: 'TERRA',
        lat: 45.2,
        lng: -90.1,
        altitude: 705,
        velocity: 7.47,
        description: 'NASA\'s flagship Earth observation satellite, monitoring climate and environmental change'
      }
    ];

    setSatellites(sats);

    // Animate satellites
    const interval = setInterval(() => {
      setSatellites(prev => prev.map(sat => ({
        ...sat,
        lng: (sat.lng + sat.velocity * 0.01) % 360
      })));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Fly to selected city
  useEffect(() => {
    if (globeRef.current && selectedCity) {
      // WorldWind uses goTo method for navigation
      if (globeRef.current.goTo) {
        globeRef.current.goTo(selectedCity.lat, selectedCity.lng, 2000000);
      }
    }
  }, [selectedCity]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* NASA WorldWind Globe */}
      <Globe
        ref={globeRef}
        layers={layers}
        latitude={selectedCity?.lat || 34.2}
        longitude={selectedCity?.lng || -119.2}
        altitude={selectedCity ? 2000000 : 10000000}
        className="absolute inset-0"
      />

      {/* Satellite Info Modal */}
      {selectedSatellite && (
        <div className="absolute top-4 right-4 z-50 glass rounded-xl max-w-sm max-h-64 overflow-hidden bg-transparent border-primary/30 border-2 shadow-2xl shadow-primary/20">
          <ScrollArea className="h-full p-4">
            <button
              onClick={() => setSelectedSatellite(null)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-primary">{selectedSatellite.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{selectedSatellite.description}</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Altitude:</span>
                <span className="text-foreground">{selectedSatellite.altitude} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Velocity:</span>
                <span className="text-foreground">{selectedSatellite.velocity} km/s</span>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Info overlay - WorldWind attribution */}
      <div className="absolute bottom-4 right-4 z-40 text-xs text-white/60">
        Powered by NASA WorldWind
      </div>
    </div>
  );
};

export default GlobeComponent;