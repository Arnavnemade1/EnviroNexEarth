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
import { MapPin, Layers, Navigation, Ruler, Clock, Cloud, Zap, X, CloudRain } from 'lucide-react';
import { weatherService, WeatherGridData } from '@/services/weatherApi';
import { toast } from 'sonner';


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
  const [cloudData, setCloudData] = useState<WeatherGridData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

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

    // Initialize Globe with HDR ultra-enhanced visuals
    const globe = new Globe(globeRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(window.innerWidth)
      .height(window.innerHeight)
      .atmosphereColor('#3b82f6')
      .atmosphereAltitude(0.35)
      .enablePointerInteraction(true)
      .showAtmosphere(true)
      .pointOfView({ altitude: 2.5 });

    // HDR-like rendering setup
    const scene = globe.scene();
    const renderer = globe.renderer();
    
    // Enable HDR tone mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Enhanced lighting for HDR effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(5, 3, 5);
    sunLight.castShadow = true;
    scene.add(sunLight);
    
    const backLight = new THREE.DirectionalLight(0x4488ff, 0.6);
    backLight.position.set(-5, 2, -5);
    scene.add(backLight);
    
    const fillLight = new THREE.PointLight(0xffffff, 0.5);
    fillLight.position.set(0, 5, 0);
    scene.add(fillLight);

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

  // Real-time cloud data fetching
  useEffect(() => {
    const fetchCloudData = async () => {
      setLoadingWeather(true);
      try {
        const data = await weatherService.getGlobalCloudData();
        setCloudData(data);
        toast.success('Real-time weather data loaded');
      } catch (error) {
        console.error('Failed to fetch cloud data:', error);
        toast.error('Using simulated weather data');
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchCloudData();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchCloudData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Real-time High-Quality Clouds Layer with actual weather data
  useEffect(() => {
    if (!globeInstanceRef.current || !cloudData) return;

    const CLOUDS_ALT = 0.006;
    let cloudsLayer: THREE.Mesh | null = null;
    let cloudParticles: THREE.Points | null = null;

    if (layers.clouds) {
      // Create high-quality volumetric cloud layer
      const cloudGeometry = new THREE.SphereGeometry(
        globeInstanceRef.current.getGlobeRadius() * (1 + CLOUDS_ALT),
        128, // Higher resolution
        128
      );

      // Create canvas for dynamic cloud texture based on real-time data
      const canvas = document.createElement('canvas');
      canvas.width = 2048; // 4K-like quality
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;
      
      // Fill with base transparent color
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw clouds based on real-time weather data
      cloudData.clouds.forEach(cloud => {
        // Convert lat/lng to canvas coordinates
        const x = ((cloud.lng + 180) / 360) * canvas.width;
        const y = ((90 - cloud.lat) / 180) * canvas.height;
        
        // Cloud opacity based on coverage percentage
        const opacity = cloud.clouds / 100;
        const radius = 40 + (cloud.clouds / 100) * 20;
        
        // Create gradient for each cloud cluster
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.9})`);
        gradient.addColorStop(0.5, `rgba(240, 240, 255, ${opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(220, 220, 240, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Apply blur for soft, realistic clouds
      ctx.filter = 'blur(8px)';
      ctx.drawImage(canvas, 0, 0);
      
      const cloudTexture = new THREE.CanvasTexture(canvas);
      cloudTexture.needsUpdate = true;
      
      // HDR-quality cloud material with enhanced properties
      const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        shininess: 15,
        emissive: new THREE.Color(0x446688),
        emissiveIntensity: 0.15
      });

      cloudsLayer = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloudsLayer.name = 'clouds-layer-realtime';
      globeInstanceRef.current.scene().add(cloudsLayer);

      // Add particle clouds for extra depth (HDR effect)
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 2000;
      const positions = new Float32Array(particleCount * 3);
      const opacities = new Float32Array(particleCount);
      
      cloudData.clouds.forEach((cloud, i) => {
        if (i >= particleCount / 2) return;
        
        // Convert to 3D sphere coordinates
        const phi = (90 - cloud.lat) * (Math.PI / 180);
        const theta = (cloud.lng + 180) * (Math.PI / 180);
        const radius = globeInstanceRef.current.getGlobeRadius() * (1 + CLOUDS_ALT + 0.002);
        
        const idx = i * 3;
        positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
        positions[idx + 1] = radius * Math.cos(phi);
        positions[idx + 2] = radius * Math.sin(phi) * Math.sin(theta);
        
        opacities[i] = cloud.clouds / 150;
      });
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
      
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      cloudParticles = new THREE.Points(particleGeometry, particleMaterial);
      cloudParticles.name = 'cloud-particles';
      globeInstanceRef.current.scene().add(cloudParticles);

      // Smooth rotation animation
      let rotation = 0;
      (function rotateClouds() {
        if (cloudsLayer && cloudsLayer.parent) {
          rotation += 0.0001;
          cloudsLayer.rotation.y = rotation;
          if (cloudParticles) {
            cloudParticles.rotation.y = rotation * 0.8;
          }
          requestAnimationFrame(rotateClouds);
        }
      })();
    } else {
      // Remove clouds layer if it exists
      if (globeInstanceRef.current) {
        const existingClouds = globeInstanceRef.current.scene().getObjectByName('clouds-layer-realtime');
        if (existingClouds) {
          globeInstanceRef.current.scene().remove(existingClouds);
        }
        const existingParticles = globeInstanceRef.current.scene().getObjectByName('cloud-particles');
        if (existingParticles) {
          globeInstanceRef.current.scene().remove(existingParticles);
        }
      }
    }

    return () => {
      if (cloudsLayer && globeInstanceRef.current) {
        globeInstanceRef.current.scene().remove(cloudsLayer);
      }
      if (cloudParticles && globeInstanceRef.current) {
        globeInstanceRef.current.scene().remove(cloudParticles);
      }
    };
  }, [layers.clouds, cloudData]);

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
                <Label htmlFor="clouds" className="text-xs flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  Real-time Clouds
                </Label>
                <Switch
                  id="clouds"
                  checked={layers.clouds}
                  onCheckedChange={(checked) => setLayers(prev => ({ ...prev, clouds: checked }))}
                />
              </div>
              {layers.clouds && (
                <div className="pl-6 space-y-1">
                  <Button
                    onClick={async () => {
                      setLoadingWeather(true);
                      try {
                        const data = await weatherService.getGlobalCloudData();
                        setCloudData(data);
                        toast.success('Weather data refreshed');
                      } catch (error) {
                        toast.error('Failed to refresh weather');
                      } finally {
                        setLoadingWeather(false);
                      }
                    }}
                    size="sm"
                    variant="ghost"
                    className="w-full text-xs"
                    disabled={loadingWeather}
                  >
                    <CloudRain className="w-3 h-3 mr-1" />
                    {loadingWeather ? 'Updating...' : 'Refresh Weather'}
                  </Button>
                  {cloudData && (
                    <p className="text-[10px] text-muted-foreground">
                      Last updated: {new Date(cloudData.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )}
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