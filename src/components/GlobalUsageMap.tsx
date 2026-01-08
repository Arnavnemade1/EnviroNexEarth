import { useState, useEffect } from 'react';
import { Globe, Users, Zap, MapPin, Activity, Server, Wifi } from 'lucide-react';

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
  ];

  const models = ['VQE-AQI', 'ClimateTransformer', 'QCNN-Disaster', 'EnviroBoost', 'QAOA-EnviroOpt', 'EnviroVAE'];
  const modelTypes: ('quantum' | 'neural' | 'hybrid' | 'ensemble')[] = ['quantum', 'neural', 'hybrid', 'ensemble', 'quantum', 'neural'];

  return locations.map((loc, i) => ({
    id: `usage-${i}`,
    ...loc,
    model: models[i % models.length],
    modelType: modelTypes[i % modelTypes.length],
    lastActive: new Date(Date.now() - Math.floor(Math.random() * 300000))
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

// Accurate world continents SVG path data (mercator projection, viewBox 0 0 800 400)
const WorldMapSVG = () => (
  <g className="world-continents" opacity="0.2">
    {/* North America */}
    <path d="M55,85 L65,75 L85,72 L110,68 L135,70 L155,78 L168,88 L172,105 L168,125 L160,140 L148,150 L135,155 L118,152 L102,145 L88,135 L75,122 L62,105 L55,95Z M175,130 L185,135 L190,150 L185,165 L175,175 L165,172 L160,160 L162,145 L168,135Z" fill="white" />
    {/* South America */}
    <path d="M165,175 L175,170 L188,175 L198,190 L205,215 L202,250 L192,285 L175,315 L158,325 L145,318 L138,295 L135,260 L138,225 L145,195 L155,180Z" fill="white" />
    {/* Europe */}
    <path d="M355,52 L378,48 L398,52 L415,58 L425,68 L428,82 L420,95 L405,100 L388,98 L372,95 L358,88 L352,75 L352,62Z M345,72 L352,68 L358,75 L355,85 L345,82Z" fill="white" />
    {/* Africa */}
    <path d="M365,105 L395,102 L425,115 L445,138 L455,175 L450,220 L435,265 L405,295 L370,305 L340,295 L322,258 L318,215 L325,168 L342,130 L358,112Z" fill="white" />
    {/* Asia */}
    <path d="M420,45 L475,40 L535,48 L585,62 L620,88 L635,125 L628,165 L605,195 L565,215 L520,225 L475,218 L438,198 L418,168 L408,132 L410,95 L415,65Z M640,145 L655,140 L668,150 L665,168 L652,178 L638,172 L635,158Z" fill="white" />
    {/* Southeast Asia Islands */}
    <path d="M565,218 L595,215 L625,228 L638,248 L628,268 L598,275 L568,265 L558,245 L562,228Z M635,248 L658,245 L678,258 L675,278 L655,288 L635,282 L628,265Z" fill="white" />
    {/* Australia */}
    <path d="M598,298 L645,292 L685,308 L705,338 L698,372 L665,395 L618,398 L578,382 L565,348 L572,318Z" fill="white" />
    {/* Japan */}
    <path d="M655,95 L668,88 L678,98 L675,115 L662,122 L652,115 L652,102Z" fill="white" />
    {/* UK */}
    <path d="M345,58 L355,52 L362,58 L358,72 L348,75 L342,68Z" fill="white" />
    {/* Indonesia */}
    <path d="M575,252 L605,248 L632,262 L618,282 L588,288 L565,275Z" fill="white" />
  </g>
);

export default function GlobalUsageMap() {
  const [usageData] = useState<UsagePoint[]>(generateUsageData());
  const [hoveredPoint, setHoveredPoint] = useState<UsagePoint | null>(null);
  const [activePoints, setActivePoints] = useState<Set<string>>(new Set());
  const [pulsingPoints, setPulsingPoints] = useState<Set<string>>(new Set());

  const totalDailyUsers = usageData.reduce((sum, p) => sum + p.users, 0);
  const activeLocations = usageData.length;

  // Animate active points
  useEffect(() => {
    const interval = setInterval(() => {
      const newActive = new Set<string>();
      const newPulsing = new Set<string>();
      usageData.forEach(point => {
        if (Math.random() > 0.3) newActive.add(point.id);
        if (Math.random() > 0.8) newPulsing.add(point.id);
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
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
            </pattern>
            
            {/* Glow filters */}
            <filter id="pointGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
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
          <ellipse cx={mapWidth/2} cy={mapHeight/2} rx={mapWidth*0.45} ry={mapHeight*0.45} fill="url(#atmosphere)" />
          
          {/* World Map */}
          <WorldMapSVG />

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
                <span className={`text-xs font-medium ${
                  hoveredPoint.modelType === 'quantum' ? 'text-violet-400' :
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
