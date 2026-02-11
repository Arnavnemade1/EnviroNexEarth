import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Stethoscope,
  Heart,
  Moon,
  Lungs
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
  const [activeTab, setActiveTab] = useState('cardio');
  const [graphMode, setGraphMode] = useState<'stress' | 'hrv'>('stress');

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

  // Derived Clinical Metrics (Simulated based on Risk Score)
  const clinicalData = useMemo(() => {
    if (!healthAnalysis) return null;
    const risk = healthAnalysis.riskScore;

    return {
      hrv: Math.max(20, 100 - risk * 0.8), // Higher risk = Lower HRV
      stressLoad: risk, // Direct mapping
      recoveryIndex: Math.max(0, 100 - risk * 1.2),
      cardiacStrain: Math.min(100, risk * 0.9),
      lungInflammation: Math.min(100, risk * 1.1),
      cognitiveFocus: Math.max(0, 100 - risk * 0.5),
      sleepQuality: Math.max(0, 100 - risk * 0.7),
      projectedVitals: {
        hr: Math.round(65 + (risk * 0.3)),
        spo2: (99 - (risk * 0.05)).toFixed(1),
        bpSys: Math.round(115 + (risk * 0.2)),
        bpDia: Math.round(75 + (risk * 0.1)),
        cortisol: risk > 60 ? 'High' : risk > 30 ? 'Elevated' : 'Normal'
      }
    };
  }, [healthAnalysis]);

  if (!healthAnalysis || !clinicalData) return <div className="min-h-screen flex items-center justify-center text-slate-400 bg-[#0f172a]">Initializing Clinical Biolab...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-slate-200 selection:bg-rose-500/30 font-sans">

      {/* Background Ambience - Medical/Sterile */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[1200px] h-[1200px] bg-slate-800/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[1200px] h-[1200px] bg-rose-900/10 rounded-full blur-[150px]" />
      </div>

      {/* Clinical Header */}
      <header className="relative z-20 border-b border-white/5 bg-[#0f172a]/95 backdrop-blur-md px-10 py-5">
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
                  <Stethoscope className="w-5 h-5 text-rose-500" />
                  CLINICAL <span className="text-slate-600">|</span> BIOLAB
                </h1>
                <Badge variant="outline" className="border-rose-500/20 text-rose-400 bg-rose-500/5 text-[10px] uppercase tracking-widest px-2 py-0.5 font-bold">
                  v6.0 Physiology
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-2 uppercase tracking-widest">
                Subject: {cityName} Population <span className="text-slate-700">///</span> Vitals: Live
              </p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div className="text-right group cursor-default">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mb-1">System Stress Lead</p>
              <div className="flex items-center justify-end gap-3">
                <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                <p className="text-3xl font-medium text-white leading-none font-mono">{clinicalData.stressLoad.toFixed(0)}<span className="text-lg text-slate-600">%</span></p>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="text-right group cursor-default">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mb-1">Recovery Index</p>
              <div className="flex items-center justify-end gap-3">
                <Zap className="w-4 h-4 text-emerald-500" />
                <p className="text-3xl font-medium text-white leading-none font-mono">{clinicalData.recoveryIndex.toFixed(0)}<span className="text-lg text-slate-600">/100</span></p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col max-w-[1800px] mx-auto w-full px-10 py-8 gap-6">

        {/* Top Grid: Main Graph + Vitals Panel */}
        <div className="grid grid-cols-12 gap-6 h-[550px]">

          {/* Main Hero: Physiological Stress Graph */}
          <div className="col-span-12 lg:col-span-9 bg-[#1e293b]/40 border border-white/5 rounded-[16px] p-8 relative overflow-hidden group shadow-lg flex flex-col">
            {/* Chart Header & Controls */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-500" /> Physiological Stress Projection
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  24-hour predictive modeling of autonomic nervous system response.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-[#0f172a] p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setGraphMode('stress')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${graphMode === 'stress' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  System Stress
                </button>
                <button
                  onClick={() => setGraphMode('hrv')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${graphMode === 'hrv' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  HRV Projection
                </button>
              </div>
            </div>

            {/* The Graph */}
            <div className="flex-1 w-full relative z-10 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={healthAnalysis.activityWindows} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e11d48" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="hrvGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
                    domain={[0, 100]}
                    fontFamily="monospace"
                    label={{ value: graphMode === 'stress' ? 'Physiological Load (0-100)' : 'HRV (ms)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, dx: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px' }}
                    itemStyle={{ color: '#fff', fontWeight: 600, fontSize: '11px', fontFamily: 'monospace' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                    cursor={{ stroke: '#475569', strokeWidth: 1 }}
                  />

                  {/* Reference Line */}
                  <ReferenceLine y={graphMode === 'stress' ? 20 : 60} stroke="#64748b" strokeDasharray="4 4" label={{ value: 'BASELINE', fill: '#64748b', fontSize: 9, position: 'insideRight' }} />

                  {/* Area */}
                  <Area type="monotone" dataKey={graphMode === 'stress' ? 'riskScore' : (d) => Math.max(20, 100 - d.riskScore * 0.8)} stroke="none" fill={graphMode === 'stress' ? "url(#stressGradient)" : "url(#hrvGradient)"} />

                  {/* Line */}
                  <Line
                    type="monotone"
                    dataKey={graphMode === 'stress' ? 'riskScore' : (d) => Math.max(20, 100 - d.riskScore * 0.8)}
                    stroke={graphMode === 'stress' ? '#e11d48' : '#10b981'}
                    strokeWidth={3}
                    dot={{ r: 2, fill: '#1e293b', stroke: graphMode === 'stress' ? '#e11d48' : '#10b981', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#fff' }}
                    animationDuration={1500}
                    name={graphMode === 'stress' ? 'Stress Load' : 'HRV (ms)'}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Vitals Simulation */}
          <div className="col-span-12 lg:col-span-3 bg-[#1e293b]/40 border border-white/5 rounded-[16px] p-6 flex flex-col h-full backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-700/50 rounded-md text-emerald-400"><Activity className="w-4 h-4" /></div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Vitals</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Heart Rate (Proj)</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-mono text-white">{clinicalData.projectedVitals.hr} <span className="text-xs text-slate-500">bpm</span></p>
                  <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Blood Oxygen</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-mono text-white">{clinicalData.projectedVitals.spo2}%</p>
                  <Wind className="w-4 h-4 text-blue-500" />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Blood Pressure</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-mono text-white">{clinicalData.projectedVitals.bpSys}/{clinicalData.projectedVitals.bpDia}</p>
                  <div className={`text-[10px] px-2 py-0.5 rounded-full ${clinicalData.projectedVitals.bpSys > 130 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {clinicalData.projectedVitals.bpSys > 130 ? 'ELEV' : 'NORM'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Cortisol Levels</p>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-mono text-white">{clinicalData.projectedVitals.cortisol}</p>
                  <AlertTriangle className={`w-4 h-4 ${clinicalData.projectedVitals.cortisol === 'High' ? 'text-red-500' : 'text-slate-600'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Clinical Tabs */}
        <div className="min-h-[200px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-[#1e293b]/40 border border-white/5 p-1 rounded-xl w-full justify-start gap-2 mb-6 h-auto">
              <TabsTrigger value="cardio" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400 rounded-lg py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4" /> Cardiovascular
              </TabsTrigger>
              <TabsTrigger value="resp" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-lg py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Wind className="w-4 h-4" /> Respiratory
              </TabsTrigger>
              <TabsTrigger value="neuro" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 rounded-lg py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4" /> Neurological
              </TabsTrigger>
              <TabsTrigger value="sleep" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 rounded-lg py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Moon className="w-4 h-4" /> Sleep & Recovery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cardio" className="animate-in slide-in-from-left-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-xl p-6">
                  <h4 className="text-sm font-bold text-white mb-4">Cardiac Strain Probability</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin-slow" />
                      <span className="text-xl font-bold text-white">{clinicalData.cardiacStrain.toFixed(0)}%</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">Vasoconstriction Risk: <span className="text-white font-bold">{clinicalData.cardiacStrain > 40 ? 'DETECTED' : 'LOW'}</span></p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Systemic inflammation may increase cardiac workload by {Math.round(clinicalData.cardiacStrain * 0.2)}%.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-xl p-6 flex flex-col justify-center">
                  <p className="text-xs text-slate-400 mb-2 font-bold uppercase">Clinical Advisory</p>
                  <p className="text-sm text-white leading-relaxed">
                    {clinicalData.cardiacStrain > 50
                      ? "Immediate reduction in high-intensity aerobic output recommended due to elevated particulate uptake."
                      : "Cardiovascular baseline is stable. Standard training protocols authorized."}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resp" className="animate-in slide-in-from-left-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-xl p-6">
                  <h4 className="text-sm font-bold text-white mb-4">Pulmonary Capacity Est.</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-2 text-slate-400"><span>Bronchial Irritation</span><span>{clinicalData.lungInflammation.toFixed(0)}%</span></div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${clinicalData.lungInflammation}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2 text-slate-400"><span>O2 Uptake Efficiency</span><span>{(100 - clinicalData.lungInflammation * 0.3).toFixed(0)}%</span></div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${100 - clinicalData.lungInflammation * 0.3}%` }} /></div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-xl p-6 flex flex-col justify-center">
                  <p className="text-xs text-slate-400 mb-2 font-bold uppercase">Clinical Advisory</p>
                  <p className="text-sm text-white leading-relaxed">
                    {clinicalData.lungInflammation > 40
                      ? "Prophylactic N95 usage strongly advised for outdoor durations exceeding 15 minutes."
                      : "Respiratory predicted function is within nominal parameters."}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="neuro" className="animate-in slide-in-from-left-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-xl p-6">
                  <h4 className="text-sm font-bold text-white mb-4">Cognitive Performance Index</h4>
                  <div className="flex items-end gap-4">
                    <span className="text-4xl font-mono font-bold text-purple-400">{clinicalData.cognitiveFocus.toFixed(0)}</span>
                    <span className="text-sm text-slate-500 mb-2">/ 100 points</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Neuro-inflammation risk is <span className={clinicalData.cognitiveFocus < 70 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                      {clinicalData.cognitiveFocus < 70 ? "MODERATE" : "NEGLIGIBLE"}
                    </span>.
                  </p>
                </div>
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-xl p-6 flex flex-col justify-center">
                  <p className="text-xs text-slate-400 mb-2 font-bold uppercase">Clinical Advisory</p>
                  <p className="text-sm text-white leading-relaxed">
                    {clinicalData.cognitiveFocus < 70
                      ? "Expect 15-20% reduction in complex decision-making latency due to environmental fatigue."
                      : "Cognitive substrate is optimal for high-load mental tasks."}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sleep" className="animate-in slide-in-from-left-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-xl p-6">
                  <h4 className="text-sm font-bold text-white mb-4">Recovery & Circadian Forecast</h4>
                  <div className="flex items-center gap-6">
                    <Moon className={`w-12 h-12 ${clinicalData.sleepQuality > 70 ? 'text-indigo-400' : 'text-slate-600'}`} />
                    <div>
                      <p className="text-2xl font-bold text-white">{clinicalData.sleepQuality.toFixed(0)}%</p>
                      <p className="text-xs text-slate-500">Projected Sleep Quality</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-xl p-6 flex flex-col justify-center">
                  <p className="text-xs text-slate-400 mb-2 font-bold uppercase">Clinical Advisory</p>
                  <p className="text-sm text-white leading-relaxed">
                    {clinicalData.sleepQuality < 60
                      ? "Air filtration in sleeping quarters recommended to prevent micro-arousals from particulate irritation."
                      : "Environmental conditions favorable for deep-wave REM cycles."}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-10 py-6 mt-auto bg-[#0f172a]">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between opacity-60 text-[10px] font-mono uppercase tracking-[0.1em] text-slate-500">
          <span>Clinical Mode: ACTIVE // HIPAA Compliant</span>
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Biometrics Online
          </span>
        </div>
      </footer>

    </div>
  );
};

export { QuantumHealthAnalysisComponent as QuantumHealthAnalysis };