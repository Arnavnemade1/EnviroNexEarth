import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Radar
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
  User
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  calculateQuantumHealthRisk, 
  predictHealthTrend, 
  HealthProfile, 
  QuantumHealthAnalysis as QuantumHealthAnalysisType 
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
}

export const QuantumHealthAnalysisComponent = ({ cityName, currentAQI, airQuality, forecast }: QuantumHealthProps) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [healthProfile, setHealthProfile] = useState<HealthProfile>({
    age: 30,
    hasAsthma: false,
    hasHeartCondition: false,
    hasLungCondition: false,
    activityLevel: 'moderate',
    smokingStatus: 'never'
  });
  const [healthAnalysis, setHealthAnalysis] = useState<QuantumHealthAnalysisType | null>(null);
  const [healthTrend, setHealthTrend] = useState<Array<{ hour: number; riskScore: number; trend: string }>>([]);

  // Calculate quantum health analysis when data changes
  useEffect(() => {
    const analysis = calculateQuantumHealthRisk(
      airQuality.aqi,
      airQuality.pm25,
      airQuality.o3,
      airQuality.no2,
      healthProfile
    );
    setHealthAnalysis(analysis);

    if (forecast) {
      const trend = predictHealthTrend(analysis, forecast, airQuality.o3, airQuality.no2);
      setHealthTrend(trend);
    }
  }, [airQuality, healthProfile, forecast]);

  const getRiskColor = (risk: string) => {
    const colors = {
      'very-low': 'hsl(var(--chart-1))', // Green
      'low': 'hsl(var(--chart-2))', // Light green
      'moderate': 'hsl(var(--chart-3))', // Yellow
      'high': 'hsl(var(--chart-4))', // Orange
      'very-high': 'hsl(var(--chart-5))' // Red
    };
    return colors[risk as keyof typeof colors] || colors['moderate'];
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'safe': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'limited': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'avoid': return <Shield className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  if (!healthAnalysis) return <div>Loading health analysis...</div>;

  // Radar chart data for comprehensive health risk
  const radarData = [
    { factor: 'Air Quality', value: Math.min(100, airQuality.aqi * 0.67) },
    { factor: 'PM2.5 Risk', value: Math.min(100, airQuality.pm25 * 2.86) },
    { factor: 'Ozone Impact', value: Math.min(100, airQuality.o3) },
    { factor: 'Personal Risk', value: healthAnalysis.riskScore },
    { factor: 'Quantum Coherence', value: healthAnalysis.quantumCoherence },
    { factor: 'Activity Safety', value: healthAnalysis.activitySafety.outdoor === 'safe' ? 20 : 
                                       healthAnalysis.activitySafety.outdoor === 'limited' ? 60 : 90 }
  ];

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-6 pr-4">
      {/* Header with Overall Risk */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Atom className="w-6 h-6 text-primary-foreground animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Quantum Health Analysis</h2>
              <p className="text-muted-foreground">{cityName} • Real-time Risk Assessment</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="text-lg px-4 py-2"
            style={{ borderColor: getRiskColor(healthAnalysis.overallRisk) }}
          >
            <Heart className="w-4 h-4 mr-2" />
            {healthAnalysis.overallRisk.toUpperCase()} RISK
          </Badge>
        </div>

        {/* Risk Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: getRiskColor(healthAnalysis.overallRisk) }}>
              {healthAnalysis.riskScore}/100
            </div>
            <p className="text-sm text-muted-foreground">Overall Risk Score</p>
            <Progress value={healthAnalysis.riskScore} className="mt-2" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 text-primary">
              {healthAnalysis.quantumCoherence}%
            </div>
            <p className="text-sm text-muted-foreground">Quantum Coherence</p>
            <Progress value={healthAnalysis.quantumCoherence} className="mt-2" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 text-accent">
              {healthAnalysis.timeToSafety || '—'}
            </div>
            <p className="text-sm text-muted-foreground">
              {healthAnalysis.timeToSafety ? 'Hours to Improvement' : 'Currently Improving'}
            </p>
            {healthAnalysis.timeToSafety && (
              <Progress value={Math.max(0, 100 - (healthAnalysis.timeToSafety / 24) * 100)} className="mt-2" />
            )}
          </div>
        </div>

        {/* Personalized Alerts */}
        {healthAnalysis.personalizedAlerts.length > 0 && (
          <div className="mt-4 p-4 bg-muted/20 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Personalized Health Alerts
            </h4>
            <div className="space-y-1">
              {healthAnalysis.personalizedAlerts.map((alert, index) => (
                <p key={index} className="text-sm">{alert}</p>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 glass">
          <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="activities">Activity Guide</TabsTrigger>
          <TabsTrigger value="profile">Health Profile</TabsTrigger>
          <TabsTrigger value="trends">Health Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Comprehensive Risk Radar */}
            <Card className="glass p-6">
              <h3 className="text-lg font-semibold mb-4">Quantum Risk Assessment</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="factor" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Risk Level"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="glass p-6">
              <h3 className="text-lg font-semibold mb-4">Quantum-Enhanced Recommendations</h3>
              <div className="space-y-3">
                {healthAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'outdoor', label: 'Outdoor Activities', icon: Activity },
              { key: 'exercise', label: 'Exercise', icon: Heart },
              { key: 'children', label: 'Children Activities', icon: Baby },
              { key: 'elderly', label: 'Elderly Care', icon: User }
            ].map(({ key, label, icon: Icon }) => (
              <Card key={key} className="glass p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-5 h-5" />
                  <h4 className="font-medium">{label}</h4>
                </div>
                <div className="flex items-center justify-between">
                  {getActivityIcon(healthAnalysis.activitySafety[key as keyof typeof healthAnalysis.activitySafety])}
                  <span className="text-sm font-medium capitalize">
                    {healthAnalysis.activitySafety[key as keyof typeof healthAnalysis.activitySafety].replace('-', ' ')}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Activity Timeline */}
          {healthTrend.length > 0 && (
            <Card className="glass p-6">
              <h3 className="text-lg font-semibold mb-4">12-Hour Activity Safety Forecast</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="hour" label={{ value: 'Hours ahead', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="glass p-3 rounded-lg">
                              <p className="font-medium">+{label} hours</p>
                              <p className="text-primary">Risk Score: {payload[0].value}</p>
                              <p className="text-secondary">Trend: {data.trend}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4">Personalize Your Health Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Age</label>
                  <Select 
                    value={healthProfile.age.toString()} 
                    onValueChange={(value) => setHealthProfile(prev => ({ ...prev, age: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Under 18</SelectItem>
                      <SelectItem value="25">18-30</SelectItem>
                      <SelectItem value="35">31-40</SelectItem>
                      <SelectItem value="45">41-50</SelectItem>
                      <SelectItem value="55">51-60</SelectItem>
                      <SelectItem value="70">Over 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Activity Level</label>
                  <Select 
                    value={healthProfile.activityLevel} 
                    onValueChange={(value: 'low' | 'moderate' | 'high') => 
                      setHealthProfile(prev => ({ ...prev, activityLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Activity</SelectItem>
                      <SelectItem value="moderate">Moderate Activity</SelectItem>
                      <SelectItem value="high">High Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Smoking Status</label>
                  <Select 
                    value={healthProfile.smokingStatus} 
                    onValueChange={(value: 'never' | 'former' | 'current') => 
                      setHealthProfile(prev => ({ ...prev, smokingStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never Smoked</SelectItem>
                      <SelectItem value="former">Former Smoker</SelectItem>
                      <SelectItem value="current">Current Smoker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-3 block">Health Conditions</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="asthma"
                        checked={healthProfile.hasAsthma}
                        onCheckedChange={(checked) => 
                          setHealthProfile(prev => ({ ...prev, hasAsthma: !!checked }))}
                      />
                      <label htmlFor="asthma" className="text-sm">Asthma</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="heart"
                        checked={healthProfile.hasHeartCondition}
                        onCheckedChange={(checked) => 
                          setHealthProfile(prev => ({ ...prev, hasHeartCondition: !!checked }))}
                      />
                      <label htmlFor="heart" className="text-sm">Heart Condition</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="lung"
                        checked={healthProfile.hasLungCondition}
                        onCheckedChange={(checked) => 
                          setHealthProfile(prev => ({ ...prev, hasLungCondition: !!checked }))}
                      />
                      <label htmlFor="lung" className="text-sm">Lung Condition</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {healthTrend.length > 0 ? (
            <Card className="glass p-6">
              <h3 className="text-lg font-semibold mb-4">Health Risk Trend Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="hour" label={{ value: 'Hours ahead', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          ) : (
            <Card className="glass p-6">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Health trend data will be available once forecast data is loaded.</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </ScrollArea>
  );
};

export { QuantumHealthAnalysisComponent as QuantumHealthAnalysis };