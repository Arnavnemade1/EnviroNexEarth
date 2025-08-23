import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';
import { interpolateRdYlBu } from 'd3-scale-chromatic';
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
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);

  // Generate satellite data
  useEffect(() => {
    const generateSatellites = () => {
      const sats: SatelliteData[] = [];
      const names = ['ISS', 'Hubble', 'Landsat-8', 'TERRA', 'AQUA', 'SUOMI-NPP'];
      
      names.forEach((name, i) => {
        sats.push({
          id: `sat-${i}`,
          name,
          lat: (Math.random() - 0.5) * 180,
          lng: (Math.random() - 0.5) * 360,
          altitude: 400 + Math.random() * 400,
          velocity: 7.5 + Math.random() * 2
        });
      });
      
      setSatellites(sats);
    };

    generateSatellites();
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;

    // Initialize Globe
    const globe = new Globe(globeRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(window.innerWidth)
      .height(window.innerHeight)
      .atmosphereColor('#4fa8d8')
      .atmosphereAltitude(0.15)
      .enablePointerInteraction(true);

    // Configure camera
    globe.camera().position.z = 300;
    
    // Auto-rotate
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.1;

    // Click handler for cities
    globe.onGlobeClick((coords: { lat: number; lng: number }) => {
      if (onCityClick) {
        onCityClick(coords.lat, coords.lng);
      }
    });

    globeInstanceRef.current = globe;

    // Cleanup
    return () => {
      if (globeInstanceRef.current) {
        globeInstanceRef.current._destructor();
      }
    };
  }, [onCityClick]);

  // Update pollution data
  useEffect(() => {
    if (!globeInstanceRef.current || !pollutionData.length) return;

    globeInstanceRef.current
      .hexBinPointsData(pollutionData)
      .hexBinPointLat((d: any) => d.lat)
      .hexBinPointLng((d: any) => d.lng)
      .hexBinPointWeight((d: any) => d.value)
      .hexTopColor((d: any) => interpolateRdYlBu(1 - d.sumWeight / d.points.length))
      .hexSideColor((d: any) => interpolateRdYlBu(1 - d.sumWeight / d.points.length))
      .hexBinResolution(4)
      .hexMargin(0.1);
  }, [pollutionData]);

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

  // Animate satellites
  useEffect(() => {
    if (!globeInstanceRef.current || !showSatellites || !satellites.length) return;

    const animateSatellites = () => {
      const updatedSatellites = satellites.map(sat => ({
        ...sat,
        lng: (sat.lng + sat.velocity * 0.01) % 360
      }));
      setSatellites(updatedSatellites);
    };

    const interval = setInterval(animateSatellites, 100);
    
    globeInstanceRef.current
      .objectsData(satellites)
      .objectLat((d: any) => d.lat)
      .objectLng((d: any) => d.lng)
      .objectAltitude((d: any) => d.altitude / 1000)
      .objectThreeObject(() => {
        // Create satellite mesh
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 2);
        const material = new THREE.MeshLambertMaterial({ color: '#4fa8d8' });
        const satellite = new THREE.Mesh(geometry, material);
        
        // Add solar panels
        const panelGeometry = new THREE.PlaneGeometry(3, 1);
        const panelMaterial = new THREE.MeshLambertMaterial({ 
          color: '#1a1a2e',
          transparent: true,
          opacity: 0.8
        });
        
        const panel1 = new THREE.Mesh(panelGeometry, panelMaterial);
        const panel2 = new THREE.Mesh(panelGeometry, panelMaterial);
        
        panel1.position.set(-2, 0, 0);
        panel2.position.set(2, 0, 0);
        
        const satelliteGroup = new THREE.Group();
        satelliteGroup.add(satellite);
        satelliteGroup.add(panel1);
        satelliteGroup.add(panel2);
        
        return satelliteGroup;
      });

    return () => clearInterval(interval);
  }, [satellites, showSatellites]);

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
      
      {/* Gradient overlay for atmospheric effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/10" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GlobeComponent;