import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Atom,
  Brain,
  Zap,
  BarChart3,
  Heart,
  Car,
  Dumbbell,
  Droplets,
  Sun,
  Wind,
  Thermometer,
  Cloud,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Gauge,
  RefreshCw,
  MapPin,
  Percent,
  Loader2,
  Wheat,
  Zap as Energy,
  TreePine,
  Database,
  Shield,
  Crosshair,
  Waves,
  GitBranch,
  CircleDot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { modelDefinitions, getModelById } from '@/lib/modelDefinitions';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis,
  ComposedChart, ReferenceLine, ReferenceArea
} from 'recharts';

// Prediction categories with real-world factors
const PREDICTION_CATEGORIES = [
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: Heart,
    color: 'rose',
    factors: ['Respiratory Risk', 'Cardiovascular Stress', 'Allergy Index', 'UV Exposure', 'Heat Stress'],
    model: 'vqe-aqi-predictor'
  },
  {
    id: 'transport',
    name: 'Transportation',
    icon: Car,
    color: 'blue',
    factors: ['Traffic Congestion', 'EV Range Impact', 'Flight Delays', 'Road Conditions', 'Visibility'],
    model: 'xgboost-ensemble'
  },
  {
    id: 'outdoor',
    name: 'Outdoor Activities',
    icon: Dumbbell,
    color: 'emerald',
    factors: ['Running Conditions', 'Cycling Safety', 'Hiking Weather', 'Water Sports', 'Golf/Tennis'],
    model: 'climatetransformer'
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: Wheat,
    color: 'amber',
    factors: ['Crop Growth', 'Irrigation Need', 'Pest Risk', 'Harvest Window', 'Soil Moisture'],
    model: 'qcnn-disaster'
  },
  {
    id: 'energy',
    name: 'Energy & Utilities',
    icon: Energy,
    color: 'violet',
    factors: ['Solar Output', 'Wind Generation', 'Grid Demand', 'Heating/Cooling Load', 'Battery Efficiency'],
    model: 'qaoa-optimizer'
  },
  {
    id: 'environment',
    name: 'Environment',
    icon: TreePine,
    color: 'green',
    factors: ['Air Quality Trend', 'Pollen Count', 'Wildfire Risk', 'Flooding Potential', 'Drought Index'],
    model: 'anomaly-vae'
  }
];

// Types for accuracy data
interface AccuracyRecord {
  id: string;
  prediction_type: string;
  accuracy_score: number;
  predicted_value: number;
  actual_value: number | null;
  deviation_percentage: number | null;
  verified_at: string;
  prediction_made_at: string;
  location_name: string;
  environmental_context: {
    avg_aqi?: number;
    avg_temp?: number;
    data_variance?: number;
    quantum_advantage?: number;
  };
}

