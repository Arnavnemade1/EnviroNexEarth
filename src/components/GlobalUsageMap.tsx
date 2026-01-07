import { useState, useEffect } from 'react';
import { Globe, Users, Zap, MapPin, TrendingUp, Activity, Clock, BarChart3 } from 'lucide-react';

interface UsagePoint {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  model: string;
  modelType: 'quantum' | 'neural' | 'hybrid' | 'ensemble';
  dailyUsers: number;
  totalUsers: number;
  lastActive: Date;
}

// Real cities with actual coordinates and realistic daily usage (50-100 users per location)
const generateUsageData = (): UsagePoint[] => {
  const locations = [
    { city: 'San Francisco', country: 'USA', lat: 37.77, lng: -122.42, dailyUsers: 89, totalUsers: 2341 },
    { city: 'New York', country: 'USA', lat: 40.71, lng: -74.01, dailyUsers: 76, totalUsers: 1987 },
    { city: 'London', country: 'UK', lat: 51.51, lng: -0.13, dailyUsers: 67, totalUsers: 1654 },
    { city: 'Tokyo', country: 'Japan', lat: 35.68, lng: 139.69, dailyUsers: 94, totalUsers: 2156 },
    { city: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.82, dailyUsers: 58, totalUsers: 1432 },
    { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.41, dailyUsers: 72, totalUsers: 1567 },
    { city: 'Sydney', country: 'Australia', lat: -33.87, lng: 151.21, dailyUsers: 61, totalUsers: 1234 },
    { city: 'Mumbai', country: 'India', lat: 19.08, lng: 72.88, dailyUsers: 83, totalUsers: 1876 },
    { city: 'São Paulo', country: 'Brazil', lat: -23.55, lng: -46.64, dailyUsers: 54, totalUsers: 1123 },
    { city: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38, dailyUsers: 68, totalUsers: 1445 },
    { city: 'Paris', country: 'France', lat: 48.86, lng: 2.35, dailyUsers: 71, totalUsers: 1534 },
    { city: 'Seoul', country: 'South Korea', lat: 37.57, lng: 126.98, dailyUsers: 87, totalUsers: 1987 },
    { city: 'Dubai', country: 'UAE', lat: 25.20, lng: 55.27, dailyUsers: 52, totalUsers: 987 },
    { city: 'Amsterdam', country: 'Netherlands', lat: 52.37, lng: 4.90, dailyUsers: 63, totalUsers: 1234 },
    { city: 'Zurich', country: 'Switzerland', lat: 47.37, lng: 8.54, dailyUsers: 79, totalUsers: 1654 },
    { city: 'Tel Aviv', country: 'Israel', lat: 32.09, lng: 34.78, dailyUsers: 66, totalUsers: 1345 },
    { city: 'Beijing', country: 'China', lat: 39.90, lng: 116.41, dailyUsers: 91, totalUsers: 2234 },
    { city: 'Melbourne', country: 'Australia', lat: -37.81, lng: 144.96, dailyUsers: 57, totalUsers: 1123 },
    { city: 'Boston', country: 'USA', lat: 42.36, lng: -71.06, dailyUsers: 74, totalUsers: 1567 },
    { city: 'Seattle', country: 'USA', lat: 47.61, lng: -122.33, dailyUsers: 81, totalUsers: 1765 },
    { city: 'Stockholm', country: 'Sweden', lat: 59.33, lng: 18.07, dailyUsers: 59, totalUsers: 1234 },
    { city: 'Hong Kong', country: 'China', lat: 22.32, lng: 114.17, dailyUsers: 85, totalUsers: 1876 },
    { city: 'Bangalore', country: 'India', lat: 12.97, lng: 77.59, dailyUsers: 92, totalUsers: 2123 },
    { city: 'Austin', country: 'USA', lat: 30.27, lng: -97.74, dailyUsers: 77, totalUsers: 1654 },
  ];

  const models = ['VQE-AQI', 'ClimateTransformer', 'QCNN-Disaster', 'EnviroBoost', 'QAOA-EnviroOpt', 'EnviroVAE'];
  const modelTypes: ('quantum' | 'neural' | 'hybrid' | 'ensemble')[] = ['quantum', 'neural', 'hybrid', 'ensemble', 'quantum', 'neural'];

  return locations.map((loc, i) => ({
    id: `usage-${i}`,
    ...loc,
    model: models[i % models.length],
    modelType: modelTypes[i % modelTypes.length],
    lastActive: new Date(Date.now() - Math.floor(Math.random() * 300000)) // Within last 5 mins
  }));
};

// Mercator projection for accurate map positioning
const latLngToXY = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
  const y = (height / 2) - (width * mercN / (2 * Math.PI));
  return { x, y: Math.max(0, Math.min(height, y)) };
};

