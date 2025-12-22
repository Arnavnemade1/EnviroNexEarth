import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { SatelliteData } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface GlobeComponentProps {
  onCityClick?: (lat: number, lng: number) => void;
  selectedCity?: { lat: number; lng: number } | null;
  pollutionData?: Array<{ lat: number; lng: number; value: number; color: string }>;
  showSatellites?: boolean;
}

// Earth sphere with NASA Blue Marble texture
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);

  // Load NASA Blue Marble 8K texture
  const [earthMap, bumpMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
    'https://unpkg.com/three-globe/example/img/earth-water.png',
    'https://unpkg.com/three-globe/example/img/fair-clouds.png'
  ]);

  // Slow rotation
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group>
      {/* Main Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          specularMap={specularMap}
          specular={new THREE.Color('grey')}
          shininess={10}
        />
      </mesh>

      {/* Clouds layer */}
      <mesh>
        <sphereGeometry args={[2.01, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// City lights as point markers
function CityLights() {
  const cities = useMemo(() => [
    { lat: 40.7128, lng: -74.0060, name: 'New York' },
    { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
    { lat: 51.5074, lng: -0.1278, name: 'London' },
    { lat: 48.8566, lng: 2.3522, name: 'Paris' },
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
    { lat: 31.2304, lng: 121.4737, name: 'Shanghai' },
    { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
    { lat: 19.4326, lng: -99.1332, name: 'Mexico City' },
    { lat: -23.5505, lng: -46.6333, name: 'São Paulo' },
    { lat: 30.0444, lng: 31.2357, name: 'Cairo' },
  ], []);

  // Convert lat/lng to 3D coordinates
  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  };

  return (
    <group>
      {cities.map((city, i) => {
        const position = latLngToVector3(city.lat, city.lng, 2.02);
        return (
          <mesh key={i} position={position}>
            <sphereGeometry args={[0.01, 16, 16]} />
            <meshBasicMaterial color="#ffeb3b" />
          </mesh>
        );
      })}
    </group>
  );
}

// Animated satellites
function Satellites() {
  const [satellites, setSatellites] = useState<SatelliteData[]>([
    {
      id: 'iss',
      name: 'ISS',
      lat: 51.6461,
      lng: 0.0,
      altitude: 408,
      velocity: 7.66,
      description: 'International Space Station'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSatellites(prev => prev.map(sat => ({
        ...sat,
        lng: (sat.lng + sat.velocity * 0.01) % 360
      })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const latLngToVector3 = (lat: number, lng: number, altitude: number) => {
    const radius = 2 + (altitude / 6371); // Earth radius = 6371 km
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  };

  return (
    <group>
      {satellites.map((sat) => {
        const position = latLngToVector3(sat.lat, sat.lng, sat.altitude);
        return (
          <mesh key={sat.id} position={position}>
            <sphereGeometry args={[0.015, 16, 16]} />
            <meshBasicMaterial color="#ff6600" />
          </mesh>
        );
      })}
    </group>
  );
}

export const GlobeComponent = ({
  onCityClick,
  selectedCity,
  pollutionData = [],
  showSatellites = true
}: GlobeComponentProps) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1} />

        {/* Starfield background */}
        <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />

        {/* Earth */}
        <Earth />

        {/* City lights */}
        <CityLights />

        {/* Satellites */}
        {showSatellites && <Satellites />}

        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* NASA Credit */}
      <div className="absolute bottom-4 right-4 text-xs text-white/60">
        NASA Blue Marble • React Three Fiber
      </div>
    </div>
  );
};

export default GlobeComponent;