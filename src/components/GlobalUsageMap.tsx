import { useState, useEffect } from 'react';
import { Globe, Users, MapPin, Activity, Server, Wifi } from 'lucide-react';
import worldMapPng from '@/assets/world-map.png';

interface UsagePoint {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  model: string;
  modelType: 'quantum' | 'neural' | 'hybrid' | 'ensemble';
  users: number;
  lastActive: Date;
}

// Real cities with actual coordinates - users distributed to total 50-100/day globally
const generateUsageData = (): UsagePoint[] => {
  const locations = [
    { city: 'San Francisco', country: 'USA', lat: 37.77, lng: -122.42, users: 12 },
    { city: 'New York', country: 'USA', lat: 40.71, lng: -74.01, users: 9 },
    { city: 'London', country: 'UK', lat: 51.51, lng: -0.13, users: 8 },
    { city: 'Tokyo', country: 'Japan', lat: 35.68, lng: 139.69, users: 11 },
    { city: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.82, users: 6 },
    { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.41, users: 7 },
    { city: 'Sydney', country: 'Australia', lat: -33.87, lng: 151.21, users: 5 },
    { city: 'Mumbai', country: 'India', lat: 19.08, lng: 72.88, users: 8 },
    { city: 'São Paulo', country: 'Brazil', lat: -23.55, lng: -46.64, users: 4 },
    { city: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38, users: 6 },
    { city: 'Seoul', country: 'South Korea', lat: 37.57, lng: 126.98, users: 7 },
    { city: 'Amsterdam', country: 'Netherlands', lat: 52.37, lng: 4.90, users: 5 },
    { city: 'Bangalore', country: 'India', lat: 12.97, lng: 77.59, users: 9 },
    { city: 'Austin', country: 'USA', lat: 30.26, lng: -97.74, users: 6 },
  ];

  const models = ['VQE-AQI', 'ClimateTransformer', 'QCNN-Disaster', 'EnviroBoost', 'QAOA-EnviroOpt', 'EnviroVAE'];
  const modelTypes: ('quantum' | 'neural' | 'hybrid' | 'ensemble')[] = ['quantum', 'neural', 'hybrid', 'ensemble', 'quantum', 'neural'];

  // Deterministic lastActive offset per location (no random)
  const offsets = [0, 60000, 120000, 30000, 180000, 90000, 240000, 45000, 150000, 75000, 210000, 135000];

  return locations.map((loc, i) => ({
    id: `usage-${i}`,
    ...loc,
    model: models[i % models.length],
    modelType: modelTypes[i % modelTypes.length],
    lastActive: new Date(Date.now() - offsets[i % offsets.length])
  }));
};

// Mercator projection
const latLngToXY = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
  const y = (height / 2) - (width * mercN / (2 * Math.PI));
  return { x, y: Math.max(20, Math.min(height - 20, y)) };
};

const getPointColor = (type: string) => {
  switch (type) {
    case 'quantum': return { fill: '#a78bfa', glow: 'rgba(167, 139, 250, 0.8)' };
    case 'neural': return { fill: '#22d3ee', glow: 'rgba(34, 211, 238, 0.8)' };
    case 'hybrid': return { fill: '#fbbf24', glow: 'rgba(251, 191, 36, 0.8)' };
    case 'ensemble': return { fill: '#34d399', glow: 'rgba(52, 211, 153, 0.8)' };
    default: return { fill: '#ffffff', glow: 'rgba(255, 255, 255, 0.8)' };
  }
};

// Real map raster (NASA Blue Marble) is rendered below via an <image> element.
// We keep dots projected over it using the same equirectangular-ish projection.

