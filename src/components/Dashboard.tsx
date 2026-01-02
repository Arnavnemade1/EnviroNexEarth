import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Activity,
  Heart,
  MapPin,
  TrendingUp,
  Shield,
  Sparkles,
  Clock,
  Star,
  Bell,
  Settings,
  User,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  onClose: () => void;
  onSelectCity?: (city: string) => void;
}

interface SavedLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  is_favorite: boolean;
}

interface HealthData {
  overall_score: number;
  risk_level: 'low' | 'moderate' | 'high';
  daily_exposure: number;
  weekly_trend: 'improving' | 'stable' | 'worsening';
  recommendations: string[];
}

export const Dashboard = ({ onClose, onSelectCity }: DashboardProps) => {
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [exposureHistory, setExposureHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch saved locations
      const { data: locations, error: locError } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_favorite', { ascending: false });

      if (!locError && locations) {
        setSavedLocations(locations);
      }

      // Generate health analytics based on profile
      generateHealthAnalytics();
      generateExposureHistory();
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHealthAnalytics = () => {
    // Calculate health score based on user profile
    const profile = userProfile?.health_profile || {};
    let baseScore = 85;
    
    if (profile.air_sensitivity === 'high') baseScore -= 10;
    if (profile.smoking_status === 'current') baseScore -= 15;
    if (profile.age_range === '65+') baseScore -= 5;
    
    const recommendations = [];
    if (profile.air_sensitivity === 'high') {
      recommendations.push('Consider using an air purifier indoors during high AQI days');
    }
    if (!profile.activity_level || profile.activity_level === 'low') {
      recommendations.push('Light morning exercise when AQI is below 50 can improve respiratory health');
    }
    recommendations.push('Stay hydrated to help your body filter airborne particles');
    recommendations.push('Monitor your saved locations for real-time air quality updates');

    setHealthData({
      overall_score: Math.max(50, Math.min(95, baseScore + Math.random() * 10)),
      risk_level: baseScore > 75 ? 'low' : baseScore > 60 ? 'moderate' : 'high',
      daily_exposure: Math.floor(Math.random() * 40) + 20,
      weekly_trend: Math.random() > 0.5 ? 'improving' : 'stable',
      recommendations
    });
  };

  const generateExposureHistory = () => {
    const history = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        exposure: Math.floor(Math.random() * 50) + 20,
        aqi: Math.floor(Math.random() * 80) + 30,
        health: Math.floor(Math.random() * 20) + 75
      });
    }
    setExposureHistory(history);
  };

  const handleLocationClick = (city: string) => {
    if (onSelectCity) {
      onSelectCity(city);
      onClose();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully."
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />;
      case 'worsening': return <TrendingUp className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="glass p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading your dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <Card className="glass max-w-6xl mx-auto">
          {/* Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Welcome back{userProfile?.full_name ? `, ${userProfile.full_name.split(' ')[0]}` : ''}!
                  </h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                  Sign Out
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Health</span>
              </TabsTrigger>
              <TabsTrigger value="locations" className="gap-2">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Locations</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Health Score</span>
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {healthData?.overall_score?.toFixed(0)}%
                  </div>
                  <Progress value={healthData?.overall_score || 0} className="mt-2" />
                </Card>

                <Card className="glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Risk Level</span>
                    <Shield className={`w-4 h-4 ${getRiskColor(healthData?.risk_level || 'low')}`} />
                  </div>
                  <div className={`text-3xl font-bold capitalize ${getRiskColor(healthData?.risk_level || 'low')}`}>
                    {healthData?.risk_level || 'Low'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Based on your profile</p>
                </Card>

                <Card className="glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Weekly Trend</span>
                    {getTrendIcon(healthData?.weekly_trend || 'stable')}
                  </div>
                  <div className="text-3xl font-bold capitalize text-foreground">
                    {healthData?.weekly_trend || 'Stable'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Air quality exposure</p>
                </Card>
              </div>

              {/* Exposure Chart */}
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  7-Day Health & Exposure Trend
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={exposureHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="glass p-3 rounded-lg border border-border">
                                <p className="font-medium">{label}</p>
                                <p className="text-primary">Health: {payload[0]?.value}%</p>
                                <p className="text-secondary">AQI Exposure: {payload[1]?.value}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="health"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="aqi"
                        stroke="hsl(var(--secondary))"
                        fill="hsl(var(--secondary))"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab('health')}>
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Health Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab('locations')}>
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>My Locations</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Bell className="w-5 h-5 text-accent" />
                  <span>Alerts</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab('settings')}>
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <span>Settings</span>
                </Button>
              </div>
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Health Score Card */}
                <Card className="glass p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-500/20 rounded-full">
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Health Score</h3>
                      <p className="text-sm text-muted-foreground">Based on your profile and environment</p>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <div className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {healthData?.overall_score?.toFixed(0)}
                    </div>
                    <p className="text-muted-foreground mt-2">out of 100</p>
                    <Progress value={healthData?.overall_score || 0} className="mt-4 h-3" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{healthData?.daily_exposure}%</p>
                      <p className="text-xs text-muted-foreground">Daily Exposure</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold capitalize ${getRiskColor(healthData?.risk_level || 'low')}`}>
                        {healthData?.risk_level}
                      </p>
                      <p className="text-xs text-muted-foreground">Risk Level</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-secondary capitalize">{healthData?.weekly_trend}</p>
                      <p className="text-xs text-muted-foreground">Trend</p>
                    </div>
                  </div>
                </Card>

                {/* Recommendations */}
                <Card className="glass p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">AI Recommendations</h3>
                      <p className="text-sm text-muted-foreground">Personalized for your health profile</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {healthData?.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Exposure Chart */}
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Health Metrics</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={exposureHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="health" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="aqi" stroke="hsl(var(--secondary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="space-y-6">
              <Card className="glass p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Saved Locations</h3>
                  </div>
                  <Badge variant="outline">{savedLocations.length} locations</Badge>
                </div>

                {savedLocations.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-medium mb-2">No saved locations</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Search for cities on the globe and save them to track their air quality.
                    </p>
                    <Button onClick={onClose}>Explore Globe</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedLocations.map((location) => (
                      <Card
                        key={location.id}
                        className="glass p-4 cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => handleLocationClick(location.city)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{location.name || location.city}</h4>
                              {location.is_favorite && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {location.city}, {location.country}
                            </p>
                          </div>
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <Badge variant="outline">Verified</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Health Profile</p>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.health_profile ? 'Configured' : 'Not configured'}
                      </p>
                    </div>
                    <Badge variant={userProfile?.health_profile ? 'default' : 'secondary'}>
                      {userProfile?.health_profile ? 'Active' : 'Setup Required'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Notifications</p>
                      <p className="text-sm text-muted-foreground">Air quality alerts</p>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/50">
                  <Button variant="destructive" onClick={handleSignOut} className="w-full">
                    Sign Out
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