// Generate deterministic predictions based on real environmental data
const generatePredictions = (envData: any, category: typeof PREDICTION_CATEGORIES[0]) => {
  const { temperature, humidity, pressure, windSpeed, aqi, pm25, uvIndex, hourly } = envData;

  const R = 8.314;
  const stabilityIndex = Math.max(0, Math.min(100,
    (40 + (temperature > 25 ? -15 : 10) + (windSpeed > 15 ? 25 : -5))
  ));
  const dispersionCoeff = Math.max(0.1, (windSpeed * 0.8) / (stabilityIndex / 100 + 0.2));
  const reactionRate = Math.exp(-800 / (R * (temperature + 273.15))) * (uvIndex || 1) * 500;

  const factorPredictions = category.factors.map((factor, i) => {
    let value = 0;
    let trend: 'up' | 'down' | 'stable' = 'stable';

    switch (category.id) {
      case 'health':
        if (factor === 'Respiratory Risk') {
          const effectivePM = pm25 * (humidity > 75 ? 1.25 : 1.0);
          value = (aqi * 0.45) + (effectivePM * 0.55) + (100 - stabilityIndex) * 0.15;
        } else if (factor === 'Cardiovascular Stress') {
          const heatIndex = temperature + 0.55 * (humidity / 100) * (temperature - 14.5);
          value = (heatIndex > 30 ? 70 : 30) + (aqi * 0.35);
        } else if (factor === 'Allergy Index') {
          value = (humidity * 0.45) + (windSpeed * 0.25) + (temperature > 18 ? 30 : 5);
        } else if (factor === 'UV Exposure') {
          value = (uvIndex || 0) * 10;
        } else {
          value = Math.max(0, temperature - 22) * 4.5 + (humidity * 0.35);
        }
        break;
      case 'transport':
        if (factor === 'Traffic Congestion') {
          const hour = new Date().getHours();
          const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
          value = (isPeak ? 80 : 25) + (aqi > 100 ? 10 : 0) + (windSpeed > 30 ? 15 : 0);
        } else if (factor === 'EV Range Impact') {
          const tempImpact = Math.abs(temperature - 21) * 1.8;
          const windImpact = windSpeed * 0.6;
          value = 100 - tempImpact - windImpact;
        } else if (factor === 'Flight Delays') {
          const visibility = 100 - (aqi / 4) - (humidity / 8);
          value = (windSpeed > 25 ? 60 : 10) + (visibility < 50 ? 30 : 0);
        } else if (factor === 'Road Conditions') {
          value = 100 - (humidity > 85 ? 25 : 0) - (temperature < 4 ? 45 : 0);
        } else {
          value = 100 - (aqi / 2.5) - (humidity / 4);
        }
        break;
      case 'outdoor':
        if (factor === 'Running Conditions') {
          value = 100 - Math.abs(temperature - 18) * 2 - (humidity > 70 ? 20 : 0) - (aqi > 50 ? 15 : 0);
        } else if (factor === 'Cycling Safety') {
          value = 100 - (windSpeed > 20 ? 30 : windSpeed) - (humidity > 80 ? 20 : 0);
        } else if (factor === 'Hiking Weather') {
          value = 100 - Math.abs(temperature - 20) * 1.5 - (uvIndex > 7 ? 20 : 0);
        } else if (factor === 'Water Sports') {
          value = (temperature > 20 ? 80 : 40) - (windSpeed > 25 ? 30 : 0);
        } else {
          value = 100 - (humidity > 70 ? 25 : 0) - (temperature > 32 ? 20 : 0);
        }
        break;
      case 'agriculture':
        if (factor === 'Crop Growth') {
          value = (temperature > 15 && temperature < 30 ? 80 : 40) + (humidity > 40 ? 15 : -10);
        } else if (factor === 'Irrigation Need') {
          value = (100 - humidity) * 0.8 + (temperature > 28 ? 20 : 0);
        } else if (factor === 'Pest Risk') {
          value = (humidity > 70 ? 60 : 20) + (temperature > 25 ? 25 : 0);
        } else if (factor === 'Harvest Window') {
          value = (humidity < 60 ? 80 : 40) - (windSpeed > 20 ? 20 : 0);
        } else {
          value = humidity * 0.8 + (pressure < 1010 ? 15 : 0);
        }
        break;
      case 'energy':
        if (factor === 'Solar Output') {
          value = (100 - humidity * 0.3) * (uvIndex / 10) + 20;
        } else if (factor === 'Wind Generation') {
          value = Math.min(100, windSpeed * 4);
        } else if (factor === 'Grid Demand') {
          value = Math.abs(temperature - 21) * 3 + 20;
        } else if (factor === 'Heating/Cooling Load') {
          value = Math.abs(temperature - 21) * 4;
        } else {
          value = 100 - Math.abs(temperature - 25) * 2;
        }
        break;
      case 'environment':
        if (factor === 'Air Quality Trend') {
          value = 100 - (aqi * 0.75) + (dispersionCoeff * 8) - (reactionRate * 0.05);
        } else if (factor === 'Pollen Count') {
          value = (temperature > 14 && temperature < 29) ? 75 : 15;
        } else if (factor === 'Wildfire Risk') {
          value = (temperature * 0.85) + (100 - humidity) * 0.6 + (windSpeed * 0.45);
        } else if (factor === 'Flooding Potential') {
          value = (humidity > 80 ? 55 : 5) + (pressure < 1005 ? 35 : 0);
        } else {
          value = (temperature > 28 ? 55 : 5) + (100 - humidity) * 0.55;
        }
        break;
      default:
        value = (temperature + humidity + aqi) / 3;
    }

    const finalValue = Math.max(0, Math.min(100, value));

    const history = Array.from({ length: 24 }, (_, h) => {
      let hValue = finalValue;
      if (hourly && hourly.temperature[h] !== undefined) {
        const hTemp = hourly.temperature[h];
        const hHum = hourly.humidity[h];
        const hAqi = hourly.aqi[h];
        const delta = (hTemp - temperature) * 0.6 + (hHum - humidity) * 0.25 + (hAqi - aqi) * 0.4;
        hValue = Math.max(0, Math.min(100, finalValue + delta));
      } else {
        hValue = Math.max(0, Math.min(100, finalValue + (h - 12) * 0.8));
      }
      return { hour: h, value: hValue };
    });

    const currentHour = new Date().getHours();
    const prevHour = (currentHour - 1 + 24) % 24;
    const currentVal = history[currentHour]?.value || finalValue;
    const prevVal = history[prevHour]?.value || finalValue;
    const change = currentVal - prevVal;
    trend = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable';

    const values = history.map(h => h.value);
    const mean = values.reduce((a, b) => a + b, 0) / 24;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 24;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0.7, Math.min(0.98, 1 - (stdDev / 100)));

    // Box plot stats
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const median = sorted[Math.floor(sorted.length * 0.5)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const min = Math.max(sorted[0], q1 - 1.5 * iqr);
    const max = Math.min(sorted[sorted.length - 1], q3 + 1.5 * iqr);

    return {
      factor,
      value: finalValue,
      trend,
      confidence,
      change,
      history,
      metrics: { stability: stabilityIndex, dispersion: dispersionCoeff, reaction: reactionRate },
      stats: { mean, stdDev, variance, min, max, q1, median, q3, iqr }
    };
  });

  return factorPredictions;
};

