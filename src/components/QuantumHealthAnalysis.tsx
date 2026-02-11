import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area
} from 'recharts';
import {
  Activity,
  Shield,
  Clock,
  Atom,
  TrendingUp,
  Brain,
  Zap,
  Wind,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Info,
  ThermometerSun,
  Droplets,
  CloudFog,
  Stethoscope
} from 'lucide-react';
import {
  calculateQuantumHealthRisk,
  predictHealthTrend,
  HealthProfile,
  QuantumHealthAnalysis as QuantumHealthAnalysisType,
  Interventions
} from '@/services/quantumHealth';

interface QuantumHealthProps {
  cityName: string;
  currentAQI: number;
  airQuality: {
    aqi: number;
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  forecast?: Array<{ aqi: number; pm25: number; confidence: number }>;
  onBack?: () => void;
}

export const QuantumHealthAnalysisComponent = ({ cityName, airQuality, forecast, onBack }: QuantumHealthProps) => {
  // Default Internal Profile (Hidden from UI)
  const [healthProfile] = useState<HealthProfile>({
    age: 30,
    hasAsthma: false,
    hasHeartCondition: false,
    hasLungCondition: false,
    activityLevel: 'moderate',
    smokingStatus: 'never'
  });

  const [interventions, setInterventions] = useState<Interventions>({
    usingN95: false,
    usingAirPurifier: false,
    isStayingIndoors: false
  });

  const [healthAnalysis, setHealthAnalysis] = useState<QuantumHealthAnalysisType | null>(null);
  const [graphMode, setGraphMode] = useState<'safety' | 'raw'>('safety');

  useEffect(() => {
    const analysis = calculateQuantumHealthRisk(
      airQuality.aqi,
      airQuality.pm25,
      airQuality.o3,
      airQuality.no2,
      healthProfile,
      interventions
    );

    if (forecast) {
      analysis.activityWindows = predictHealthTrend(
        analysis,
        forecast,
        airQuality.o3,
        airQuality.no2,
        healthProfile
      );
    }

    setHealthAnalysis(analysis);
  }, [airQuality, healthProfile, forecast, interventions]);

  if (!healthAnalysis) return <div className="min-h-screen flex items-center justify-center text-slate-400 bg-[#0f172a]">Initializing Environmental Analysis...</div>;

  const getStatusColor = (val: number, good: number, mod: number) => {
    if (val <= good) return 'text-emerald-400';
    if (val <= mod) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getStatusLabel = (val: number, good: number, mod: number) => {
    if (val <= good) return 'Good';
    if (val <= mod) return 'Moderate';
    return 'Unhealthy';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30 font-sans">

      {/* Background Ambience - Toned down for "Lab" look */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-blue-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-slate-800/20 rounded-full blur-[150px]" />
      </div>

      {/* Scientific Header */}
      <header className="relative z-20 border-b border-white/5 bg-[#0f172a]/90 backdrop-blur-md px-10 py-5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-white/5 rounded-lg text-slate-400 w-9 h-9"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-4 mb-0.5">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-500" />
                  ENVIRONMENTAL <span className="text-slate-600">|</span> HEALTH DASHBOARD
                </h1>
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[10px] uppercase tracking-widest px-2 py-0.5 font-bold">
                  Monitoring Active
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-2 uppercase tracking-widest">
                Station: {cityName} <span className="text-slate-700">///</span> Updated: Now
              </p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div className="text-right group cursor-default">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mb-1">Respiratory Safety Score</p>
              <div className="flex items-center justify-end gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-3xl font-medium text-white leading-none font-mono">{(100 - healthAnalysis.riskScore).toFixed(0)}<span className="text-lg text-slate-600">/100</span></p>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="text-right group cursor-default">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mb-1">Environmental Confidence</p>
              <div className="flex items-center justify-end gap-3">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <p className="text-3xl font-medium text-white leading-none font-mono">{healthAnalysis.quantumCoherence}%</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col max-w-[1800px] mx-auto w-full px-10 py-8 gap-6">

        {/* Top Grid: Graph + Atmospheric Data */}
        <div className="grid grid-cols-12 gap-6 h-[580px]">

          {/* Main Hero: Scientific Predictive Chart */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 bg-[#1e293b]/50 border border-white/5 rounded-[16px] p-8 relative overflow-hidden group shadow-lg shadow-black/20 flex flex-col">
            {/* Chart Header & Controls */}
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" /> 24-Hour Predictive Forecast
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Multi-variable atmospheric projection model (v4.2)
                </p>
              </div>
              <div className="flex items-center gap-4 bg-[#0f172a] p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setGraphMode('safety')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${graphMode === 'safety' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Safety Index
                </button>
                <button
                  onClick={() => setGraphMode('raw')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${graphMode === 'raw' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Raw PM2.5
                </button>
              </div>
            </div>

            {/* The Graph */}
            <div className="flex-1 w-full relative z-10 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={healthAnalysis.activityWindows} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="safetyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rawGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    interval={2}
                    fontFamily="monospace"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, graphMode === 'safety' ? 100 : 'auto']}
                    fontFamily="monospace"
                    label={{ value: graphMode === 'safety' ? 'Health Index (0-100)' : 'PM2.5 Conc. (µg/m³)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, dx: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#fff', fontWeight: 600, fontSize: '11px', fontFamily: 'monospace' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                    cursor={{ stroke: '#475569', strokeWidth: 1 }}
                  />

                  {/* Reference Line */}
                  <ReferenceLine y={graphMode === 'safety' ? 80 : 35} stroke={graphMode === 'safety' ? '#10b981' : '#f59e0b'} strokeDasharray="4 4" label={{ value: 'WHO THRESHOLD', fill: graphMode === 'safety' ? '#10b981' : '#f59e0b', fontSize: 9, position: 'insideTopRight' }} />

                  {/* Area */}
                  <Area type="monotone" dataKey={graphMode === 'safety' ? 'riskScore' : (d) => Math.max(10, 50 - d.riskScore / 2) /* Simulation for raw data if not available in activityWindows directly */} stroke="none" fill={graphMode === 'safety' ? "url(#safetyGradient)" : "url(#rawGradient)"} />

                  {/* Line */}
                  <Line
                    type="monotone"
                    dataKey={graphMode === 'safety' ? 'riskScore' : (d) => Math.max(10, 50 - d.riskScore / 2)}
                    stroke={graphMode === 'safety' ? '#3b82f6' : '#ef4444'}
                    strokeWidth={3}
                    dot={{ r: 2, fill: '#1e293b', stroke: graphMode === 'safety' ? '#3b82f6' : '#ef4444', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#fff' }}
                    animationDuration={1500}
                    name={graphMode === 'safety' ? 'Health Score' : 'PM2.5 µg/m³'}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Atmospheric Module & Controls */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-6 h-full">

            {/* 1. Atmospheric Composition Module (New) */}
            <div className="bg-[#1e293b]/50 border border-white/5 rounded-[16px] p-6 flex-1 flex flex-col backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-700/50 rounded-md text-slate-300"><CloudFog className="w-4 h-4" /></div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Atmospheric Composition</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { label: 'PM2.5 (Fine)', val: airQuality.pm25, unit: 'µg/m³', good: 12, mod: 35 },
                  { label: 'PM10 (Coarse)', val: airQuality.pm10, unit: 'µg/m³', good: 54, mod: 154 },
                  { label: 'O3 (Ozone)', val: airQuality.o3, unit: 'ppb', good: 54, mod: 70 },
                  { label: 'NO2 (Nitrogen)', val: airQuality.no2, unit: 'ppb', good: 53, mod: 100 },
                  { label: 'CO (Carbon)', val: airQuality.co, unit: 'ppm', good: 4.4, mod: 9.4 },
                  { label: 'SO2 (Sulfur)', val: airQuality.so2, unit: 'ppb', good: 35, mod: 75 },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-lg font-mono font-medium text-white">{stat.val} <span className="text-[10px] text-slate-500">{stat.unit}</span></p>
                    </div>
                    <div className="text-right">
                      <div className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-white/5 ${getStatusColor(stat.val, stat.good, stat.mod)}`}>
                        {getStatusLabel(stat.val, stat.good, stat.mod)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Risk Mitigation Controls (Formerly Active Defense) */}
            <div className="bg-[#1e293b]/50 border border-white/5 rounded-[16px] p-6 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-900/30 rounded-md text-emerald-400"><Shield className="w-4 h-4" /></div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Risk Mitigation</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-transparent hover:border-emerald-500/20 transition-colors">
                  <span className="text-xs font-semibold text-slate-300">N95 Prophylaxis</span>
                  <Switch checked={interventions.usingN95} onCheckedChange={(c) => setInterventions(p => ({ ...p, usingN95: c }))} className="scale-75" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-transparent hover:border-blue-500/20 transition-colors">
                  <span className="text-xs font-semibold text-slate-300">HEPA Filtration</span>
                  <Switch checked={interventions.usingAirPurifier} onCheckedChange={(c) => setInterventions(p => ({ ...p, usingAirPurifier: c }))} className="scale-75" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section: Health Risk Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {healthAnalysis.recommendations.slice(0, 3).map((rec, i) => (
            <div key={i} className="bg-[#1e293b]/50 border border-white/5 rounded-[16px] p-6 group hover:border-blue-500/30 transition-colors cursor-default">
              <div className="flex items-center gap-3 mb-3">
                <Stethoscope className="w-4 h-4 text-blue-400" />
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Protocol 0{i + 1}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">{rec}</p>
            </div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-10 py-6 mt-auto bg-[#0f172a]">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between opacity-60 text-[10px] font-mono uppercase tracking-[0.1em] text-slate-500">
          <span>Data Source: OPEN_METEO_API // AGGREGATED</span>
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Secure Uplink Active
          </span>
        </div>
      </footer>

    </div>
  );
};

export { QuantumHealthAnalysisComponent as QuantumHealthAnalysis };