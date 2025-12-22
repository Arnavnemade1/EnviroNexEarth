import { useEffect, useState, useMemo } from 'react';
import { Viewer, Entity, PointGraphics, CloudCollection, CumulusCloud } from 'resium';
import * as Cesium from 'cesium';
import { SatelliteData } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Clock, Cloud, Zap, X } from 'lucide-react';

// CSS is handled by vite-plugin-cesium, manual import can cause issues
// import "cesium/Build/Cesium/Widgets/widgets.css";

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
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteData | null>(null);
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);

  // Major cities for city lights
  const cityLights = useMemo(() => [
    { lat: 40.7128, lng: -74.0060, size: 10 }, // New York
    { lat: 34.0522, lng: -118.2437, size: 8 }, // LA
    { lat: 51.5074, lng: -0.1278, size: 8 }, // London
    { lat: 48.8566, lng: 2.3522, size: 8 }, // Paris
    { lat: 35.6762, lng: 139.6503, size: 12 }, // Tokyo
    { lat: 31.2304, lng: 121.4737, size: 10 }, // Shanghai
    { lat: 28.6139, lng: 77.2090, size: 9 }, // Delhi
    { lat: 19.4326, lng: -99.1332, size: 8 }, // Mexico City
    { lat: -23.5505, lng: -46.6333, size: 9 }, // São Paulo
    { lat: 30.0444, lng: 31.2357, size: 8 }, // Cairo
    { lat: 25.2048, lng: 55.2708, size: 9 }, // Dubai
    { lat: -33.8688, lng: 151.2093, size: 7 }, // Sydney
  ], []);

  // Generate satellite data
  useEffect(() => {
    const generateSatellites = () => {
      const sats: SatelliteData[] = [
        {
          id: 'iss',
          name: 'International Space Station',
          lat: 51.6461,
          lng: 0.0,
          altitude: 408000, // Cesium uses meters
          velocity: 7.66,
          description: 'The ISS orbits Earth approximately every 90 minutes at an altitude of ~408 km'
        },
        {
          id: 'hubble',
          name: 'Hubble Space Telescope',
          lat: 28.5,
          lng: -80.6,
          altitude: 547000,
          velocity: 7.59,
          description: 'NASA\'s premier space telescope, capturing stunning images of the universe since 1990'
        },
        {
          id: 'landsat8',
          name: 'Landsat-8',
          lat: -15.8,
          lng: 120.3,
          altitude: 705000,
          velocity: 7.47,
          description: 'Earth observation satellite providing critical data for environmental monitoring'
        },
        {
          id: 'terra',
          name: 'TERRA',
          lat: 45.2,
          lng: -90.1,
          altitude: 705000,
          velocity: 7.47,
          description: 'NASA\'s flagship Earth observation satellite, monitoring climate and environmental change'
        }
      ];

      setSatellites(sats);
    };

    generateSatellites();
  }, []);

  // Animate satellites
  useEffect(() => {
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
    if (viewer && selectedCity) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(selectedCity.lng, selectedCity.lat, 2000000),
        duration: 2
      });
    }
  }, [viewer, selectedCity]);

  console.log("GlobeComponent rendering");

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Viewer
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false} // Disable default layer picker to avoid token issues with default Bing maps
        navigationHelpButton={false}
        homeButton={false}
        geocoder={false}
        sceneModePicker={false}
        selectionIndicator={false}
        infoBox={false}
        // Use OpenStreetMap to avoid Ion Token requirements for default imagery
        imageryProvider={new Cesium.OpenStreetMapImageryProvider({
          url: "https://tile.openstreetmap.org/"
        })}
        ref={(e) => {
          if (e && e.cesiumElement) {
            setViewer(e.cesiumElement);
            // Enable lighting
            e.cesiumElement.scene.globe.enableLighting = true;
            // Set dark space background
            e.cesiumElement.scene.backgroundColor = Cesium.Color.BLACK;
          }
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {/* City Lights */}
        {cityLights.map((city, i) => (
          <Entity
            key={`city-${i}`}
            position={Cesium.Cartesian3.fromDegrees(city.lng, city.lat)}
            name="City Light"
            point={{
              pixelSize: city.size,
              color: Cesium.Color.YELLOW,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1
            }}
            onClick={() => onCityClick?.(city.lat, city.lng)}
          />
        ))}

        {/* Satellites */}
        {showSatellites && satellites.map((sat) => (
          <Entity
            key={sat.id}
            position={Cesium.Cartesian3.fromDegrees(sat.lng, sat.lat, sat.altitude)}
            name={sat.name}
            point={{
              pixelSize: 10,
              color: sat.id === 'iss' ? Cesium.Color.ORANGE : Cesium.Color.CYAN,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2
            }}
            onClick={() => setSelectedSatellite(sat)}
          />
        ))}

        {/* Selected City Marker */}
        {selectedCity && (
          <Entity
            position={Cesium.Cartesian3.fromDegrees(selectedCity.lng, selectedCity.lat)}
            name="Selected City"
            point={{
              pixelSize: 15,
              color: Cesium.Color.fromCssColorString('hsl(var(--accent))'),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2
            }}
          />
        )}

        {/* Clouds (Example using CloudCollection) */}
        <CloudCollection>
          <CumulusCloud
            position={Cesium.Cartesian3.fromDegrees(-74.0, 40.0, 5000)}
            scale={new Cesium.Cartesian2(2500, 1000)}
            maximumSize={new Cesium.Cartesian3(500, 500, 200)}
          />
          {/* Add more clouds randomly if needed */}
        </CloudCollection>

      </Viewer>

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
                <span className="text-foreground">{(selectedSatellite.altitude / 1000).toFixed(0)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Velocity:</span>
                <span className="text-foreground">{selectedSatellite.velocity} km/s</span>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default GlobeComponent;