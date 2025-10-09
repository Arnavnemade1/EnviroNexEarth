import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';
import { interpolateRdYlBu } from 'd3-scale-chromatic';
import { SatelliteData } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, Layers, Navigation, Ruler, Clock, Cloud, Zap, X } from 'lucide-react';


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
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteData | null>(null);
  const [dayNightCycle, setDayNightCycle] = useState(0);
  const [shootingStars, setShootingStars] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [showControls, setShowControls] = useState(true);
  const [layers, setLayers] = useState({
    cityLights: true,
    clouds: true,
    satellites: true,
    atmosphere: true,
    orbitalPaths: true
  });
  const [timeOfDay, setTimeOfDay] = useState(12); // 0-24 hours
  const [measuringDistance, setMeasuringDistance] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<Array<{lat: number, lng: number}>>([]);

  // Famous locations for quick travel
  const famousLocations = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: 'Amazon', lat: -3.4653, lng: -62.2159 },
  ];

  // Major cities for city lights
  const cityLights = [
    { lat: 40.7128, lng: -74.0060, size: 0.8 }, // New York
    { lat: 34.0522, lng: -118.2437, size: 0.7 }, // LA
    { lat: 51.5074, lng: -0.1278, size: 0.6 }, // London
    { lat: 48.8566, lng: 2.3522, size: 0.6 }, // Paris
    { lat: 35.6762, lng: 139.6503, size: 0.9 }, // Tokyo
    { lat: 31.2304, lng: 121.4737, size: 0.8 }, // Shanghai
    { lat: 28.6139, lng: 77.2090, size: 0.7 }, // Delhi
    { lat: 19.4326, lng: -99.1332, size: 0.6 }, // Mexico City
    { lat: -23.5505, lng: -46.6333, size: 0.7 }, // São Paulo
    { lat: 30.0444, lng: 31.2357, size: 0.6 }, // Cairo
    { lat: 25.2048, lng: 55.2708, size: 0.7 }, // Dubai
    { lat: -33.8688, lng: 151.2093, size: 0.5 }, // Sydney
  ];

  // Generate satellite data
  useEffect(() => {
    const generateSatellites = () => {
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
    };

    generateSatellites();
  }, []);

  useEffect(() => {
    if (!globeRef.current || globeInstanceRef.current) return; // Prevent re-initialization

    // Initialize Globe with ultra-enhanced visuals
    const globe = new Globe(globeRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(window.innerWidth)
      .height(window.innerHeight)
      .atmosphereColor('#60a5fa')
      .atmosphereAltitude(0.3)
      .enablePointerInteraction(true)
      .showAtmosphere(true)
      .pointOfView({ altitude: 2.5 });

    // Configure camera with enhanced settings
    globe.camera().position.z = 300;
    
    // Auto-rotate with smooth motion
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.3;
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.05;
    globe.controls().minDistance = 200;
    globe.controls().maxDistance = 600;

    // Click handler for cities and distance measurement
    globe.onGlobeClick((coords: { lat: number; lng: number }) => {
      if (measuringDistance) {
        setMeasurePoints(prev => {
          const newPoints = [...prev, coords];
          if (newPoints.length === 2) {
            // Calculate distance
            const R = 6371; // Earth's radius in km
            const lat1 = newPoints[0].lat * Math.PI / 180;
            const lat2 = newPoints[1].lat * Math.PI / 180;
            const deltaLat = (newPoints[1].lat - newPoints[0].lat) * Math.PI / 180;
            const deltaLng = (newPoints[1].lng - newPoints[0].lng) * Math.PI / 180;
            
            const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                     Math.cos(lat1) * Math.cos(lat2) *
                     Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            
            alert(`Distance: ${distance.toFixed(2)} km`);
            return [];
          }
          return newPoints;
        });
      } else if (onCityClick) {
        onCityClick(coords.lat, coords.lng);
      }
    });

    globeInstanceRef.current = globe;

    // Cleanup
    return () => {
      if (globeInstanceRef.current) {
        globeInstanceRef.current._destructor();
        globeInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array - only initialize once

  // Removed hex towers - they don't look good

  // Update selected city
  useEffect(() => {
    if (!globeInstanceRef.current || !selectedCity) return;

    // Point camera to selected city
    const coords = { lat: selectedCity.lat, lng: selectedCity.lng, altitude: 1.5 };
    globeInstanceRef.current.pointOfView(coords, 2000);

    // Add marker for selected city
    globeInstanceRef.current
      .htmlElementsData([selectedCity])
      .htmlElement((d: any) => {
        const el = document.createElement('div');
        el.innerHTML = `
          <div class="city-marker animate-pulse-glow">
            <div class="w-4 h-4 bg-accent rounded-full glow"></div>
            <div class="w-8 h-8 bg-accent/20 rounded-full absolute -top-2 -left-2 animate-ping"></div>
          </div>
        `;
        el.style.color = 'hsl(var(--accent))';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.position = 'relative';
        return el;
      })
      .htmlLat((d: any) => d.lat)
      .htmlLng((d: any) => d.lng);
  }, [selectedCity]);

  // City Lights Layer
  useEffect(() => {
    if (!globeInstanceRef.current) return;

    if (layers.cityLights) {
      globeInstanceRef.current
        .pointsData(cityLights)
        .pointColor(() => '#ffeb3b')
        .pointAltitude((d: any) => 0.01)
        .pointRadius((d: any) => d.size)
        .pointsMerge(false);
    } else {
      globeInstanceRef.current.pointsData([]);
    }
  }, [layers.cityLights]);

  // Clouds Layer
  useEffect(() => {
    if (!globeInstanceRef.current) return;

    const CLOUDS_IMG_URL = '//unpkg.com/three-globe/example/clouds/clouds.png';
    const CLOUDS_ALT = 0.004;
    const CLOUDS_ROTATION_SPEED = -0.006;

    let cloudsLayer: THREE.Mesh | null = null;

    if (layers.clouds) {
      new THREE.TextureLoader().load(CLOUDS_IMG_URL, (cloudsTexture) => {
        cloudsLayer = new THREE.Mesh(
          new THREE.SphereGeometry(
            globeInstanceRef.current.getGlobeRadius() * (1 + CLOUDS_ALT),
            75,
            75
          ),
          new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true, opacity: 0.8 })
        );
        cloudsLayer.name = 'clouds-layer';
        globeInstanceRef.current.scene().add(cloudsLayer);

        (function rotateClouds() {
          if (cloudsLayer && cloudsLayer.parent) {
            cloudsLayer.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
            requestAnimationFrame(rotateClouds);
          }
        })();
      });
    } else {
      // Remove clouds layer if it exists
      const existingClouds = globeInstanceRef.current.scene().getObjectByName('clouds-layer');
      if (existingClouds) {
        globeInstanceRef.current.scene().remove(existingClouds);
      }
    }

    return () => {
      if (cloudsLayer) {
        globeInstanceRef.current.scene().remove(cloudsLayer);
      }
    };
  }, [layers.clouds]);

  // Animate satellites
  useEffect(() => {
    if (!globeInstanceRef.current || !satellites.length) return;

    const animateSatellites = () => {
      const updatedSatellites = satellites.map(sat => ({
        ...sat,
        lng: (sat.lng + sat.velocity * 0.01) % 360
      }));
      setSatellites(updatedSatellites);
    };

    const interval = setInterval(animateSatellites, 100);
    
    if (layers.satellites) {
      globeInstanceRef.current
        .objectsData(satellites)
        .objectLat((d: any) => d.lat)
        .objectLng((d: any) => d.lng)
        .objectAltitude((d: any) => d.altitude / 1000)
        .objectThreeObject((d: any) => {
          const isISS = d.id === 'iss';

          // Create satellite mesh
          const geometry = new THREE.BoxGeometry(0.8, 0.8, 2.5);
          const material = new THREE.MeshLambertMaterial({
            color: isISS ? '#fbbf24' : '#60a5fa'
          });
          const satellite = new THREE.Mesh(geometry, material);

          // Add solar panels
          const panelGeometry = new THREE.PlaneGeometry(4, 1.5);
          const panelMaterial = new THREE.MeshLambertMaterial({
            color: '#1e293b',
            transparent: true,
            opacity: 0.9
          });

          const panel1 = new THREE.Mesh(panelGeometry, panelMaterial);
          const panel2 = new THREE.Mesh(panelGeometry, panelMaterial);

          panel1.position.set(-2.5, 0, 0);
          panel2.position.set(2.5, 0, 0);

          const satelliteGroup = new THREE.Group();
          satelliteGroup.add(satellite);
          satelliteGroup.add(panel1);
          satelliteGroup.add(panel2);

          // Add glow effect
          const glowGeometry = new THREE.SphereGeometry(1.5);
          const glowMaterial = new THREE.MeshLambertMaterial({
            color: isISS ? '#fbbf24' : '#60a5fa',
            transparent: true,
            opacity: 0.3
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          satelliteGroup.add(glow);

          return satelliteGroup;
        })
        .onObjectClick((sat: any) => {
          setSelectedSatellite(sat);
        });
    } else {
      globeInstanceRef.current.objectsData([]);
    }

    return () => clearInterval(interval);
  }, [satellites, layers.satellites]);

  // Orbital Path Trails - Disabled due to rendering issues
  // Will be re-enabled once globe.gl geometry issues are resolved

  // Day/Night Cycle Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDayNightCycle(prev => (prev + 0.5) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Shooting Stars Effect
  useEffect(() => {
    const createShootingStar = () => {
      const newStar = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 50
      };
      setShootingStars(prev => [...prev, newStar]);
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== newStar.id));
      }, 2000);
    };

    const interval = setInterval(createShootingStar, 3000);
    return () => clearInterval(interval);
  }, []);

  // Aurora Borealis Effect
  useEffect(() => {
    if (!globeInstanceRef.current) return;

    if (layers.atmosphere) {
      const auroraData = [
        { lat: 70, lng: -100, alt: 0.1 },
        { lat: 72, lng: -80, alt: 0.12 },
        { lat: 68, lng: -120, alt: 0.11 },
        { lat: 71, lng: -90, alt: 0.13 },
        { lat: -70, lng: 100, alt: 0.1 },
        { lat: -72, lng: 120, alt: 0.12 },
      ];

      globeInstanceRef.current
        .ringsData(auroraData)
        .ringColor(() => (t: number) => `rgba(0, 255, 150, ${Math.sqrt(1-t) * 0.8})`)
        .ringMaxRadius(8)
        .ringPropagationSpeed(3)
        .ringRepeatPeriod(2000);
    } else {
      globeInstanceRef.current.ringsData([]);
    }
  }, [layers.atmosphere]);

  // Quick Travel Function
  const travelTo = (location: { lat: number; lng: number; name: string }) => {
    if (!globeInstanceRef.current) return;
    globeInstanceRef.current.pointOfView({ lat: location.lat, lng: location.lng, altitude: 1.5 }, 2000);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (globeInstanceRef.current) {
        globeInstanceRef.current
          .width(window.innerWidth)
          .height(window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={globeRef} className="w-full h-full" />

      {/* Control Panel Toggle */}
      <Button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-4 left-4 z-50 glass"
        size="icon"
      >
        <Layers className="w-5 h-5" />
      </Button>

      {/* Advanced Control Panel */}
      {showControls && (
        <Card className="absolute top-16 left-4 z-50 glass p-4 w-64 space-y-4">
          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Visual Layers
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cityLights" className="text-xs">City Lights</Label>
                <Switch
                  id="cityLights"
                  checked={layers.cityLights}
                  onCheckedChange={(checked) => setLayers(prev => ({ ...prev, cityLights: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="clouds" className="text-xs">Clouds</Label>
                <Switch
                  id="clouds"
                  checked={layers.clouds}
                  onCheckedChange={(checked) => setLayers(prev => ({ ...prev, clouds: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="satellites" className="text-xs">Satellites</Label>
                <Switch
                  id="satellites"
                  checked={layers.satellites}
                  onCheckedChange={(checked) => setLayers(prev => ({ ...prev, satellites: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="orbitalPaths" className="text-xs">Orbital Paths</Label>
                <Switch
                  id="orbitalPaths"
                  checked={layers.orbitalPaths}
                  onCheckedChange={(checked) => setLayers(prev => ({ ...prev, orbitalPaths: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="atmosphere" className="text-xs">Aurora</Label>
                <Switch
                  id="atmosphere"
                  checked={layers.atmosphere}
                  onCheckedChange={(checked) => setLayers(prev => ({ ...prev, atmosphere: checked }))}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Measurement Tool
            </h3>
            <Button
              onClick={() => {
                setMeasuringDistance(!measuringDistance);
                setMeasurePoints([]);
              }}
              className={`w-full ${measuringDistance ? 'bg-accent' : ''}`}
              size="sm"
              variant={measuringDistance ? 'default' : 'outline'}
            >
              {measuringDistance ? 'Cancel Measuring' : 'Measure Distance'}
            </Button>
            {measuringDistance && (
              <p className="text-xs text-muted-foreground mt-2">
                Click 2 points on globe
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Quick Travel
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {famousLocations.map((loc) => (
                <Button
                  key={loc.name}
                  onClick={() => travelTo(loc)}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {loc.name}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Shooting Stars */}
      {shootingStars.map(star => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full pointer-events-none z-10"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            boxShadow: '0 0 10px 2px rgba(255,255,255,0.8)',
            animation: 'shooting-star 2s linear forwards'
          }}
        />
      ))}

      {/* Aurora Borealis Glow Effect */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0,255,150,0.4) 0%, transparent 70%)',
          animation: 'aurora-pulse 8s ease-in-out infinite'
        }}
      />

      {/* Gradient overlay for atmospheric effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/10" />

      {/* Cosmic Particle Field */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${['#4fa8d8', '#60a5fa', '#8b5cf6', '#ec4899', '#fbbf24'][Math.floor(Math.random() * 5)]} 0%, transparent 70%)`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

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
    </div>
  );
};

export default GlobeComponent;