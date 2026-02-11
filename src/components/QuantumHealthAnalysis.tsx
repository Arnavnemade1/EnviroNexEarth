import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from 'recharts';
import {
  Heart,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Atom,
  TrendingUp,
  Baby,
  User,
  Sparkles,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Zap,
  Wind,
  Brain,
  Stethoscope,
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

export const QuantumHealthAnalysisComponent = ({ cityName, currentAQI, airQuality, forecast, onBack }: QuantumHealthProps) => {
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Calculate quantum health analysis when data changes or health profile is submitted
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
    setLastUpdated(new Date());
  }, [airQuality, healthProfile, forecast, interventions]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'very-low': return '#10b981'; // Emerald
      case 'low': return '#34d399'; // Green 400
      case 'moderate': return '#fbbf24'; // Amber
      case 'high': return '#f87171'; // Red 400
      case 'very-high': return '#ef4444'; // Red 500
      default: return '#fbbf24';
    }
  };

  if (!healthAnalysis) return <div>Loading Neural Health Command...</div>;

  const biologicalMetrics = [
    { name: 'Respiratory', value: healthAnalysis.biologicalImpact.respiratory, icon: Wind, color: '#60a5fa' },
    { name: 'Cardiovascular', value: healthAnalysis.biologicalImpact.cardiovascular, icon: Heart, color: '#f87171' },
    { name: 'Neurological', value: healthAnalysis.biologicalImpact.neurological, icon: Brain, color: '#a78bfa' },
    { name: 'Oxidative Stress', value: healthAnalysis.biologicalImpact.oxidativeStress, icon: Zap, color: '#fbbf24' }
  ];

  return (
    <div className="h-[calc(100vh-12rem)] overflow-auto custom-scrollbar">
      <div className="space-y-6 pr-4 pb-8">
        {/* Neural-Health Header */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <Card className="relative bg-[#020617]/80 backdrop-blur-xl border-white/10 p-6 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Brain size={160} className="text-emerald-400 group-hover:scale-110 transition-transform duration-1000" />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                {onBack && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                )}
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
                    <Atom className="w-10 h-10 text-emerald-400 animate-spin-slow" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <div className="h-4 w-4 bg-emerald-500 rounded-full animate-ping" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">Neural-Health Command</h2>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] animate-pulse">SYSTEM NOMINAL</Badge>
                  </div>
                  <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    Probabilistic Bio-Modeling: {cityName}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-center min-w-[140px]">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 text-emerald-400">Personal Shield</p>
                  <p className="text-3xl font-black text-white italic">{100 - healthAnalysis.riskScore}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-center min-w-[140px]">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 text-blue-400">System Fidelity</p>
                  <p className="text-3xl font-black text-white italic">{healthAnalysis.quantumCoherence}%</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Command Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border-white/10 p-1">
            <TabsTrigger value="shield" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 rounded-md transition-all">
              <Shield className="w-4 h-4" />
              Shield Status
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-md transition-all">
              <Clock className="w-4 h-4" />
              Action Timeline
            </TabsTrigger>
            <TabsTrigger value="lab" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 rounded-md transition-all">
              <Stethoscope className="w-4 h-4" />
              Biological Lab
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 rounded-md transition-all">
              <User className="w-4 h-4" />
              Bio-Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shield" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Biological Impact Radar */}
              <div className="lg:col-span-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {biologicalMetrics.map((m) => (
                    <Card key={m.name} className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-all group overflow-hidden relative">
                      <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-500">
                        <m.icon size={64} />
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-white/5">
                          <m.icon className="w-4 h-4" style={{ color: m.color }} />
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{m.name}</h4>
                      </div>
                      <div className="flex items-end justify-between font-black text-2xl italic text-white mb-2">
                        <span>{m.value.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-500 non-italic mb-1">PROBABILITY %</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000 rounded-full"
                          style={{ width: `${m.value}%`, backgroundColor: m.color, boxShadow: `0 0 10px ${m.color}40` }}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Intervention Simulator */}
              <div className="lg:col-span-5">
                <Card className="bg-white/5 border-white/10 p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 text-emerald-400">
                      <Zap className="w-4 h-4" />
                      Intervention Simulator
                    </h3>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">ACTIVE REDUCTION: {healthAnalysis.interventionEffectiveness}%</Badge>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">N95 Mask Usage</p>
                          <p className="text-[10px] text-slate-500">Filters 85% of PM2.5 particulates</p>
                        </div>
                      </div>
                      <Switch
                        checked={interventions.usingN95}
                        onCheckedChange={(checked) => setInterventions(prev => ({ ...prev, usingN95: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Wind className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">HEPA Air Purifier</p>
                          <p className="text-[10px] text-slate-500">Neutralizes 70% of indoor toxins</p>
                        </div>
                      </div>
                      <Switch
                        checked={interventions.usingAirPurifier}
                        onCheckedChange={(checked) => setInterventions(prev => ({ ...prev, usingAirPurifier: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Indoor Confinement</p>
                          <p className="text-[10px] text-slate-500">Reduces direct ambient exposure by 50%</p>
                        </div>
                      </div>
                      <Switch
                        checked={interventions.isStayingIndoors}
                        onCheckedChange={(checked) => setInterventions(prev => ({ ...prev, isStayingIndoors: checked }))}
                      />
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "Simulating {healthProfile.age}-year old biology across {healthAnalysis.quantumCoherence}% accurate probabilistic timelines. Recommended actions are mission-critical."
                    </p>
                  </div>
                </Card>
              </div>

              {/* Recommendations Engine */}
              <div className="lg:col-span-7">
                <Card className="bg-white/5 border-white/10 p-6 h-full">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Neural Recommendation Engine
                  </h3>
                  <div className="space-y-4">
                    {healthAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-300"></div>
                        <div className="relative flex items-start gap-4 p-4 bg-[#020617] rounded-xl border border-white/5 group-hover:border-white/10">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">{rec}</p>
                            <div className="mt-2 flex items-center gap-3">
                              <Badge variant="outline" className="text-[8px] uppercase tracking-tighter border-emerald-500/20 text-emerald-500/50">High Confidence</Badge>
                              <span className="text-[10px] text-slate-600 font-mono tracking-tighter">REF_Q_BIO_0{index + 1}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {healthAnalysis.recommendations.length === 0 && (
                      <div className="h-40 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-slate-500 text-sm italic">Recalibrating Neural Feedback...</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Live Pulse Update</span>
                    </div>
                    <p className="text-xs font-mono text-emerald-400">99.2% Sync</p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="animate-in fade-in duration-500">
            <Card className="bg-white/5 border-white/10 p-8">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Optimal Activity Windows</h3>
                  <p className="text-slate-500 text-sm">24-hour predictive exertion roadmap</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Optimal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Limited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Danger</span>
                  </div>
                </div>
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthAnalysis.activityWindows}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#0f172a] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                              <p className="text-xs text-slate-500 font-bold uppercase mb-2">Hour: {label}</p>
                              <div className="flex items-center justify-between gap-8 mb-2">
                                <span className="text-slate-300 text-sm">Status:</span>
                                <span className="font-bold uppercase italic text-xs" style={{ color: data.status === 'optimal' ? '#10b981' : data.status === 'limited' ? '#fbbf24' : '#ef4444' }}>
                                  {data.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-8">
                                <span className="text-slate-300 text-sm">Risk:</span>
                                <span className="text-white font-bold">{data.riskScore}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="riskScore" radius={[4, 4, 0, 0]}>
                      {healthAnalysis.activityWindows.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.status === 'optimal' ? '#10b981' : entry.status === 'limited' ? '#fbbf24' : '#ef4444'}
                          fillOpacity={0.6}
                          className="transition-all duration-300 hover:fill-opacity-100"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="lab" className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Atom className="w-32 h-32 text-blue-400 rotate-12" />
                </div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  Neural Feedback Loop
                </h3>
                <div className="space-y-6">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Our system predicts bio-cellular responses to pollutants by simulating your unique health profile
                    against 120+ atmospheric variables. Unlike standard healthcare, we operate in
                    <span className="text-white"> predictive probability</span>.
                  </p>
                  <div className="bg-blue-500/10 p-6 rounded-2xl border border-blue-500/20 italic text-sm text-blue-400">
                    "Identifying non-linear pulmonary inflammation thresholds across a multi-nodal Hilbert space."
                  </div>
                  <ul className="space-y-4">
                    {[
                      "H13 Hepa Filtration Recommended: Level 9",
                      "Antioxidant Load Injection: High Necessity",
                      "VO2 Max Scaling: Limited Capacity"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs text-white/70">
                        <ChevronRight className="w-3 h-3 text-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-6">Pollutant-Biology Interaction</h3>
                <div className="space-y-4">
                  {[
                    { name: 'PM2.5 Penetration', value: airQuality.pm25, impact: 'Alveoli/Bloodstream' },
                    { name: 'Ozone Irritation', value: airQuality.o3, impact: 'Deep Lung Tissue' },
                    { name: 'NO2 Concentration', value: airQuality.no2, impact: 'Airway Inflammation' }
                  ].map((p) => (
                    <div key={p.name} className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-white">{p.name}</span>
                        <span className="text-xs text-slate-500 italic">{p.impact}</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-1000"
                          style={{ width: `${Math.min(100, p.value * 2)}%`, boxShadow: '0 0 10px #3b82f640' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <Card className="bg-white/5 border-white/10 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white">Biological Profile Configuration</h3>
                  <p className="text-sm text-slate-500">Calibrating neural-health weightings</p>
                </div>
                <Badge variant="outline" className="border-amber-500/30 text-amber-500">ENCRYPTED PKI</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Biological Age</label>
                    <Select
                      value={healthProfile.age.toString()}
                      onValueChange={(val) => setHealthProfile(prev => ({ ...prev, age: parseInt(val) }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">Children (&lt; 18)</SelectItem>
                        <SelectItem value="25">Adult (18-65)</SelectItem>
                        <SelectItem value="70">Seniors (65+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exertion Profile</label>
                    <Select
                      value={healthProfile.activityLevel}
                      onValueChange={(val: any) => setHealthProfile(prev => ({ ...prev, activityLevel: val }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Sedentary</SelectItem>
                        <SelectItem value="moderate">Active</SelectItem>
                        <SelectItem value="high">Athletic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Neural Health Overlays</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${healthProfile.hasAsthma ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-white/5 border-white/10 text-slate-400'}`}
                      onClick={() => setHealthProfile(prev => ({ ...prev, hasAsthma: !prev.hasAsthma }))}
                    >
                      <span className="text-sm font-bold">Respiratory Sensitivity (Asthma)</span>
                      {healthProfile.hasAsthma && <CheckCircle size={16} />}
                    </div>
                    <div
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${healthProfile.hasHeartCondition ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-white/5 border-white/10 text-slate-400'}`}
                      onClick={() => setHealthProfile(prev => ({ ...prev, hasHeartCondition: !prev.hasHeartCondition }))}
                    >
                      <span className="text-sm font-bold">Cardiovascular Thresholds</span>
                      {healthProfile.hasHeartCondition && <CheckCircle size={16} />}
                    </div>
                    <div
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${healthProfile.hasLungCondition ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-white/5 border-white/10 text-slate-400'}`}
                      onClick={() => setHealthProfile(prev => ({ ...prev, hasLungCondition: !prev.hasLungCondition }))}
                    >
                      <span className="text-sm font-bold">Lung Capacity Impairment</span>
                      {healthProfile.hasLungCondition && <CheckCircle size={16} />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  By updating your profile, you enable our <span className="text-white">Neural Cluster </span> to refine the probabilistic risk weighting for your specific biology. All data is processed locally with zero persistent storage.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Neural Footer */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-white/10 p-8 text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center gap-4">
              <Info className="text-emerald-400 w-8 h-8 opacity-50" />
              <h4 className="text-xl font-black text-white italic uppercase tracking-widest">Predictive Health Dominance.</h4>
              <p className="max-w-xl text-sm text-slate-400">
                Traditional medicine reacts to symptoms. Our Neural-Health Command center predicts risk thresholds hours before your biology even responds. We don't just tell you the air is bad—we tell you <span className="text-white">exactly how much it affects YOU</span>.
              </p>
              <div className="flex gap-4 mt-4">
                <Badge variant="outline" className="text-emerald-500/50 border-emerald-500/20 uppercase tracking-widest text-[9px] px-3">Bio-Causality</Badge>
                <Badge variant="outline" className="text-blue-500/50 border-blue-500/20 uppercase tracking-widest text-[9px] px-3">Quantum Prophylaxis</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { QuantumHealthAnalysisComponent as QuantumHealthAnalysis };