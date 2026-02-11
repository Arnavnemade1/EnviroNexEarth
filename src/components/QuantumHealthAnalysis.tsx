
import { useState, useEffect } from 'react';
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
  Zap,
  Wind,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Stethoscope,
  Heart,
  Brain,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import {
  calculateEpidemiologicalRisk, // New function name
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

  useEffect(() => {
    const analysis = calculateEpidemiologicalRisk(
      airQuality.aqi,
      airQuality.pm25,
      airQuality.o3,
      airQuality.no2,
      airQuality.so2,
      airQuality.co,
      healthProfile,
      interventions
    );

    if (forecast) {
      analysis.activityWindows = predictHealthTrend(
        analysis,
        forecast,
        airQuality.o3,
        airQuality.no2,
        airQuality.so2,
        airQuality.co,
        healthProfile
      );
    }

    setHealthAnalysis(analysis);
  }, [airQuality, healthProfile, forecast, interventions]);

  if (!healthAnalysis || !healthAnalysis.metrics) return <div className="min-h-screen flex items-center justify-center text-slate-400 bg-[#0f172a]">Initializing Epidemiological Model...</div>;

  // Direct access to deterministic metrics
  const { metrics } = healthAnalysis;

  // Helpers for color mapping
  const getColorClass = (color: 'emerald' | 'amber' | 'rose') => {
    switch (color) {
      case 'rose': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'amber': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'emerald': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400';
    }
  };

  const getStrokeColor = (color: string) => {
    switch (color) {
      case 'rose': return '#fb7185';
      case 'amber': return '#fbbf24';
      case 'emerald': return '#34d399';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-slate-200 selection:bg-rose-500/30 font-sans">

      {/* Background Ambience - Medical/Sterile */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[1200px] h-[1200px] bg-slate-800/20 rounded-full blur-[150px]" />
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
                  EPIDEMIOLOGICAL <span className="text-slate-600">|</span> RISK ENGINE
                </h1>
                <Badge variant="outline" className="border-rose-500/20 text-rose-400 bg-rose-500/5 text-[10px] uppercase tracking-widest px-2 py-0.5 font-bold">
                  v8.0 ERF-Based
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-2 uppercase tracking-widest">
                Methodology: Log-linear ERF (WHO/ACS) <span className="text-slate-700">///</span> Confidence: 95% CI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div className="text-right group cursor-default">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mb-1">Mortality Risk Factor</p>
              <div className="flex items-center justify-end gap-3">
                <Activity className="w-4 h-4 text-rose-500" />
                <p className="text-3xl font-medium text-white leading-none font-mono">
                  {metrics.aggregateRiskIncrease > 0 ? '+' : ''}{metrics.aggregateRiskIncrease}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col max-w-[1800px] mx-auto w-full px-10 py-8 gap-6">

        {/* Top Grid: Main Graph + Risk Panel */}
        <div className="grid grid-cols-12 gap-6 h-[550px]">

          {/* Main Hero: Aggregate Health Risk Graph */}
          <div className="col-span-12 lg:col-span-9 bg-[#1e293b]/40 border border-white/5 rounded-[16px] p-8 relative overflow-hidden group shadow-lg flex flex-col">
            {/* Chart Header & Controls */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-rose-500" /> Aggregate Health Risk Forecast
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  projected % increase in all-cause mortality risk over 24h baseline (relative risk).
                </p>
              </div>
            </div>

            {/* The Graph */}
            <div className="flex-1 w-full relative z-10 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={healthAnalysis.activityWindows} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e11d48" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
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
                    domain={[0, 'auto']}
                    fontFamily="monospace"
                    label={{ value: '% Risk Increase (Relative)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, dx: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px' }}
                    itemStyle={{ color: '#fff', fontWeight: 600, fontSize: '11px', fontFamily: 'monospace' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                    cursor={{ stroke: '#475569', strokeWidth: 1 }}
                    formatter={(value: number) => [`+${value}%`, 'Relative Risk']}
                  />

                  {/* Reference Line */}
                  <ReferenceLine y={0.5} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'BASELINE', fill: '#10b981', fontSize: 9, position: 'insideRight' }} />

                  {/* Area */}
                  <Area
                    type="step"
                    dataKey="riskIncreaseSteps"
                    stroke="none"
                    fill="url(#riskGradient)"
                  />

                  {/* Line */}
                  <Line
                    type="step"
                    dataKey="riskIncreaseSteps"
                    stroke="#e11d48"
                    strokeWidth={3}
                    dot={{ r: 2, fill: '#1e293b', stroke: '#e11d48', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#fff' }}
                    animationDuration={1500}
                    name="Relative Risk"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Real-Time Exposure Risks (Replaces Vitals) */}
          <div className="col-span-12 lg:col-span-3 bg-[#1e293b]/40 border border-white/5 rounded-[16px] p-6 flex flex-col h-full backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-700/50 rounded-md text-amber-400"><AlertTriangle className="w-4 h-4" /></div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Exposure Risks</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className={`p-4 rounded-xl border ${getColorClass(metrics.cardiovascularRisk.color)}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">{metrics.cardiovascularRisk.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-mono font-bold">+{metrics.cardiovascularRisk.increase}%</p>
                  <Heart className="w-4 h-4" />
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${getColorClass(metrics.respiratoryRisk.color)}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">{metrics.respiratoryRisk.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-mono font-bold">+{metrics.respiratoryRisk.increase}%</p>
                  <Wind className="w-4 h-4" />
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${getColorClass(metrics.neurologicalRisk.color)}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">{metrics.neurologicalRisk.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-mono font-bold">+{metrics.neurologicalRisk.increase}%</p>
                  <Brain className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  Metrics derived from log-linear ERF models. Not medical advice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Risk Mitigation Tabs */}
        <div className="min-h-[200px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-[#1e293b]/40 border border-white/5 p-1 rounded-xl w-full justify-start gap-2 mb-6 h-auto">
              <TabsTrigger value="cardio" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400 rounded-lg py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4" /> Cardiovascular
              </TabsTrigger>
              <TabsTrigger value="resp" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-lg py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Wind className="w-4 h-4" /> Respiratory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cardio" className="animate-in slide-in-from-left-4 duration-300">
              <div className="bg-[#1e293b]/40 border border-white/5 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-lg"><Activity className="w-6 h-6 text-rose-500" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Cardiovascular Impact Summary</h4>
                    <p className="text-xs text-slate-400 mb-4 max-w-2xl leading-relaxed">
                      Current PM2.5 levels ({airQuality.pm25} µg/m³) are associated with a <span className="text-white font-bold">{metrics.cardiovascularRisk.increase}%</span> increase in the risk of acute cardiovascular events relative to baseline clean air days.
                    </p>
                    {interventions.usingAirPurifier ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-md w-fit border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> Filtration Reducing Risk by ~60%
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setInterventions(p => ({ ...p, usingAirPurifier: true }))} className="text-xs h-7 border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                        Activate HEPA Filter Simulator
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resp" className="animate-in slide-in-from-left-4 duration-300">
              <div className="bg-[#1e293b]/40 border border-white/5 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg"><Wind className="w-6 h-6 text-blue-500" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Respiratory Impact Summary</h4>
                    <p className="text-xs text-slate-400 mb-4 max-w-2xl leading-relaxed">
                      Combined NO2 ({airQuality.no2} ppb) and O3 ({airQuality.o3} ppb) exposure creates a synergistic irritant effect, increasing bronchoconstriction probability by <span className="text-white font-bold">{metrics.respiratoryRisk.increase}%</span>.
                    </p>
                    {interventions.usingN95 ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-md w-fit border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> N95 Reducing Particulate Uptake
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setInterventions(p => ({ ...p, usingN95: true }))} className="text-xs h-7 border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                        Activate N95 Simulator
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-10 py-6 mt-auto bg-[#0f172a]">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between opacity-60 text-[10px] font-mono uppercase tracking-[0.1em] text-slate-500">
          <span>Model: ETH-Zurich / WHO-2024 Basis</span>
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ERF Engine Online
          </span>
        </div>
      </footer>

    </div>
  );
};

export { QuantumHealthAnalysisComponent as QuantumHealthAnalysis };

