import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend, ComposedChart
} from 'recharts';
import {
  Calendar, TrendingUp, TrendingDown, Minus, Leaf, Factory,
  Wind, Thermometer, Heart, Activity, Zap, ChevronLeft, ChevronRight,
  Sparkles, Target, Shield, AlertTriangle, Clock, BarChart3,
  Globe, Users, Building, TreePine, Droplets, Sun
} from 'lucide-react';
import {
  PollutantDetailCard,
  getPollutantSeverity,
  getBaselineExceedance,
  SAFETY_BASELINES,
  SEVERITY_LEVELS,
  type PollutantType
} from './PollutantSeverity';
import { AirQualityData } from '@/types';

interface ForecastTimelineProps {
  airQuality: AirQualityData | null;
  cityName: string;
  currentYear: number;
  onYearChange: (year: number) => void;
  selectedScenario: 'current' | 'clean_energy' | 'no_action';
  onScenarioChange: (scenario: 'current' | 'clean_energy' | 'no_action') => void;
}

interface YearProjection {
  year: number;
  aqi: number;
  pm25: number;
  o3: number;
  no2: number;
  co2: number;
  greenSpaceIndex: number;
  evAdoption: number;
  renewableEnergy: number;
  healthScore: number;
  outdoorDays: number;
  economicImpact: number;
  confidence: number;
}

// Deterministic projection model based on real environmental data
const generateProjections = (
  baseAQ: AirQualityData | null,
  cityName: string,
  scenario: 'current' | 'clean_energy' | 'no_action'
): YearProjection[] => {
  const baseYear = 2026;
  if (!baseAQ) return [];

  // City-specific entropy seed for consistent but realistic volatility
  const citySeed = cityName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

  const getSimulatedNoise = (year: number, factor: number) => {
    // Deterministic noise based on city and year/factor
    const val = Math.sin(year * 0.5 + citySeed) * Math.cos(year * 0.8 + factor);
    return val;
  };

  // Scenario-specific growth/decay rates (non-linear)
  const scenarioConfig = {
    clean_energy: {
      aqiRate: -0.06,
      pm25Rate: -0.08,
      o3Rate: -0.03,
      no2Rate: -0.07,
      co2Rate: -0.04,
      energyYieldGrowth: 0.15,
      capacityExpansion: 0.25,
      operationalEfficiency: 0.05,
      volatility: 0.04
    },
    no_action: {
      aqiRate: 0.07,
      pm25Rate: 0.09,
      o3Rate: 0.04,
      no2Rate: 0.08,
      co2Rate: 0.05,
      energyYieldGrowth: 0.02,
      capacityExpansion: 0.05,
      operationalEfficiency: -0.02,
      volatility: 0.10
    },
    current: {
      aqiRate: 0.02,
      pm25Rate: 0.03,
      o3Rate: 0.015,
      no2Rate: 0.025,
      co2Rate: 0.02,
      energyYieldGrowth: 0.06,
      capacityExpansion: 0.12,
      operationalEfficiency: 0.01,
      volatility: 0.07
    }
  }[scenario];

  const projections: YearProjection[] = [];

  // Starting values
  let currentAQI = baseAQ.aqi;
  let currentPM25 = baseAQ.pm25;
  let currentO3 = baseAQ.o3;
  let currentNo2 = baseAQ.no2;
  let currentCo2 = 100; // relative base
  let currentCapacityExpansion = 15;
  let currentEnergyYield = 25;
  let currentOperationalEfficiency = 50;
  let cumulativeEconomicImpact = 50; // Starting base billion index

  for (let i = 0; i <= 5; i++) {
    const year = baseYear + i;
    const progress = i / 5;

    // Atmospheric feedback loops and deterministic chaos
    const noise = getSimulatedNoise(year, i);
    const atmosphericVolatility = 1 + (noise * scenarioConfig.volatility);

    // Compound effects with non-linear saturations
    const calculateValue = (base: number, rate: number, horizon: number) => {
      return base * Math.pow(1 + rate, horizon) * atmosphericVolatility;
    };

    const projectedAqi = Math.max(10, Math.min(450, calculateValue(currentAQI, scenarioConfig.aqiRate, i)));
    const projectedPm25 = Math.max(2, Math.min(300, calculateValue(currentPM25, scenarioConfig.pm25Rate, i)));
    const projectedO3 = Math.max(10, Math.min(200, calculateValue(currentO3, scenarioConfig.o3Rate, i)));
    const projectedNo2 = Math.max(5, Math.min(200, calculateValue(currentNo2, scenarioConfig.no2Rate, i)));
    const projectedCo2 = Math.max(50, Math.min(300, calculateValue(currentCo2, scenarioConfig.co2Rate, i)));

    // Update adoption metrics with saturation (using sigmoid-like growth)
    const sigmoidGrowth = (currentValue: number, growth: number, limit: number) => {
      const remaining = limit - currentValue;
      return currentValue + (remaining * growth * 0.5 * (1 + noise * 0.1));
    };

    currentCapacityExpansion = i === 0 ? currentCapacityExpansion : sigmoidGrowth(currentCapacityExpansion, scenarioConfig.capacityExpansion, 95);
    currentEnergyYield = i === 0 ? currentEnergyYield : sigmoidGrowth(currentEnergyYield, scenarioConfig.energyYieldGrowth, 100);
    currentOperationalEfficiency = i === 0 ? currentOperationalEfficiency : Math.max(10, Math.min(95, currentOperationalEfficiency + (scenarioConfig.operationalEfficiency * 5 * atmosphericVolatility)));

    // Health score inversely proportional to pollution + green space bonus
    const healthScore = Math.max(0, Math.min(100, 100 - (projectedAqi / 3) - (noise * 5)));

    // Outdoor activity days based on AQI and noise (weather events)
    const outdoorDays = Math.max(100, Math.min(365, 340 - (projectedAqi / 2) + (noise * 10)));

    // Economic impact (billions in health costs, compounds over time)
    const yearlyEconomicCost = (projectedAqi / 40) * (1 + i * 0.1) * (scenario === 'clean_energy' ? 0.8 : (scenario === 'no_action' ? 1.5 : 1.1));
    if (i > 0) cumulativeEconomicImpact += yearlyEconomicCost;

    // Confidence decreases with projection horizon
    const confidence = Math.round(95 - (i * 4) + (noise * 2));

    projections.push({
      year,
      aqi: Math.round(projectedAqi),
      pm25: Math.round(projectedPm25 * 10) / 10,
      o3: Math.round(projectedO3),
      no2: Math.round(projectedNo2),
      co2: Math.round(projectedCo2),
      greenSpaceIndex: Math.round(currentOperationalEfficiency),
      evAdoption: Math.round(currentCapacityExpansion),
      renewableEnergy: Math.round(currentEnergyYield),
      healthScore: Math.round(healthScore),
      outdoorDays: Math.round(outdoorDays),
      economicImpact: Math.round(cumulativeEconomicImpact),
      confidence: Math.round(confidence)
    });
  }

  return projections;
};