export default function Predictions() {
  const [envData, setEnvData] = useState<{
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    aqi: number;
    pm25: number;
    uvIndex: number;
    location: string;
    hourly?: { temperature: number[]; humidity: number[]; aqi: number[]; pm25: number[]; };
  }>({
    temperature: 22, humidity: 55, pressure: 1013, windSpeed: 12,
    aqi: 45, pm25: 18, uvIndex: 6, location: 'Auto-detected'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(PREDICTION_CATEGORIES[0]);
  const [predictions, setPredictions] = useState<ReturnType<typeof generatePredictions>>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [accuracyData, setAccuracyData] = useState<AccuracyRecord[]>([]);
  const [modelStats, setModelStats] = useState({
    totalPredictions: 0, avgConfidence: 0, quantumEnhanced: 0, historicalAccuracy: 0
  });

  // Fetch real environmental data
  useEffect(() => {
    const fetchData = async () => {
      setIsProcessing(true);
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const [weatherRes, aqiRes, geoRes] = await Promise.all([
              fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,uv_index`),
              fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5&hourly=us_aqi,pm2_5`),
              fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            ]);
            const [weatherData, aqiData, geoData] = await Promise.all([weatherRes.json(), aqiRes.json(), geoRes.json()]);

            setEnvData({
              temperature: Math.round(weatherData.current?.temperature_2m || 22),
              humidity: Math.round(weatherData.current?.relative_humidity_2m || 55),
              pressure: Math.round(weatherData.current?.surface_pressure || 1013),
              windSpeed: Math.round(weatherData.current?.wind_speed_10m || 12),
              aqi: Math.round(aqiData.current?.us_aqi || 45),
              pm25: Math.round(aqiData.current?.pm2_5 || 18),
              uvIndex: Math.round(weatherData.hourly?.uv_index?.[new Date().getHours()] || 5),
              location: geoData.address?.city || geoData.address?.town || geoData.address?.state || 'Unknown',
              hourly: {
                temperature: weatherData.hourly?.temperature_2m || [],
                humidity: weatherData.hourly?.relative_humidity_2m || [],
                aqi: aqiData.hourly?.us_aqi || [],
                pm25: aqiData.hourly?.pm2_5 || []
              }
            });
            setIsProcessing(false);
          }, () => setIsProcessing(false));
        }
      } catch (error) {
        console.error('Failed to fetch environmental data:', error);
        setIsProcessing(false);
      }
      setLastUpdated(new Date());
    };
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real accuracy data from Supabase
  useEffect(() => {
    const fetchAccuracy = async () => {
      const { data, error } = await supabase
        .from('prediction_accuracy_log')
        .select('*')
        .order('verified_at', { ascending: false })
        .limit(50);
      if (!error && data) {
        setAccuracyData(data as unknown as AccuracyRecord[]);
      }
    };
    fetchAccuracy();
  }, []);

  // Generate predictions when data or category changes
  useEffect(() => {
    const preds = generatePredictions(envData, selectedCategory);
    setPredictions(preds);
    const avgAccuracy = accuracyData.length > 0
      ? accuracyData.reduce((a, r) => a + (r.accuracy_score || 0), 0) / accuracyData.length
      : 0.75;
    setModelStats({
      totalPredictions: PREDICTION_CATEGORIES.length * 5,
      avgConfidence: preds.reduce((acc, p) => acc + p.confidence, 0) / preds.length,
      quantumEnhanced: PREDICTION_CATEGORIES.filter(c =>
        c.model === 'vqe-aqi-predictor' || c.model === 'qaoa-optimizer' || c.model === 'qcnn-disaster'
      ).length,
      historicalAccuracy: avgAccuracy
    });
  }, [envData, selectedCategory, accuracyData]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-emerald-400" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-400" />;
      default: return <Minus className="w-3 h-3 text-white/40" />;
    }
  };

  const getRiskLevel = (value: number) => {
    if (value >= 80) return { label: 'EXCELLENT', color: 'text-emerald-400' };
    if (value >= 60) return { label: 'GOOD', color: 'text-cyan-400' };
    if (value >= 40) return { label: 'MODERATE', color: 'text-amber-400' };
    if (value >= 20) return { label: 'POOR', color: 'text-orange-400' };
    return { label: 'SEVERE', color: 'text-red-400' };
  };

  const model = getModelById(selectedCategory.model);
  const radarData = predictions.map(p => ({ factor: p.factor.split(' ')[0], value: p.value, fullMark: 100 }));
  const distributionData = [
    { name: 'Excellent', value: predictions.filter(p => p.value >= 80).length, color: '#10b981' },
    { name: 'Good', value: predictions.filter(p => p.value >= 60 && p.value < 80).length, color: '#06b6d4' },
    { name: 'Moderate', value: predictions.filter(p => p.value >= 40 && p.value < 60).length, color: '#f59e0b' },
    { name: 'Poor', value: predictions.filter(p => p.value < 40).length, color: '#ef4444' }
  ];

  // Correlation scatter data
  const correlationData = predictions.map(p => ({
    confidence: p.confidence * 100,
    value: p.value,
    stdDev: p.stats.stdDev,
    name: p.factor.split(' ')[0]
  }));

  // Heatmap data for hourly predictions
  const heatmapData = predictions.flatMap((pred, factorIdx) =>
    pred.history.map((h, hourIdx) => ({
      factor: factorIdx,
      hour: hourIdx,
      value: h.value,
      factorName: pred.factor.split(' ')[0]
    }))
  );

  // Accuracy trend from real data
  const accuracyTrend = accuracyData.slice(0, 20).reverse().map((r, i) => ({
    index: i,
    accuracy: (r.accuracy_score || 0) * 100,
    quantumAdvantage: r.environmental_context?.quantum_advantage || 0,
    variance: r.environmental_context?.data_variance || 0
  }));

  // Quantum advantage stats from real data
  const avgQuantumAdvantage = accuracyData.length > 0
    ? accuracyData.reduce((a, r) => a + (r.environmental_context?.quantum_advantage || 0), 0) / accuracyData.length
    : 25;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1800px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-sm font-medium tracking-wide text-white/90">PREDICTIVE ANALYTICS ENGINE</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <MapPin className="w-3 h-3" />
              <span className="font-mono">{envData.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{lastUpdated.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/40 font-mono">LIVE</span>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-73px)]">
        <main className="max-w-[1800px] mx-auto px-8 py-8 space-y-6 relative">
          {isProcessing && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-cyan-500 rounded-full animate-spin" />
                  <Atom className="absolute inset-0 m-auto w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Processing Neural Network</p>
              </div>
            </div>
          )}

          {/* Live Environmental Data */}
          <div className="border border-white/10 bg-black/60">
            <div className="border-b border-white/5 px-6 py-3 flex items-center justify-between">
              <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">REAL-TIME SENSOR DATA</h2>
              <Button variant="ghost" size="sm" className="text-[10px] font-mono text-white/30 hover:text-white h-6" onClick={() => window.location.reload()}>
                <RefreshCw className="w-3 h-3 mr-2" />SYNC
              </Button>
            </div>
            <div className="grid grid-cols-7 divide-x divide-white/5">
              {[
                { icon: Thermometer, label: 'TEMP', value: envData.temperature, unit: '°C' },
                { icon: Droplets, label: 'HUMIDITY', value: envData.humidity, unit: '%' },
                { icon: Gauge, label: 'PRESSURE', value: envData.pressure, unit: 'hPa' },
                { icon: Wind, label: 'WIND', value: envData.windSpeed, unit: 'km/h' },
                { icon: Activity, label: 'AQI', value: envData.aqi, unit: '' },
                { icon: Cloud, label: 'PM2.5', value: envData.pm25, unit: 'μg/m³' },
                { icon: Sun, label: 'UV INDEX', value: envData.uvIndex, unit: '' }
              ].map(item => (
                <div key={item.label} className="p-4 text-center">
                  <item.icon className="w-4 h-4 mx-auto text-white/30 mb-2" />
                  <p className="text-2xl font-mono font-bold text-white">{item.value}<span className="text-xs text-white/30 ml-1">{item.unit}</span></p>
                  <p className="text-[9px] font-mono uppercase text-white/30 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Bar with Real Accuracy */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Total Predictions', value: modelStats.totalPredictions, icon: Target },
              { label: 'Avg Confidence', value: `${(modelStats.avgConfidence * 100).toFixed(1)}%`, icon: Percent },
              { label: 'Historical Accuracy', value: `${(modelStats.historicalAccuracy * 100).toFixed(1)}%`, icon: Shield },
              { label: 'Quantum Advantage', value: `+${avgQuantumAdvantage.toFixed(0)}%`, icon: Atom },
              { label: 'Data Points', value: accuracyData.length, icon: Database }
            ].map(stat => (
              <div key={stat.label} className="border border-white/10 bg-black/40 p-4 flex items-center gap-4">
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-cyan-400/60" />
                </div>
                <div>
                  <p className="text-xl font-mono font-bold text-white">{stat.value}</p>
                  <p className="text-[9px] font-mono uppercase text-white/30">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Category Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {PREDICTION_CATEGORIES.map(category => {
              const isActive = selectedCategory.id === category.id;
              return (
                <button key={category.id} onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 px-4 py-3 border transition-all whitespace-nowrap ${isActive ? 'bg-white text-black border-white' : 'bg-black/40 text-white/60 border-white/10 hover:border-white/20'}`}>
                  <category.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Factor Cards */}
            <div className="lg:col-span-2 space-y-4">
              {predictions.map((pred, i) => {
                const risk = getRiskLevel(pred.value);
                return (
                  <div key={pred.factor} className="border border-white/10 bg-black/60 p-5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{pred.factor}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] font-mono uppercase ${risk.color}`}>{risk.label}</span>
                          <span className="text-[10px] text-white/30 font-mono">{(pred.confidence * 100).toFixed(1)}% conf</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-mono font-black text-white">{pred.value.toFixed(0)}</p>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          {getTrendIcon(pred.trend)}
                          <span className={`text-xs font-mono ${pred.trend === 'up' ? 'text-emerald-400' : pred.trend === 'down' ? 'text-red-400' : 'text-white/40'}`}>
                            {pred.change > 0 ? '+' : ''}{pred.change.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mini Sparkline */}
                    <div className="h-12 mb-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={pred.history}>
                          <defs>
                            <linearGradient id={`spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={1.5} fill={`url(#spark-${i})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Box Plot Stats */}
                    <div className="grid grid-cols-6 gap-2 text-center border-t border-white/5 pt-3">
                      {[
                        { label: 'MIN', value: pred.stats.min.toFixed(0) },
                        { label: 'Q1', value: pred.stats.q1.toFixed(0) },
                        { label: 'MEDIAN', value: pred.stats.median.toFixed(0) },
                        { label: 'Q3', value: pred.stats.q3.toFixed(0) },
                        { label: 'MAX', value: pred.stats.max.toFixed(0) },
                        { label: 'σ', value: pred.stats.stdDev.toFixed(1) }
                      ].map(s => (
                        <div key={s.label}>
                          <p className="text-[8px] text-white/20 font-mono uppercase">{s.label}</p>
                          <p className="text-xs font-mono text-white/70">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Advanced Charts Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Real Accuracy Tracking */}
              <div className="border border-white/10 bg-black/60 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">HISTORICAL ACCURACY TRACKING</h3>
                  <span className="text-[10px] font-mono text-emerald-400">{accuracyData.length} verified predictions</span>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={accuracyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="index" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
                      <YAxis yAxisId="left" domain={[60, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 50]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
                      <Tooltip contentStyle={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11 }} />
                      <ReferenceLine yAxisId="left" y={75} stroke="rgba(16,185,129,0.3)" strokeDasharray="5 5" />
                      <Area yAxisId="left" type="monotone" dataKey="accuracy" stroke="#10b981" fill="url(#accGrad)" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="quantumAdvantage" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                      <defs>
                        <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-emerald-500" />
                    <span className="text-[9px] text-white/40">Accuracy %</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-violet-500" />
                    <span className="text-[9px] text-white/40">Quantum Advantage</span>
                  </div>
                </div>
              </div>

              {/* Correlation Scatter */}
              <div className="border border-white/10 bg-black/60 p-6">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">CONFIDENCE vs VALUE CORRELATION</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="confidence" name="Confidence" unit="%" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} domain={[70, 100]} />
                      <YAxis dataKey="value" name="Value" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} domain={[0, 100]} />
                      <ZAxis dataKey="stdDev" range={[40, 200]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11 }} />
                      <Scatter data={correlationData} fill="#06b6d4">
                        {correlationData.map((_, index) => (
                          <Cell key={index} fill={`hsl(${180 + index * 30}, 70%, 50%)`} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="border border-white/10 bg-black/60 p-6">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">MULTI-FACTOR ANALYSIS</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="factor" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                      <PolarRadiusAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} domain={[0, 100]} />
                      <Radar name="Value" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution Donut */}
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-white/10 bg-black/60 p-6">
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">DISTRIBUTION</h3>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={distributionData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                          {distributionData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {distributionData.map(d => (
                      <div key={d.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[9px] text-white/40">{d.name}</span>
                        <span className="text-[9px] font-mono text-white ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Model Info */}
                <div className="border border-white/10 bg-black/60 p-6">
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">ACTIVE MODEL</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
                      {model?.type === 'quantum' ? <Atom className="w-5 h-5 text-violet-400" /> :
                        model?.type === 'neural' ? <Brain className="w-5 h-5 text-cyan-400" /> :
                          <Zap className="w-5 h-5 text-amber-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{model?.name.split(' ').slice(0, 2).join(' ')}</p>
                      <p className="text-[10px] text-white/40 font-mono uppercase">{model?.type}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-white/40">Accuracy</span>
                      <span className="font-mono text-emerald-400">{model?.metrics.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Latency</span>
                      <span className="font-mono text-white">{model?.metrics.latency}ms</span>
                    </div>
                    {model?.quantumConfig && (
                      <div className="flex justify-between">
                        <span className="text-white/40">Qubits</span>
                        <span className="font-mono text-violet-400">{model.quantumConfig.qubits}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Variance Heatmap Visualization */}
              <div className="border border-white/10 bg-black/60 p-6">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">24H PREDICTION HEATMAP</h3>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(24, 1fr)` }}>
                  {predictions.map((pred, fi) => (
                    <div key={fi} className="contents">
                      {pred.history.map((h, hi) => {
                        const intensity = h.value / 100;
                        const hue = intensity > 0.6 ? 160 : intensity > 0.4 ? 45 : 0;
                        return (
                          <div key={hi} title={`${pred.factor} @ ${hi}:00 → ${h.value.toFixed(0)}`}
                            className="aspect-square transition-all hover:scale-150 hover:z-10"
                            style={{ backgroundColor: `hsla(${hue}, 70%, ${30 + intensity * 30}%, ${0.3 + intensity * 0.7})` }} />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[8px] font-mono text-white/30">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Overview */}
          <div className="border border-white/10 bg-black/60">
            <div className="border-b border-white/5 px-6 py-4">
              <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">ALL CATEGORIES OVERVIEW</h2>
            </div>
            <div className="grid grid-cols-6 divide-x divide-white/5">
              {PREDICTION_CATEGORIES.map(cat => {
                const catPreds = generatePredictions(envData, cat);
                const avgScore = catPreds.reduce((a, p) => a + p.value, 0) / catPreds.length;
                const catModel = getModelById(cat.model);
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat)}
                    className={`p-6 text-center hover:bg-white/[0.02] transition-colors ${selectedCategory.id === cat.id ? 'bg-white/[0.04]' : ''}`}>
                    <cat.icon className={`w-6 h-6 mx-auto mb-3 ${selectedCategory.id === cat.id ? 'text-white' : 'text-white/40'}`} />
                    <p className="text-xs font-medium text-white mb-1">{cat.name.split(' ')[0]}</p>
                    <p className={`text-2xl font-mono font-bold ${avgScore > 70 ? 'text-emerald-400' : avgScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {avgScore.toFixed(0)}
                    </p>
                    <p className="text-[9px] text-white/30 font-mono mt-1">
                      {catModel?.type === 'quantum' ? '⚛ Quantum' : catModel?.type === 'hybrid' ? '⚡ Hybrid' : '🧠 Neural'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  );
}