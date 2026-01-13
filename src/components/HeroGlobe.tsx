import { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[2.5, 128, 128]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#0ea5e9"
          attach="material"
          distort={0.15}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* Inner glow sphere */}
      <Sphere args={[2.3, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[2.8, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
};

const Clouds = () => {
  // Use live cloud data from Matt Eason's service (updated every 3 hours)
  const cloudTexture = useLoader(THREE.TextureLoader, 'https://clouds.matteason.co.uk/images/4096x2048/clouds.jpg');
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005; // Realistic drift speed
      // meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05; // Remove tilt for more realistic orbital feel
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.55, 64, 64]} /> {/* Slightly larger than main sphere */}
      <meshStandardMaterial
        map={cloudTexture}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const OrbitRing = ({ radius, speed, color, opacity }: { radius: number; speed: number; color: string; opacity: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });

  // Generate circle points
  const points: [number, number, number][] = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
  }

  return (
    <group ref={groupRef} rotation={[Math.PI / 2.5, 0.2, 0]}>
      <Line points={points} color={color} lineWidth={1} transparent opacity={opacity} />
    </group>
  );
};

const OrbitingParticle = ({ radius, speed, size, color, offsetAngle = 0 }: { radius: number; speed: number; size: number; color: string; offsetAngle?: number }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed + offsetAngle;
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#10b981" />

      <Stars radius={100} depth={50} count={500} factor={1.5} saturation={0} fade speed={0.5} />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <AnimatedSphere />
        <Clouds />
      </Float>

      {/* Orbit rings */}
      <OrbitRing radius={3.5} speed={0.15} color="#0ea5e9" opacity={0.4} />
      <OrbitRing radius={4.5} speed={-0.1} color="#22d3ee" opacity={0.25} />
      <OrbitRing radius={5.5} speed={0.08} color="#10b981" opacity={0.15} />

      {/* Orbiting particles */}
      <OrbitingParticle radius={3.5} speed={0.4} size={0.1} color="#0ea5e9" />
      <OrbitingParticle radius={3.5} speed={0.4} size={0.06} color="#22d3ee" offsetAngle={Math.PI} />
      <OrbitingParticle radius={4.5} speed={-0.25} size={0.08} color="#22d3ee" />
      <OrbitingParticle radius={5.5} speed={0.15} size={0.06} color="#10b981" />
    </>
  );
};

export const HeroGlobe = () => {
  return (
    <div className="absolute inset-0 opacity-90">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroGlobe;