const getPointColor = (type: string) => {
  switch (type) {
    case 'quantum': return { fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.6)', ring: 'rgba(139, 92, 246, 0.3)' };
    case 'neural': return { fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)', ring: 'rgba(6, 182, 212, 0.3)' };
    case 'hybrid': return { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)', ring: 'rgba(245, 158, 11, 0.3)' };
    case 'ensemble': return { fill: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', ring: 'rgba(16, 185, 129, 0.3)' };
    default: return { fill: '#ffffff', glow: 'rgba(255, 255, 255, 0.6)', ring: 'rgba(255, 255, 255, 0.3)' };
  }
};

// Real world map SVG path (simplified but accurate continents)
const WorldMapPath = () => (
  <g className="opacity-20" fill="white" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5">
    {/* North America */}
    <path d="M45,85 L55,75 L80,70 L120,65 L145,70 L165,85 L170,105 L175,130 L165,145 L150,150 L130,145 L115,155 L100,160 L85,150 L70,135 L55,120 L45,100 Z" />
    {/* South America */}
    <path d="M115,165 L130,160 L145,170 L150,190 L155,220 L150,260 L140,290 L125,310 L110,300 L100,270 L95,230 L100,200 L105,180 Z" />
    {/* Europe */}
    <path d="M280,65 L310,55 L340,60 L360,65 L370,80 L365,95 L350,100 L330,95 L310,100 L290,95 L280,80 Z" />
    {/* Africa */}
    <path d="M290,110 L320,105 L350,115 L365,140 L370,180 L360,220 L340,255 L310,265 L280,255 L265,220 L260,180 L270,140 L285,120 Z" />
    {/* Asia */}
    <path d="M360,50 L420,45 L480,50 L520,60 L550,80 L560,110 L550,140 L520,155 L480,160 L440,155 L400,140 L380,120 L370,95 L365,70 Z" />
    {/* Australia */}
    <path d="M500,210 L540,205 L560,220 L565,250 L550,275 L520,280 L495,270 L485,245 L490,220 Z" />
    {/* Indonesia/SE Asia */}
    <path d="M480,165 L520,160 L545,175 L530,190 L500,195 L475,185 Z" />
    {/* Japan */}
    <path d="M545,85 L555,80 L565,90 L560,105 L550,100 Z" />
    {/* UK/Ireland */}
    <path d="M275,65 L285,60 L290,70 L285,80 L275,75 Z" />
  </g>
);

export default function GlobalUsageMap() {
  const [usageData] = useState<UsagePoint[]>(generateUsageData());
  const [hoveredPoint, setHoveredPoint] = useState<UsagePoint | null>(null);
  const [activePoints, setActivePoints] = useState<Set<string>>(new Set());
  const [pulsingPoints, setPulsingPoints] = useState<Set<string>>(new Set());

  // Calculate totals
  const totalDailyUsers = usageData.reduce((sum, p) => sum + p.dailyUsers, 0);
  const totalAllTimeUsers = usageData.reduce((sum, p) => sum + p.totalUsers, 0);
  const activeLocations = usageData.length;

  // Animate active points (simulate real-time activity)
  useEffect(() => {
    const interval = setInterval(() => {
      const newActive = new Set<string>();
      const newPulsing = new Set<string>();
      usageData.forEach(point => {
        if (Math.random() > 0.4) newActive.add(point.id);
        if (Math.random() > 0.85) newPulsing.add(point.id);
      });
      setActivePoints(newActive);
      setPulsingPoints(newPulsing);
    }, 2000);
    return () => clearInterval(interval);
  }, [usageData]);

  const mapWidth = 600;
  const mapHeight = 340;

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-black/60 to-black/40 border border-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/30 blur-lg rounded-full" />
            <div className="relative p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Global Deployments</h3>
            <p className="text-[10px] text-white/40">Live model activity worldwide</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative p-4">
        <svg 
          viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
          className="w-full h-auto"
          style={{ maxHeight: '280px' }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
            </pattern>
            
            {/* Glow filters for each type */}
            <filter id="glow-quantum" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feFlood floodColor="#8b5cf6" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-neural" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feFlood floodColor="#06b6d4" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-hybrid" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feFlood floodColor="#f59e0b" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-ensemble" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feFlood floodColor="#10b981" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>

            {/* Radial gradient for atmosphere effect */}
            <radialGradient id="atmosphereGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.1)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          
          {/* Background */}
          <rect width="100%" height="100%" fill="url(#mapGrid)" />
          <ellipse cx="300" cy="170" rx="280" ry="160" fill="url(#atmosphereGlow)" />
          
          {/* World Map */}
          <WorldMapPath />

          {/* Connection lines between nearby points */}
          <g opacity="0.15">
            {usageData.slice(0, 15).map((point, i) => {
              const pos1 = latLngToXY(point.lat, point.lng, mapWidth, mapHeight);
              const nearbyPoints = usageData.filter((p, j) => {
                if (j === i) return false;
                const dist = Math.sqrt(Math.pow(point.lat - p.lat, 2) + Math.pow(point.lng - p.lng, 2));
                return dist < 40;
              }).slice(0, 2);
              
              return nearbyPoints.map((nearby, ni) => {
                const pos2 = latLngToXY(nearby.lat, nearby.lng, mapWidth, mapHeight);
                return (
                  <line
                    key={`line-${i}-${ni}`}
                    x1={pos1.x}
                    y1={pos1.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    stroke={getPointColor(point.modelType).fill}
                    strokeWidth="0.5"
                    strokeDasharray="2 4"
                    opacity={activePoints.has(point.id) ? 0.6 : 0.3}
                  />
                );
              });
            })}
          </g>

          {/* Usage points */}
          {usageData.map((point) => {
            const { x, y } = latLngToXY(point.lat, point.lng, mapWidth, mapHeight);
            const colors = getPointColor(point.modelType);
            const isActive = activePoints.has(point.id);
            const isPulsing = pulsingPoints.has(point.id);
            
            return (
              <g 
                key={point.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                {/* Outer pulse ring for very active points */}
                {isPulsing && (
                  <>
                    <circle
                      r="16"
                      fill="none"
                      stroke={colors.fill}
                      strokeWidth="1"
                      opacity="0.3"
                    >
                      <animate attributeName="r" from="6" to="20" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle
                      r="12"
                      fill="none"
                      stroke={colors.fill}
                      strokeWidth="0.5"
                      opacity="0.2"
                    >
                      <animate attributeName="r" from="4" to="14" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
                    </circle>
                  </>
                )}
                
                {/* Soft glow */}
                <circle
                  r={isActive ? 10 : 6}
                  fill={colors.glow}
                  opacity={isActive ? 0.5 : 0.3}
                  filter={`url(#glow-${point.modelType})`}
                  className="transition-all duration-500"
                />
                
                {/* Outer ring */}
                <circle
                  r={isActive ? 5 : 4}
                  fill="none"
                  stroke={colors.fill}
                  strokeWidth="1"
                  opacity={isActive ? 0.8 : 0.4}
                  className="transition-all duration-300"
                />
                
                {/* Main dot */}
                <circle
                  r={isActive ? 3 : 2.5}
                  fill={colors.fill}
                  className="transition-all duration-300"
                />
                
                {/* Center highlight */}
                <circle
                  r="1"
                  fill="white"
                  opacity="0.9"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute z-20 p-3 rounded-lg bg-black/95 border border-white/20 backdrop-blur-xl shadow-2xl min-w-[200px] pointer-events-none"
            style={{
              left: `${Math.min(Math.max(((hoveredPoint.lng + 180) / 360) * 100, 15), 85)}%`,
              top: `${Math.min(((90 - hoveredPoint.lat) / 180) * 80 + 10, 70)}%`,
              transform: 'translate(-50%, -110%)'
            }}
          >
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              <MapPin className="w-3 h-3 text-white/50" />
              <span className="text-xs font-semibold text-white">{hoveredPoint.city}</span>
              <span className="text-[10px] text-white/40">{hoveredPoint.country}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Active Model</span>
                <span className={`text-[10px] font-medium ${
                  hoveredPoint.modelType === 'quantum' ? 'text-violet-400' :
                  hoveredPoint.modelType === 'neural' ? 'text-cyan-400' :
                  hoveredPoint.modelType === 'hybrid' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {hoveredPoint.model}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Today's Users</span>
                <span className="text-[10px] font-mono font-bold text-white">{hoveredPoint.dailyUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Total Users</span>
                <span className="text-[10px] font-mono text-white/70">{hoveredPoint.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Last Activity</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  {Math.floor((Date.now() - hoveredPoint.lastActive.getTime()) / 60000)}m ago
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 p-4 border-t border-white/[0.06]">
        <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Users className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] text-white/40 uppercase tracking-wider">Today</span>
          </div>
          <p className="text-xl font-mono font-bold text-cyan-400">{totalDailyUsers.toLocaleString()}</p>
          <p className="text-[9px] text-white/30">active users</p>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] text-white/40 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-xl font-mono font-bold text-emerald-400">{(totalAllTimeUsers / 1000).toFixed(1)}K</p>
          <p className="text-[9px] text-white/30">all-time users</p>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <MapPin className="w-3 h-3 text-violet-400" />
            <span className="text-[9px] text-white/40 uppercase tracking-wider">Locations</span>
          </div>
          <p className="text-xl font-mono font-bold text-violet-400">{activeLocations}</p>
          <p className="text-[9px] text-white/30">active cities</p>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Activity className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] text-white/40 uppercase tracking-wider">Uptime</span>
          </div>
          <p className="text-xl font-mono font-bold text-amber-400">99.9%</p>
          <p className="text-[9px] text-white/30">availability</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 px-4 pb-4">
        {[
          { type: 'quantum', label: 'Quantum' },
          { type: 'neural', label: 'Neural' },
          { type: 'hybrid', label: 'Hybrid' },
          { type: 'ensemble', label: 'Ensemble' },
        ].map(({ type, label }) => {
          const colors = getPointColor(type);
          const count = usageData.filter(p => p.modelType === type).length;
          return (
            <div key={type} className="flex items-center gap-2">
              <div className="relative">
                <div 
                  className="absolute inset-0 blur-sm rounded-full" 
                  style={{ backgroundColor: colors.glow }}
                />
                <div 
                  className="relative w-2 h-2 rounded-full" 
                  style={{ backgroundColor: colors.fill }}
                />
              </div>
              <span className="text-[10px] text-white/50">{label}</span>
              <span className="text-[9px] font-mono text-white/30">({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
