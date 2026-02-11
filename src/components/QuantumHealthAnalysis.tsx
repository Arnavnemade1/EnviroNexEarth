import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Heart,
  Activity,
  Shield,
  Clock,
  Atom,
  TrendingUp,
  User,
  ArrowLeft,
  ChevronRight,
  Zap,
  Wind,
  Brain,
  Stethoscope,
  CheckCircle,
  Info
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
  const [activeTab, setActiveTab] = useState('overview');
  const [healthProfile, setHealthProfile] = useState<HealthProfile>({
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

  const radarData = useMemo(() => {
    if (!healthAnalysis) return [];
    return [
      { factor: 'Respiratory', value: healthAnalysis.biologicalImpact.respiratory },
      { factor: 'Cardiac', value: healthAnalysis.biologicalImpact.cardiovascular },
      { factor: 'Neural', value: healthAnalysis.biologicalImpact.neurological },
      { factor: 'Oxidative', value: healthAnalysis.biologicalImpact.oxidativeStress }
    ];
  }, [healthAnalysis]);

  if (!healthAnalysis) return <div className="min-h-screen flex items-center justify-center text-white/50 bg-[#020617]">Initialising Neural Feedback...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-white">
      {/* Immersive Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -ml-96 -mb-96" />
      </div>

      {/* Modern Top Header */}
      <header className="relative z-10 border-b border-white/5 px-8 py-6 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-white/5 rounded-xl text-slate-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-0.5">
                <h1 className="text-xl font-black italic tracking-tighter uppercase text-white/90">Neural-Health Command</h1>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] font-mono animate-pulse">SYSTEM_ACTIVE</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-2 uppercase tracking-widest">
                <Activity className="w-3 h-3 text-emerald-500/60" />
                Bio-Modeling: {cityName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-12 text-slate-400">
            <div className="text-right">
              <p className="text-[9px] text-emerald-500/60 font-mono uppercase tracking-[0.2em] mb-1">Personal Shield</p>
              <p className="text-3xl font-black italic text-white leading-none">{(100 - healthAnalysis.riskScore).toFixed(0)}%</p>
            </div>
            <div className="h-10 w-px bg-white/5" />
            <div className="text-right">
              <p className="text-[9px] text-blue-500/60 font-mono uppercase tracking-[0.2em] mb-1">System Fidelity</p>
              <p className="text-3xl font-black italic text-white leading-none">{healthAnalysis.quantumCoherence}%</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-8 py-10 gap-10">

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-10 flex-1 items-start">

          {/* Left: THE GRAPH (Radar) & Stats */}
          <div className="col-span-12 lg:col-span-7 h-full flex flex-col gap-10">
            <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-[40px] p-12 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                <Atom className="w-80 h-80 text-white animate-spin-slow" />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.3em] mb-1">Biological Variance Radar</h3>
                  <p className="text-[10px] text-slate-600 font-mono">MULTI-NODAL PROBABILITY LOCK</p>
                </div>
                <div className="flex items-center gap-3 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 text-[9px] text-emerald-400 font-mono">
                  <Zap className="w-3 h-3 animate-pulse" />
                  UPLINK_STABLE
                </div>
              </div>

              <div className="h-[480px] flex items-center justify-center relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="80%">
                    <PolarGrid stroke="rgba(255,255,255,0.03)" />
                    <PolarAngleAxis
                      dataKey="factor"
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }}
                    />
                    <Radar
                      name="Health Risk"
                      dataKey="value"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-8 mt-12 relative z-10">
                {radarData.map((d, i) => (
                  <div key={i} className="text-center group/item cursor-help">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">{d.factor}</p>
                    <div className="relative inline-block">
                      <p className="text-2xl font-black text-white italic group-hover/item:text-emerald-400 transition-colors">{d.value.toFixed(1)}%</p>
                      <div className="h-0.5 w-0 group-hover/item:w-full bg-emerald-500/50 transition-all duration-500 mx-auto mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Simulation & Insights */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-10">
            {/* Simulation Matrix */}
            <div className="bg-white/[0.01] border border-white/5 rounded-[40px] p-10 space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.3em] mb-1">Intervention Simulator</h3>
                  <p className="text-[10px] text-slate-600 font-mono">PROACTIVE RISK REDUCTION</p>
                </div>
                <Badge variant="outline" className="text-[9px] border-white/5 text-slate-500 uppercase px-3 py-1">Mode: Manual</Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-emerald-500/20 transition-all cursor-pointer" onClick={() => setInterventions(prev => ({ ...prev, usingN95: !prev.usingN95 }))}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${interventions.usingN95 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5 tracking-tight text-white/90">N95 Particulate Shield</p>
                      <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">-85% PM2.5 Exposure</p>
                    </div>
                  </div>
                  <Switch
                    checked={interventions.usingN95}
                    onCheckedChange={(checked) => setInterventions(prev => ({ ...prev, usingN95: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-blue-500/20 transition-all cursor-pointer" onClick={() => setInterventions(prev => ({ ...prev, usingAirPurifier: !prev.usingAirPurifier }))}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${interventions.usingAirPurifier ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-500'}`}>
                      <Wind className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5 tracking-tight text-white/90">Indoor HEPA Filtering</p>
                      <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">-70% Volatile Toxins</p>
                    </div>
                  </div>
                  <Switch
                    checked={interventions.usingAirPurifier}
                    onCheckedChange={(checked) => setInterventions(prev => ({ ...prev, usingAirPurifier: checked }))}
                  />
                </div>
              </div>

              <div className="pt-10 border-t border-white/5 space-y-8">
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setActiveTab(activeTab === 'profile' ? 'overview' : 'profile')}>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-amber-500/80" />
                    </div>
                    <span className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">Bio-Profile Configuration</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-white/10 transition-transform duration-500 ${activeTab === 'profile' ? 'rotate-90' : ''}`} />
                </div>

                {activeTab === 'profile' && (
                  <div className="grid grid-cols-2 gap-6 pb-2 animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Target Age</p>
                      <Select
                        value={healthProfile.age.toString()}
                        onValueChange={(v) => setHealthProfile(p => ({ ...p, age: parseInt(v) }))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/5 text-[11px] h-10 rounded-xl focus:ring-amber-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">CHILD (&lt; 18)</SelectItem>
                          <SelectItem value="25">ADULT (18-65)</SelectItem>
                          <SelectItem value="75">SENIOR (65+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Activity Tier</p>
                      <Select
                        value={healthProfile.activityLevel}
                        onValueChange={(v: any) => setHealthProfile(p => ({ ...p, activityLevel: v }))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/5 text-[11px] h-10 rounded-xl focus:ring-amber-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">SEDENTARY</SelectItem>
                          <SelectItem value="moderate">ACTIVE</SelectItem>
                          <SelectItem value="high">ATHLETIC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights - Very Minimal */}
            <div className="bg-white/[0.01] border border-white/5 rounded-[40px] p-10 flex-1">
              <div className="flex items-center gap-3 mb-8">
                <Brain className="w-4 h-4 text-emerald-500/40" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Predictive Insights</h3>
              </div>
              <div className="space-y-6">
                {healthAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5 shrink-0" />
                    <p className="text-xs text-white/60 leading-relaxed font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trend Analysis */}
        <div className="bg-white/[0.01] border border-white/5 rounded-[40px] p-12 overflow-hidden relative group">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.3em] mb-1">24-Hour Adaptive Forecast</h3>
              <p className="text-[10px] text-slate-600 font-mono">NEURAL RISK PROJECTION MAP</p>
            </div>
            <div className="flex gap-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b98180]" />
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Optimized</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#fbbf2480]" />
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Compromised</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthAnalysis.activityWindows} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.1)"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '10px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  cursor={{ stroke: 'rgba(16,185,129,0.2)', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="riskScore"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#trendGrad)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>

      {/* Extreme Minimal Footer */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-8 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-[9px] font-black font-mono text-slate-700 tracking-[0.3em] uppercase">
          <div className="flex gap-12">
            <span className="hover:text-slate-400 transition-colors cursor-default">Instance: BIO_CLUSTER_7A</span>
            <span className="hover:text-slate-400 transition-colors cursor-default select-none group flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30 group-hover:bg-blue-500/60 transition-colors" />
              Spatial Context: {cityName}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-emerald-500/50">Probabilistic Reality Lock Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { QuantumHealthAnalysisComponent as QuantumHealthAnalysis };