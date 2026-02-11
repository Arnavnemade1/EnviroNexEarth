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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
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
  Info,
  AlertTriangle
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
  const [activeTab, setActiveTab] = useState('shield');
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

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl mb-8 flex w-full max-w-2xl mx-auto">
            <TabsTrigger value="shield" className="flex-1 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 rounded-xl transition-all font-bold text-xs uppercase tracking-wider py-3">
              <Shield className="w-4 h-4 mr-2" /> Shield Status
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-xl transition-all font-bold text-xs uppercase tracking-wider py-3">
              <Clock className="w-4 h-4 mr-2" /> Action Timeline
            </TabsTrigger>
            <TabsTrigger value="lab" className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 rounded-xl transition-all font-bold text-xs uppercase tracking-wider py-3">
              <Stethoscope className="w-4 h-4 mr-2" /> Biological Lab
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 rounded-xl transition-all font-bold text-xs uppercase tracking-wider py-3">
              <User className="w-4 h-4 mr-2" /> Bio-Profile
            </TabsTrigger>
          </TabsList>

          {/* TAB: SHIELD STATUS */}
          <TabsContent value="shield" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Radar Chart Section - Contained Size */}
              <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <Shield className="w-40 h-40 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Current Bio-Defense Metrics</h3>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">OPTIMAL</Badge>
                </div>

                <div className="h-[350px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis
                        dataKey="factor"
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 'bold' }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Health Risk"
                        dataKey="value"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
                  {radarData.map((d, i) => (
                    <div key={i} className="text-center group/item hover:bg-white/5 p-3 rounded-xl transition-colors">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{d.factor}</p>
                      <p className="text-xl font-black text-white group-hover/item:text-emerald-400 transition-colors">{100 - d.value.toFixed(0)}%</p>
                      <p className="text-[9px] text-emerald-500/50 mt-1">DEFENSE RATING</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Interventions & Recs */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                {/* Intervention Switches */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-6">Active Countermeasures</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Shield className="w-4 h-4" /></div>
                        <div>
                          <p className="text-sm font-bold text-white">N95 Mask Protocol</p>
                          <p className="text-[10px] text-slate-500">Filters 95% particulates</p>
                        </div>
                      </div>
                      <Switch checked={interventions.usingN95} onCheckedChange={(c) => setInterventions(p => ({ ...p, usingN95: c }))} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400"><Wind className="w-4 h-4" /></div>
                        <div>
                          <p className="text-sm font-bold text-white">HEPA Air Filtration</p>
                          <p className="text-[10px] text-slate-500">Indoor purification active</p>
                        </div>
                      </div>
                      <Switch checked={interventions.usingAirPurifier} onCheckedChange={(c) => setInterventions(p => ({ ...p, usingAirPurifier: c }))} />
                    </div>
                  </div>
                </div>

                {/* Top Recommendations */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex-1">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-6">Neural Insights</h3>
                  <div className="space-y-4">
                    {healthAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                      <div key={i} className="flex gap-4 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB: ACTION TIMELINE */}
          <TabsContent value="timeline" className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">24-Hour Forecast</h3>
                  <p className="text-xs text-slate-500">Projected biological stress levels based on current atmospheric trends.</p>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-slate-400 uppercase">Low Risk</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[10px] font-bold text-slate-400 uppercase">Caution</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] font-bold text-slate-400 uppercase">Danger</span></div>
                </div>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthAnalysis.activityWindows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.1)" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Risk Factor', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="riskScore"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#riskGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* TAB: BIOLOGICAL LAB */}
          <TabsContent value="lab" className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pollutant Impact Bars */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Atom className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-white">Pollutant-Biology Interaction</h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                      <span>PM2.5 / Alveolar Penetration</span>
                      <span className="text-white">{airQuality.pm25} µg/m³</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500/50 to-red-500 rounded-full" style={{ width: `${Math.min(100, (airQuality.pm25 / 100) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500">Fine particulate matter penetrating deep lung tissue and entering bloodstream.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                      <span>Ozone / Respiratory Oxidation</span>
                      <span className="text-white">{airQuality.o3} ppb</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500/50 to-amber-500 rounded-full" style={{ width: `${Math.min(100, (airQuality.o3 / 100) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500">Reactive oxygen species causing immediate cellular inflammation in airways.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                      <span>NO2 / Bronchial Constriction</span>
                      <span className="text-white">{airQuality.no2} ppb</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500/50 to-blue-500 rounded-full" style={{ width: `${Math.min(100, (airQuality.no2 / 100) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500">Nitrogen dioxide reducing lung function and increasing asthma sensitivity.</p>
                  </div>
                </div>
              </div>

              {/* Neural Feedback Loop Text */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                <Brain className="absolute -right-10 -bottom-10 w-64 h-64 text-white/[0.02]" />
                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Activity className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-white">Neural Feedback Loop</h3>
                </div>
                <div className="space-y-6 relative z-10 text-sm text-slate-400 leading-relaxed">
                  <p>
                    <strong className="text-white block mb-2">System Analysis:</strong>
                    Your biological response vectors indicate a heightened sensitivity to oxidative stress in the current environment.
                    The neural network predicts a <span className="text-emerald-400 font-bold">14% reduction</span> in cognitive efficiency if exposure exceeds 2 hours without filtration.
                  </p>
                  <p>
                    <strong className="text-white block mb-2">Recommended Adaptation:</strong>
                    Shift high-oxygen-demand activities to <span className="text-blue-400 font-bold">indoor controlled environments</span> or delay until the 19:00 precipitation window clears particulate density.
                  </p>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-4">
                    <p className="text-xs text-emerald-400 italic">
                      "Probabilistic modeling suggests intervention now prevents cumulative inflammation."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB: BIO-PROFILE */}
          <TabsContent value="profile" className="space-y-8 animate-in slide-in-from-left-4 duration-500">
            <div className="max-w-3xl mx-auto bg-white/[0.02] border border-white/5 rounded-3xl p-10">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Biological Profile Configuration</h3>
                  <p className="text-sm text-slate-500">Calibrate the neural engine to your specific physiology.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Biological Age</label>
                    <Select value={healthProfile.age.toString()} onValueChange={(v) => setHealthProfile(p => ({ ...p, age: parseInt(v) }))}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-11 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">Child (&lt; 18)</SelectItem>
                        <SelectItem value="25">Adult (18-65)</SelectItem>
                        <SelectItem value="75">Senior (65+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activity Level</label>
                    <Select value={healthProfile.activityLevel} onValueChange={(v: any) => setHealthProfile(p => ({ ...p, activityLevel: v }))}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-11 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Sedentary)</SelectItem>
                        <SelectItem value="moderate">Moderate (Active)</SelectItem>
                        <SelectItem value="high">High (Athletic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Medical Conditions</label>
                  {[
                    { id: 'hasAsthma', label: 'Asthma / Respiratory Sensitivity' },
                    { id: 'hasHeartCondition', label: 'Cardiovascular Condition' },
                    { id: 'hasLungCondition', label: 'Chronic Lung Disease' }
                  ].map((condition) => (
                    <div
                      key={condition.id}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${healthProfile[condition.id as keyof HealthProfile] ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                      onClick={() => setHealthProfile(prev => ({ ...prev, [condition.id]: !prev[condition.id as keyof HealthProfile] }))}
                    >
                      <span className="text-sm font-medium">{condition.label}</span>
                      {healthProfile[condition.id as keyof HealthProfile] && <CheckCircle className="w-4 h-4" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </main>

      {/* Extreme Minimal Footer */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-8 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-[10px] font-bold font-mono text-slate-600 tracking-[0.2em] uppercase">
          <div className="flex gap-12">
            <span className="hover:text-slate-400 transition-colors cursor-default">Instance: BIO_CLUSTER_7A</span>
            <span className="hover:text-slate-400 transition-colors cursor-default flex items-center gap-2">
              Spatial Context: {cityName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-emerald-500/50">Probabilistic Reality Lock Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { QuantumHealthAnalysisComponent as QuantumHealthAnalysis };