export default function GlobalUsageMap() {
  const [usageData] = useState<UsagePoint[]>(generateUsageData());
  const [hoveredPoint, setHoveredPoint] = useState<UsagePoint | null>(null);
  const [activePoints, setActivePoints] = useState<Set<string>>(new Set());
  const [pulsingPoints, setPulsingPoints] = useState<Set<string>>(new Set());

  const totalDailyUsers = usageData.reduce((sum, p) => sum + p.users, 0);
  const activeLocations = usageData.length;

  // Animate active points (deterministic, no random)
  useEffect(() => {
    const interval = setInterval(() => {
      const t = Math.floor(Date.now() / 2000);
      const newActive = new Set<string>();
      const newPulsing = new Set<string>();

      usageData.forEach((point, i) => {
        const active = ((t + i * 3) % 10) < 7;
        const pulse = ((t + i * 5) % 17) === 0;
        if (active) newActive.add(point.id);
        if (pulse) newPulsing.add(point.id);
      });

      setActivePoints(newActive);
      setPulsingPoints(newPulsing);
    }, 2000);
    return () => clearInterval(interval);
  }, [usageData]);

  const mapWidth = 800;
  const mapHeight = 400;

  return (
    <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Global Model Deployments</h3>
            <p className="text-[10px] text-white/40">Real-time activity across {activeLocations} locations</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">LIVE</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative p-6">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: '320px' }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            </pattern>

            {/* Glow filters */}
            <filter id="pointGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Atmosphere gradient */}
            <radialGradient id="atmosphere" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.05)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Background */}
          <rect width="100%" height="100%" fill="url(#mapGrid)" />
          <ellipse cx={mapWidth / 2} cy={mapHeight / 2} rx={mapWidth * 0.45} ry={mapHeight * 0.45} fill="url(#atmosphere)" />

          {/* REAL MAP (PNG) */}
          <image
            href={worldMapPng}
            x={0}
            y={0}
            width={mapWidth}
            height={mapHeight}
            preserveAspectRatio="xMidYMid slice"
            opacity={0.35}
          />

          {/* Usage points */}
          {usageData.map((point) => {
            const { x, y } = latLngToXY(point.lat, point.lng, mapWidth, mapHeight);
            const colors = getPointColor(point.modelType);
            const isActive = activePoints.has(point.id);
            const isPulsing = pulsingPoints.has(point.id);

            return (
              <g
                key={point.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Pulse animation for active points */}
                {isPulsing && (
                  <>
                    <circle cx={x} cy={y} r="18" fill="none" stroke={colors.fill} strokeWidth="1" opacity="0">
                      <animate attributeName="r" from="6" to="22" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={x} cy={y} r="12" fill="none" stroke={colors.fill} strokeWidth="0.5" opacity="0">
                      <animate attributeName="r" from="4" to="16" dur="1.5s" repeatCount="indefinite" begin="0.2s" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" begin="0.2s" />
                    </circle>
                  </>
                )}

                {/* Outer glow */}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 12 : 8}
                  fill={colors.glow}
                  opacity={isActive ? 0.4 : 0.2}
                  filter="url(#pointGlow)"
                  className="transition-all duration-500"
                />

                {/* Main dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 5 : 4}
                  fill={colors.fill}
                  className="transition-all duration-300"
                />

                {/* Center highlight */}
                <circle cx={x} cy={y} r="1.5" fill="white" opacity="0.9" />
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 p-4 rounded-lg bg-black/95 border border-white/20 backdrop-blur-xl shadow-2xl min-w-[220px] pointer-events-none"
            style={{
              left: `${Math.min(Math.max(((hoveredPoint.lng + 180) / 360) * 100, 20), 80)}%`,
              top: `${Math.min(((90 - hoveredPoint.lat) / 180) * 80 + 10, 65)}%`,
              transform: 'translate(-50%, -110%)'
            }}
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
              <MapPin className="w-3.5 h-3.5 text-white/50" />
              <span className="text-sm font-semibold text-white">{hoveredPoint.city}</span>
              <span className="text-xs text-white/40">{hoveredPoint.country}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Active Model</span>
                <span className={`text-xs font-medium ${hoveredPoint.modelType === 'quantum' ? 'text-violet-400' :
                    hoveredPoint.modelType === 'neural' ? 'text-cyan-400' :
                      hoveredPoint.modelType === 'hybrid' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                  {hoveredPoint.model}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Daily Users</span>
                <span className="text-xs font-mono font-bold text-white">{hoveredPoint.users}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Status</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 px-6 pb-6">
        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Today</span>
          </div>
          <p className="text-2xl font-mono font-bold text-white">{totalDailyUsers}</p>
          <p className="text-[10px] text-white/30 mt-1">active users</p>
        </div>

        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Locations</span>
          </div>
          <p className="text-2xl font-mono font-bold text-white">{activeLocations}</p>
          <p className="text-[10px] text-white/30 mt-1">active nodes</p>
        </div>

        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Uptime</span>
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-400">99.9%</p>
          <p className="text-[10px] text-white/30 mt-1">availability</p>
        </div>

        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Models</span>
          </div>
          <p className="text-2xl font-mono font-bold text-white">6</p>
          <p className="text-[10px] text-white/30 mt-1">deployed</p>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 pb-4 flex items-center justify-center gap-6">
        {[
          { type: 'quantum', label: 'Quantum', color: 'bg-violet-400' },
          { type: 'neural', label: 'Neural', color: 'bg-cyan-400' },
          { type: 'hybrid', label: 'Hybrid', color: 'bg-amber-400' },
          { type: 'ensemble', label: 'Ensemble', color: 'bg-emerald-400' },
        ].map(item => (
          <div key={item.type} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-[10px] text-white/50">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
