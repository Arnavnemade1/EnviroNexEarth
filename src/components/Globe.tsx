import { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere } from '@react-three/drei';
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

// Simple Earth - Just works!
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Earth sphere - blue-green gradient */}
      <Sphere ref={earthRef} args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#0ea5e9"
          metalness={0.2}
          roughness={0.7}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[2.1, 32, 32]}>
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
}

// City lights
function CityLights() {
  const cities = useMemo(() => [
    { lat: 40.7128, lng: -74.0060, name: 'New York' },
    { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
    { lat: 51.5074, lng: -0.1278, name: 'London' },
    { lat: 48.8566, lng: 2.3522, name: 'Paris' },
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
    { lat: 31.2304, lng: 121.4737, name: 'Shanghai' },
    { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
  ], []);

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
    const radius = 2 + (altitude / 6371);
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
      <Suspense fallback={<div className="flex items-center justify-center h-full text-white">Loading Globe...</div>}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 3, 5]} intensity={1.5} />

          {/* Starfield */}
          <Stars radius={300} depth={60} count={15000} factor={5} saturation={0} fade speed={1} />

          {/* Earth */}
          <Earth />

          {/* City lights */}
          <CityLights />

          {/* Satellites */}
          {showSatellites && <Satellites />}

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            minDistance={3}
            maxDistance={10}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </Suspense>

      {/* Credit */}
      <div className="absolute bottom-4 right-4 text-xs text-white/60">
        Professional 3D Globe • React Three Fiber
      </div>
    </div>
  );
};

export default GlobeComponent;