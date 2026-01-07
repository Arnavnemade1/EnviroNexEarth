import { useState, useEffect } from 'react';
import { Globe, Users, Zap, MapPin } from 'lucide-react';

interface UsagePoint {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  model: string;
  modelType: 'quantum' | 'neural' | 'hybrid' | 'ensemble';
  count: number;
  lastActive: Date;
}

// Generate realistic global usage data
const generateUsageData = (): UsagePoint[] => {
  const cities = [
    { city: 'San Francisco', country: 'USA', lat: 37.77, lng: -122.42 },
    { city: 'New York', country: 'USA', lat: 40.71, lng: -74.01 },
    { city: 'London', country: 'UK', lat: 51.51, lng: -0.13 },
    { city: 'Tokyo', country: 'Japan', lat: 35.68, lng: 139.69 },
    { city: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.82 },
    { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.41 },
    { city: 'Sydney', country: 'Australia', lat: -33.87, lng: 151.21 },
    { city: 'Mumbai', country: 'India', lat: 19.08, lng: 72.88 },
    { city: 'São Paulo', country: 'Brazil', lat: -23.55, lng: -46.64 },
    { city: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38 },
    { city: 'Paris', country: 'France', lat: 48.86, lng: 2.35 },
    { city: 'Seoul', country: 'South Korea', lat: 37.57, lng: 126.98 },
    { city: 'Dubai', country: 'UAE', lat: 25.20, lng: 55.27 },
    { city: 'Hong Kong', country: 'China', lat: 22.32, lng: 114.17 },
    { city: 'Stockholm', country: 'Sweden', lat: 59.33, lng: 18.07 },
    { city: 'Amsterdam', country: 'Netherlands', lat: 52.37, lng: 4.90 },
    { city: 'Zurich', country: 'Switzerland', lat: 47.37, lng: 8.54 },
    { city: 'Tel Aviv', country: 'Israel', lat: 32.09, lng: 34.78 },
    { city: 'Beijing', country: 'China', lat: 39.90, lng: 116.41 },
    { city: 'Melbourne', country: 'Australia', lat: -37.81, lng: 144.96 },
    { city: 'Chicago', country: 'USA', lat: 41.88, lng: -87.63 },
    { city: 'Los Angeles', country: 'USA', lat: 34.05, lng: -118.24 },
    { city: 'Boston', country: 'USA', lat: 42.36, lng: -71.06 },
    { city: 'Seattle', country: 'USA', lat: 47.61, lng: -122.33 },
  ];

  const models = ['VQE-AQI Predictor', 'ClimateTransformer', 'QCNN-Disaster', 'EnviroBoost Ensemble', 'QAOA-EnviroOpt', 'EnviroVAE-Anomaly'];
  const modelTypes: ('quantum' | 'neural' | 'hybrid' | 'ensemble')[] = ['quantum', 'neural', 'hybrid', 'ensemble', 'quantum', 'neural'];

  return cities.map((city, i) => ({
    id: `usage-${i}`,
    ...city,
    model: models[i % models.length],
    modelType: modelTypes[i % modelTypes.length],
    count: Math.floor(Math.random() * 5000) + 100,
    lastActive: new Date(Date.now() - Math.random() * 3600000)
  }));
};

// Convert lat/lng to map position (simple equirectangular projection)
const latLngToXY = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