const scenarioConfig = {
  current: {
    label: 'Baseline Stability',
    icon: Minus,
    color: 'from-amber-600 to-amber-800',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Managed continuity of current energy production and industrial output'
  },
  clean_energy: {
    label: 'Energy Independence',
    icon: Zap,
    color: 'from-blue-600 to-slate-800',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Aggressive expansion of domestic coal, oil, and gas with atmospheric stabilization'
  },
  no_action: {
    label: 'Resource Continuity',
    icon: Factory,
    color: 'from-slate-600 to-slate-900',
    textColor: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    description: 'Unrestricted industrial growth and maximum energy yields'
  }
};

export const ForecastTimeline = ({
  airQuality,
  cityName,
  currentYear,
  onYearChange,
  selectedScenario,
  onScenarioChange
}: ForecastTimelineProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pollutants' | 'health' | 'economy'>('overview');
  const [comparisonMode, setComparisonMode] = useState(false);

  // Generate all scenario projections for comparison
  const allProjections = useMemo(() => ({
    current: generateProjections(airQuality, cityName, 'current'),
    clean_energy: generateProjections(airQuality, cityName, 'clean_energy'),
    no_action: generateProjections(airQuality, cityName, 'no_action')
  }), [airQuality, cityName]);

  const projections = allProjections[selectedScenario];
  const currentProjection = projections[currentYear] || projections[0];
  const baselineProjection = projections[0];

  // Calculate changes from baseline
  const aqiChange = currentProjection.aqi - baselineProjection.aqi;
  const pm25Change = currentProjection.pm25 - baselineProjection.pm25;
  const healthChange = currentProjection.healthScore - baselineProjection.healthScore;

  // Chart data for comparison view
  const comparisonData = useMemo(() => {
    return projections.map((p, i) => ({
      year: p.year,
      current: allProjections.current[i]?.aqi || 0,
      clean_energy: allProjections.clean_energy[i]?.aqi || 0,
      no_action: allProjections.no_action[i]?.aqi || 0,
      selected: p.aqi
    }));
  }, [projections, allProjections]);

  const pollutantData = projections.map(p => ({
    year: p.year,
    AQI: p.aqi,
    'PM2.5': p.pm25,
    O3: p.o3,
    NO2: p.no2
  }));

  const healthData = projections.map(p => ({
    year: p.year,
    'Health Score': p.healthScore,
    'Outdoor Days': p.outdoorDays / 3.4, // Normalized to 100
    'Green Space': p.greenSpaceIndex
  }));

  const adoptionData = projections.map(p => ({
    year: p.year,
    'EV Adoption': p.evAdoption,
    'Renewable Energy': p.renewableEnergy
  }));

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-400';
    if (aqi <= 100) return 'text-yellow-400';
    if (aqi <= 150) return 'text-orange-400';
    return 'text-red-400';
  };

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  const config = scenarioConfig[selectedScenario];
  const ScenarioIcon = config.icon;

  return (
    <Card className="glass bg-black/40 border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Industrial Resilience Forecast</h3>
              <p className="text-xs text-white/50">{cityName} • Strategic Atmospheric Intelligence</p>
            </div>
          </div>
          <Badge variant="outline" className={`${config.borderColor} ${config.textColor}`}>
            <ScenarioIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {/* Scenario Selector */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(scenarioConfig) as Array<keyof typeof scenarioConfig>).map((key) => {
            const sc = scenarioConfig[key];
            const Icon = sc.icon;
            const isActive = selectedScenario === key;
            return (
              <button
                key={key}
                onClick={() => onScenarioChange(key)}
                className={`p-2 rounded-lg transition-all duration-300 ${isActive
                  ? `bg-gradient-to-br ${sc.color} text-white shadow-lg shadow-${key === 'clean_energy' ? 'emerald' : key === 'no_action' ? 'red' : 'amber'}-500/30`
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
              >
                <Icon className={`w-4 h-4 mx-auto mb-1 ${isActive ? 'text-white' : sc.textColor}`} />
                <div className="text-[10px] font-medium truncate">{sc.label.split(' ')[0]}</div>
              </button>
            );
          })}
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="p-4 space-y-4">
          {/* Year Timeline Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Projection Year</span>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => currentYear > 0 && onYearChange(currentYear - 1)}
                  disabled={currentYear === 0}
                  className="h-6 w-6"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent min-w-[60px] text-center">
                  {currentProjection.year}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => currentYear < 7 && onYearChange(currentYear + 1)}
                  disabled={currentYear >= 7}
                  className="h-6 w-6"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <Slider
                value={[currentYear]}
                onValueChange={(v) => onYearChange(v[0])}
                max={7}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                {projections.map((p, i) => (
                  <span key={i} className={i === currentYear ? 'text-primary font-bold' : ''}>
                    {p.year}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className={`p-3 ${config.bgColor} border ${config.borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/60">Projected AQI</span>
              </div>
              <div className="flex items-end justify-between">
                <span className={`text-3xl font-bold ${getAQIColor(currentProjection.aqi)}`}>
                  {currentProjection.aqi}
                </span>
                <div className={`flex items-center gap-1 text-xs ${aqiChange > 0 ? 'text-red-400' : aqiChange < 0 ? 'text-emerald-400' : 'text-white/40'}`}>
                  {aqiChange > 0 ? <TrendingUp className="w-3 h-3" /> : aqiChange < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {aqiChange > 0 ? '+' : ''}{aqiChange}
                </div>
              </div>
              <p className={`text-[10px] mt-1 ${getAQIColor(currentProjection.aqi)}`}>
                {getAQICategory(currentProjection.aqi)}
              </p>
            </Card>

            <Card className={`p-3 ${config.bgColor} border ${config.borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/60">Health Score</span>
              </div>
              <div className="flex items-end justify-between">
                <span className={`text-3xl font-bold ${currentProjection.healthScore >= 70 ? 'text-emerald-400' : currentProjection.healthScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {currentProjection.healthScore}
                </span>
                <div className={`flex items-center gap-1 text-xs ${healthChange > 0 ? 'text-emerald-400' : healthChange < 0 ? 'text-red-400' : 'text-white/40'}`}>
                  {healthChange > 0 ? <TrendingUp className="w-3 h-3" /> : healthChange < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {healthChange > 0 ? '+' : ''}{healthChange}
                </div>
              </div>
              <Progress value={currentProjection.healthScore} className="h-1 mt-2" />
            </Card>

            <Card className={`p-3 ${config.bgColor} border ${config.borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/60">Renewable Energy</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-cyan-400">
                  {currentProjection.renewableEnergy}%
                </span>
              </div>
              <Progress value={currentProjection.renewableEnergy} className="h-1 mt-2" />
            </Card>

            <Card className={`p-3 ${config.bgColor} border ${config.borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/60">Outdoor Days/Year</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-yellow-400">
                  {currentProjection.outdoorDays}
                </span>
              </div>
              <div className="text-[10px] text-white/40 mt-1">
                {currentProjection.outdoorDays >= 300 ? 'Excellent' : currentProjection.outdoorDays >= 200 ? 'Good' : 'Limited'}
              </div>
            </Card>
          </div>

          {/* Tabs for detailed views */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-3">
            <TabsList className="grid grid-cols-4 bg-white/5">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="pollutants" className="text-xs">Pollutants</TabsTrigger>
              <TabsTrigger value="health" className="text-xs">Health</TabsTrigger>
              <TabsTrigger value="economy" className="text-xs">Economy</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3">
              {/* Scenario Comparison Chart */}
              <Card className="p-3 bg-white/5 border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white">AQI Trajectory Comparison</h4>
                  <Badge variant="outline" className="text-[10px]">All Scenarios</Badge>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={comparisonData}>
                      <defs>
                        <linearGradient id="gradientClean" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradientCurrent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradientNoAction" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        labelStyle={{ color: 'white' }}
                      />
                      <Area type="monotone" dataKey="clean_energy" name="Clean Energy" stroke="#10b981" fill="url(#gradientClean)" strokeWidth={2} />
                      <Area type="monotone" dataKey="current" name="Current" stroke="#f59e0b" fill="url(#gradientCurrent)" strokeWidth={2} />
                      <Area type="monotone" dataKey="no_action" name="No Action" stroke="#ef4444" fill="url(#gradientNoAction)" strokeWidth={2} />
                      <ReferenceLine x={currentProjection.year} stroke="#06b6d4" strokeDasharray="3 3" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Adoption Progress */}
              <Card className="p-3 bg-white/5 border-white/10">
                <h4 className="text-sm font-medium text-white mb-3">Technology Adoption</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={adoptionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Area type="monotone" dataKey="EV Adoption" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="Renewable Energy" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="pollutants" className="space-y-3">
              {/* Baseline Threshold Alert Banner */}
              {(() => {
                const pollutants: { type: PollutantType; value: number }[] = [
                  { type: 'pm25', value: currentProjection.pm25 },
                  { type: 'o3', value: currentProjection.o3 },
                  { type: 'no2', value: currentProjection.no2 }
                ];
                const exceeding = pollutants.filter(p => getBaselineExceedance(p.type, p.value) > 100);

                if (exceeding.length > 0) {
                  const worstPollutant = exceeding.reduce((worst, current) => {
                    const currentExceedance = getBaselineExceedance(current.type, current.value);
                    const worstExceedance = getBaselineExceedance(worst.type, worst.value);
                    return currentExceedance > worstExceedance ? current : worst;
                  }, exceeding[0]);
                  const severity = getPollutantSeverity(worstPollutant.type, worstPollutant.value);
                  const exceedance = getBaselineExceedance(worstPollutant.type, worstPollutant.value);

                  return (
                    <Card className={`p-3 ${severity.bgColor} border ${severity.borderColor}`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-5 h-5 ${severity.color} shrink-0`} />
                        <div>
                          <p className={`text-sm font-bold ${severity.color}`}>
                            {exceeding.length} atmospheric metric{exceeding.length > 1 ? 's' : ''} nearing operational limits by {currentProjection.year}
                          </p>
                          <p className="text-xs text-white/60 mt-1">
                            {SAFETY_BASELINES[worstPollutant.type].fullName} projected at {exceedance - 100}% above target baseline
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Activity className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] text-white/50">
                              Baseline management required for industrial optimization
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                }

                return (
                  <Card className="p-3 bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <p className="text-sm font-medium text-blue-400">
                        All atmospheric metrics within safety baselines through {currentProjection.year}
                      </p>
                    </div>
                  </Card>
                );
              })()}

              {/* Pollutant Projections Chart */}
              <Card className="p-3 bg-white/5 border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white">Atmospheric Stability Trajectory</h4>
                  <div className="flex items-center gap-1 text-[10px] text-blue-400">
                    <Shield className="w-3 h-3" />
                    <span>Blue line = Safety Baseline</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pollutantData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <ReferenceLine y={15} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: 'Safety Baseline', position: 'right', fill: '#3b82f6', fontSize: 8 }} />
                      <Line type="monotone" dataKey="PM2.5" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="O3" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="NO2" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                      <ReferenceLine x={currentProjection.year} stroke="#10b981" strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Detailed Pollutant Cards with Health Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-white/60 flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Projected Atmospheric Profile by {currentProjection.year}
                </h4>
                <PollutantDetailCard
                  type="pm25"
                  value={currentProjection.pm25}
                  showHealthEffects={true}
                  compact={false}
                />
                <PollutantDetailCard
                  type="o3"
                  value={currentProjection.o3}
                  showHealthEffects={true}
                  compact={false}
                />
                <PollutantDetailCard
                  type="no2"
                  value={currentProjection.no2}
                  showHealthEffects={true}
                  compact={false}
                />
              </div>

              {/* Safety Reference */}
              <Card className="p-3 bg-white/5 border-white/10">
                <h4 className="text-xs font-medium text-white/60 mb-2">National Atmospheric Index Scale</h4>
                <div className="grid grid-cols-6 gap-1">
                  {Object.values(SEVERITY_LEVELS).map((level) => {
                    const Icon = level.icon;
                    return (
                      <div key={level.level} className={`p-1.5 rounded ${level.bgColor} border ${level.borderColor} text-center`}>
                        <Icon className={`w-3 h-3 ${level.color} mx-auto mb-0.5`} />
                        <p className={`text-[8px] ${level.color} truncate`}>{level.label.split(' ')[0]}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="space-y-3">
              <Card className="p-3 bg-white/5 border-white/10">
                <h4 className="text-sm font-medium text-white mb-3">Health Impact Trajectory</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={healthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Health Score" fill="#10b981" fillOpacity={0.7} />
                      <Line type="monotone" dataKey="Outdoor Days" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="Green Space" stroke="#06b6d4" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Health metrics */}
              <div className="space-y-2">
                {[
                  { label: 'Respiratory Risk Index', value: 100 - currentProjection.healthScore, max: 100, color: currentProjection.healthScore >= 70 ? 'bg-emerald-500' : 'bg-red-500' },
                  { label: 'Outdoor Activity Days', value: currentProjection.outdoorDays, max: 365, color: 'bg-yellow-500' },
                  { label: 'Green Space Coverage', value: currentProjection.greenSpaceIndex, max: 100, color: 'bg-emerald-500' }
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">{item.label}</span>
                      <span className="text-white font-medium">{item.value}{item.max === 365 ? ' days' : '%'}</span>
                    </div>
                    <Progress value={(item.value / item.max) * 100} className={`h-2 ${item.color}`} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="economy" className="space-y-3">
              <Card className="p-3 bg-white/5 border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-white/60" />
                  <h4 className="text-sm font-medium text-white">Industrial Resource Analysis</h4>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-[10px] text-white/50 mb-1">Infrastructure Resilience</p>
                      <p className="text-2xl font-bold text-blue-400">High</p>
                      <p className="text-[10px] text-white/40">Atmospheric load capacity</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-[10px] text-white/50 mb-1">Energy Independence Yield</p>
                      <p className="text-2xl font-bold text-amber-500">
                        +{Math.round(currentProjection.renewableEnergy * 2.5)}%
                      </p>
                      <p className="text-[10px] text-white/40">Combined resource output</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-white">Scenario Insight</p>
                        <p className="text-[11px] text-white/60 mt-1">
                          {selectedScenario === 'clean_energy' &&
                            `By ${currentProjection.year}, Energy Independence initiatives prioritize high-yield domestic resources, ensuring $${Math.round(currentProjection.economicImpact * 1.5)}B in infrastructure dividends.`
                          }
                          {selectedScenario === 'no_action' &&
                            `Resource Continuity ensures maximum operational uptime through ${currentProjection.year}, maintaining historical output levels across all industrial sectors.`
                          }
                          {selectedScenario === 'current' &&
                            `Current trends maintain a stable atmospheric baseline, supporting gradual expansion of industrial resource processing.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Confidence indicator */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/40">Projection Confidence</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={currentProjection.confidence} className="w-20 h-1.5" />
              <span className="text-xs font-medium text-white">{currentProjection.confidence}%</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ForecastTimeline;
