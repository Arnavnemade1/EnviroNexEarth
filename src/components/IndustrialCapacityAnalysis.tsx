
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  Wind,
  ArrowLeft,
  Shield,
  Brain,
  ShieldCheck,
  TrendingDown,
  Info,
  Clock,
  CheckCircle2,
  PieChart as PieIcon
} from 'lucide-react';
import {
  calculateResilienceRisk,
  predictResilienceTrend,
  OperationalProfile,
  IndustrialCapacityAnalysis as IndustrialCapacityAnalysisType,
  Interventions
} from '@/services/resilienceEngine';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IndustrialCapacityProps {
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
  weather?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  };
  forecast?: Array<{ aqi: number; pm25: number; confidence: number }>;
  onBack?: () => void;
}

export const IndustrialCapacityAnalysisComponent = ({ cityName, airQuality, forecast, weather, onBack }: IndustrialCapacityProps) => {
  const { toast } = useToast();
  const [operationalProfile] = useState<OperationalProfile>({
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

  const [capacityAnalysis, setCapacityAnalysis] = useState<IndustrialCapacityAnalysisType | null>(null);
  const [activeTab, setActiveTab] = useState('cardio');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCapacityAnalysis = async () => {
      setLoading(true);
      try {
        console.log('Fetching neural capacity analysis for:', cityName);

        const climateData = {
          cityName,
          lat: 0,
          lon: 0,
          airQuality,
          weather: weather || {
            temperature: 22,
            humidity: 45,
            windSpeed: 10,
            precipitation: 0
          }
        };

        const { data, error } = await supabase.functions.invoke('health-prediction-engine', {
          body: { climateData, operationalProfile, interventions }
        });

        if (error) throw error;

        console.log('Neural capacity analysis received:', data);
        setCapacityAnalysis(data);
      } catch (error) {
        console.error('Failed to fetch capacity analysis:', error);
        toast({
          title: "Neural Engine Offline",
          description: "Falling back to local resilience models.",
          variant: "destructive"
        });

        const analysis = calculateResilienceRisk(
          airQuality.aqi,
          airQuality.pm25,
          airQuality.o3,
          airQuality.no2,
          airQuality.so2,
          airQuality.co,
          operationalProfile,
          interventions
        );

        if (forecast) {
          analysis.activityWindows = predictResilienceTrend(
            analysis,
            forecast,
            airQuality.o3,
            airQuality.no2,
            airQuality.so2,
            airQuality.co,
            operationalProfile
          );
        }
        setCapacityAnalysis(analysis);
      } finally {
        setLoading(false);
      }
    };

    fetchCapacityAnalysis();
  }, [airQuality, operationalProfile, forecast, interventions, weather, cityName]);

  if (!capacityAnalysis || !capacityAnalysis.metrics) return <div className="min-h-screen flex items-center justify-center text-slate-400 bg-slate-950 font-sans">Initializing Capacity Engine...</div>;

  const { metrics } = capacityAnalysis;

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      optimal: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      guarded: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      limited: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      prohibited: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    };
    return (
      <Badge variant="outline" className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${styles[status as keyof typeof styles] || styles.optimal}`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-200 font-sans selection:bg-indigo-500/30">

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[1200px] h-[1200px] bg-indigo-500/10 rounded-full blur-[180px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[1200px] h-[1200px] bg-rose-500/5 rounded-full blur-[180px] animate-pulse-slow delay-1000" />
      </div>

      <header className="relative z-20 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl px-8 py-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-white/5 rounded-full text-slate-400 w-10 h-10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Capacity Forecast
                </h1>
                <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 px-2.5 py-0.5 text-[10px] font-medium rounded-full">
                  Live Analytics
                </Badge>
              </div>
              <p className="text-sm text-slate-400 font-medium tracking-wide">
                Operational resilience assessment for <span className="text-slate-200">{cityName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium mb-1">Personnel Load Factor</p>
              <div className="flex items-center justify-end gap-2 text-white">
                <Activity className="w-5 h-5 text-indigo-500" />
                <span className="text-3xl font-bold tracking-tight">
                  {metrics.aggregateRiskIncrease > 0 ? '+' : ''}{metrics.aggregateRiskIncrease}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-8 py-8 gap-8">

        <div className="grid grid-cols-12 gap-6 min-h-[500px]">

          <div className="col-span-12 lg:col-span-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  Aggregate Atmospheric Load
                </h2>
                <p className="text-sm text-slate-400 max-w-md">
                  Projected 24-hour relative increase in operational strain based on forecasted particulate exposure.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-xs text-slate-400">
                <Info className="w-3 h-3" />
                <span>Probabilistic Model (CI 95%)</span>
              </div>
            </div>

            <div className="h-[350px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={capacityAnalysis.activityWindows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGradientSmooth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" opacity={0.05} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    interval={2}
                    fontFamily="Inter, sans-serif"
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    fontFamily="Inter, sans-serif"
                    domain={[0, 'auto']}
                    label={{ value: '% Load Increase', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, dx: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}
                    itemStyle={{ color: '#fff', fontWeight: 600, fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}
                    cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeOpacity: 0.2 }}
                    formatter={(value: number) => [`+${value}%`, 'Load Increase']}
                  />

                  <ReferenceLine y={0} stroke="#ffffff" strokeOpacity={0.1} />

                  <Area
                    type="monotone"
                    dataKey="riskIncreaseSteps"
                    stroke="none"
                    fill="url(#riskGradientSmooth)"
                  />

                  <Line
                    type="monotone"
                    dataKey="riskIncreaseSteps"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#fff', strokeWidth: 0 }}
                    animationDuration={1500}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 p-6 rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md flex flex-col transition-all hover:scale-[1.02] duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <PieIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 bg-white/10 px-2 py-1 rounded-full text-indigo-400">Drivers</span>
            </div>
            <div className="h-40 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={capacityAnalysis.pollutantBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="impact"
                  >
                    {capacityAnalysis.pollutantBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              {capacityAnalysis.pollutantBreakdown?.slice(0, 4).map((p: any) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[10px] font-medium text-slate-400">{p.name} {p.impact}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Efficiency Suitability Timeline
                </h2>
                <p className="text-sm text-slate-400">Optimal windows for peak industrial physiological output.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {capacityAnalysis.activityWindows.map((window: any) => (
                <div key={window.hour} className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3 transition-all hover:bg-white/5">
                  <span className="text-[10px] font-bold text-slate-500">{window.label}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${window.status === 'optimal' ? 'border-emerald-500/30 bg-emerald-500/10' :
                    window.status === 'guarded' ? 'border-amber-500/30 bg-amber-500/10' :
                      window.status === 'limited' ? 'border-orange-500/30 bg-orange-500/10' :
                        'border-rose-500/30 bg-rose-500/10'
                    }`}>
                    <Activity className={`w-5 h-5 ${window.status === 'optimal' ? 'text-emerald-400' :
                      window.status === 'guarded' ? 'text-amber-400' :
                        window.status === 'limited' ? 'text-orange-400' :
                          'text-rose-400'
                      }`} />
                  </div>
                  <StatusBadge status={window.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 bg-indigo-600/10 backdrop-blur-md border border-indigo-500/20 rounded-[24px] p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Brain className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Tactical Optimizations</h2>
              </div>

              <div className="flex-1 space-y-4">
                {capacityAnalysis.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-950/30 border border-white/5 rounded-2xl transition-all hover:border-indigo-500/30 group">
                    <div className="mt-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-slate-200 leading-snug">{rec}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Neural Analysis v5.0</span>
                </div>
                <Badge className="bg-white/10 text-[9px] text-slate-400 border-none">Accuracy Certified</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-[250px] bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-6 lg:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Capacity Risks</h3>
              <TabsList className="bg-slate-950/50 border border-white/5 p-1 rounded-full h-auto">
                <TabsTrigger value="cardio" className="rounded-full px-6 py-2 text-xs font-bold transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none hover:text-white">
                  Systemic Load
                </TabsTrigger>
                <TabsTrigger value="resp" className="rounded-full px-6 py-2 text-xs font-bold transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none hover:text-white">
                  Resilience Index
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="cardio" className="mt-0 animate-in fade-in duration-500">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-indigo-400 mb-2">
                    <TrendingDown className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">IMPACT ANALYSIS</span>
                  </div>
                  <p className="text-lg text-slate-200 leading-relaxed font-light">
                    Current fine particulate matter ({airQuality.pm25} µg/m³) exposure is correlated with a <span className="text-white font-semibold">+{metrics.cardiovascularRisk.increase}% relative increase</span> in systemic physiological load compared to safety baseline.
                  </p>
                </div>
                <div className="w-full lg:w-auto min-w-[300px] p-6 bg-slate-950/30 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Recommended Action</h4>
                  {interventions.usingAirPurifier ? (
                    <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                      <ShieldCheck className="w-5 h-5" />
                      <div>
                        <p className="font-bold text-sm">HEPA Active</p>
                        <p className="text-xs opacity-80">Load Reduced ~60%</p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setInterventions(p => ({ ...p, usingAirPurifier: true }))}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl h-12 shadow-lg shadow-indigo-500/20"
                    >
                      Activate HEPA Protection
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resp" className="mt-0 animate-in fade-in duration-500">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-blue-400 mb-2">
                    <Wind className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">IMPACT ANALYSIS</span>
                  </div>
                  <p className="text-lg text-slate-200 leading-relaxed font-light">
                    Synergistic exposure to Nitrogen Dioxide ({airQuality.no2} ppb) and Ozone ({airQuality.o3} ppb) creates a <span className="text-white font-semibold">+{metrics.respiratoryRisk.increase}% increase</span> in localized atmospheric strain. Tactical adjustments advised.
                  </p>
                </div>
                <div className="w-full lg:w-auto min-w-[300px] p-6 bg-slate-950/30 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Recommended Action</h4>
                  {interventions.usingN95 ? (
                    <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                      <ShieldCheck className="w-5 h-5" />
                      <div>
                        <p className="font-bold text-sm">Respirator Active</p>
                        <p className="text-xs opacity-80">Integrity Maintained</p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setInterventions(p => ({ ...p, usingN95: true }))}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl h-12 shadow-lg shadow-blue-500/20"
                    >
                      Activate Personnel Bypass
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export { IndustrialCapacityAnalysisComponent as IndustrialCapacityAnalysis };