export default function GlobalUsageMap() {
  const [usageData, setUsageData] = useState<UsagePoint[]>(generateUsageData());
  const [hoveredPoint, setHoveredPoint] = useState<UsagePoint | null>(null);
  const [activePoints, setActivePoints] = useState<Set<string>>(new Set());
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeNow, setActiveNow] = useState(0);

  // Animate active points
  useEffect(() => {
    const interval = setInterval(() => {
      const newActive = new Set<string>();
      usageData.forEach(point => {
        if (Math.random() > 0.6) {
          newActive.add(point.id);
        }
      });
      setActivePoints(newActive);
    }, 1500);
    return () => clearInterval(interval);
  }, [usageData]);

  // Update live stats
  useEffect(() => {
    setTotalUsers(usageData.reduce((sum, p) => sum + p.count, 0));
    setActiveNow(Math.floor(Math.random() * 500) + 200);
    
    const interval = setInterval(() => {
      setActiveNow(Math.floor(Math.random() * 500) + 200);
    }, 3000);
    return () => clearInterval(interval);
  }, [usageData]);

  const mapWidth = 800;
  const mapHeight = 400;

  const getPointColor = (type: string) => {
    switch (type) {
      case 'quantum': return { fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' };
      case 'neural': return { fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' };
      case 'hybrid': return { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' };
      case 'ensemble': return { fill: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' };
      default: return { fill: '#ffffff', glow: 'rgba(255, 255, 255, 0.5)' };
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Global Model Usage</h3>
            <p className="text-[10px] text-white/40">Real-time deployment activity</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-white/40">Total Users</p>
            <p className="text-lg font-mono font-bold text-cyan-400">{totalUsers.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-white/40">Active Now</p>
            </div>
            <p className="text-lg font-mono font-bold text-emerald-400">{activeNow}</p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative p-4">
        <svg 
          viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
          className="w-full h-auto"
          style={{ maxHeight: '320px' }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            </pattern>
            {/* Glow filters */}
            {['quantum', 'neural', 'hybrid', 'ensemble'].map(type => (
              <filter key={type} id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            ))}
          </defs>
          
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* World map outline (simplified continents) */}
          <g opacity="0.08" fill="white">
            {/* North America */}
            <ellipse cx="180" cy="130" rx="100" ry="70" />
            {/* South America */}
            <ellipse cx="220" cy="280" rx="50" ry="80" />
            {/* Europe */}
            <ellipse cx="420" cy="110" rx="60" ry="40" />
            {/* Africa */}
            <ellipse cx="430" cy="220" rx="50" ry="70" />
            {/* Asia */}
            <ellipse cx="580" cy="130" rx="120" ry="80" />
            {/* Australia */}
            <ellipse cx="680" cy="300" rx="50" ry="40" />
          </g>

          {/* Connection lines between points */}
          <g opacity="0.1">
            {usageData.slice(0, 12).map((point, i) => {
              const pos1 = latLngToXY(point.lat, point.lng, mapWidth, mapHeight);
              const nextPoint = usageData[(i + 1) % usageData.length];
              const pos2 = latLngToXY(nextPoint.lat, nextPoint.lng, mapWidth, mapHeight);
              return (
                <line
                  key={`line-${i}`}
                  x1={pos1.x}
                  y1={pos1.y}
                  x2={pos2.x}
                  y2={pos2.y}
                  stroke="white"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              );
            })}
          </g>

          {/* Usage points */}
          {usageData.map((point) => {
            const { x, y } = latLngToXY(point.lat, point.lng, mapWidth, mapHeight);
            const colors = getPointColor(point.modelType);
            const isActive = activePoints.has(point.id);
            const size = Math.min(8, 3 + (point.count / 2000));
            
            return (
              <g 
                key={point.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Pulse ring for active points */}
                {isActive && (
                  <circle
                    r={size + 8}
                    fill="none"
                    stroke={colors.fill}
                    strokeWidth="1"
                    opacity="0.4"
                    className="animate-ping"
                  />
                )}
                
                {/* Outer glow */}
                <circle
                  r={size + 4}
                  fill={colors.glow}
                  opacity={isActive ? 0.6 : 0.3}
                  filter={`url(#glow-${point.modelType})`}
                />
                
                {/* Main point */}
                <circle
                  r={size}
                  fill={colors.fill}
                  className="transition-all duration-300"
                  style={{ transform: isActive ? 'scale(1.2)' : 'scale(1)' }}
                />
                
                {/* Inner highlight */}
                <circle
                  r={size * 0.4}
                  fill="white"
                  opacity="0.6"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute z-10 p-3 rounded-lg bg-black/90 border border-white/10 backdrop-blur-xl shadow-xl min-w-[180px]"
            style={{
              left: `${((hoveredPoint.lng + 180) / 360) * 100}%`,
              top: `${((90 - hoveredPoint.lat) / 180) * 100}%`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3 h-3 text-white/50" />
              <span className="text-xs font-medium text-white">{hoveredPoint.city}, {hoveredPoint.country}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Model</span>
                <span className={`text-[10px] font-medium ${
                  hoveredPoint.modelType === 'quantum' ? 'text-violet-400' :
                  hoveredPoint.modelType === 'neural' ? 'text-cyan-400' :
                  hoveredPoint.modelType === 'hybrid' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {hoveredPoint.model.split(' ')[0]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Users</span>
                <span className="text-[10px] font-mono text-white">{hoveredPoint.count.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Last Active</span>
                <span className="text-[10px] text-emerald-400">
                  {Math.floor((Date.now() - hoveredPoint.lastActive.getTime()) / 60000)}m ago
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 p-3 border-t border-white/[0.06]">
        {[
          { type: 'quantum', label: 'Quantum' },
          { type: 'neural', label: 'Neural' },
          { type: 'hybrid', label: 'Hybrid' },
          { type: 'ensemble', label: 'Ensemble' },
        ].map(({ type, label }) => {
          const colors = getPointColor(type);
          return (
            <div key={type} className="flex items-center gap-1.5">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: colors.fill }}
              />
              <span className="text-[10px] text-white/50">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
