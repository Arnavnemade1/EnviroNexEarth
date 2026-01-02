import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useHealthTracking } from '@/hooks/useHealthTracking';
import { useToast } from '@/hooks/use-toast';
import {
  Activity,
  Heart,
  MapPin,
  TrendingUp,
  TrendingDown,
  Shield,
  Sparkles,
  Star,
  Bell,
  Settings,
  User,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  FileText,
  Wind,
  Droplets,
  Calendar
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
  Area,
  BarChart,
  Bar
} from 'recharts';

interface DashboardProps {
  onClose: () => void;
  onSelectCity?: (city: string) => void;
}

export const Dashboard = ({ onClose, onSelectCity }: DashboardProps) => {
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const {
    exposures,
    weeklyReport,
    alerts,
    healthScore,
    healthBreakdown,
    currentAqi,
    savedLocations,
    isLoading,
    lastUpdated,
    refreshData,
    dismissAlert
  } = useHealthTracking();

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

  const handleRefresh = async () => {
    toast({ title: "Refreshing data...", description: "Fetching latest air quality data." });
    await refreshData();
    toast({ title: "Data updated", description: "Your health tracking data has been refreshed." });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20';
      case 'moderate': return 'bg-yellow-500/20';
      case 'high': return 'bg-red-500/20';
      default: return 'bg-muted';
    }
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-500';
    if (aqi <= 150) return 'text-orange-500';
    return 'text-red-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'worsening': return <TrendingUp className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatChartData = () => {
    return exposures.map(e => ({
      day: new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      aqi: e.aqi,
      health: e.healthScore,
      pm25: e.pm25
    }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="glass p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading your health data...</p>
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
                  <p className="text-muted-foreground text-sm">
                    {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh data">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Active Alerts Banner */}
            {alerts.length > 0 && (
              <div className="mt-4 space-y-2">
                {alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      alert.alertType === 'critical' ? 'bg-red-500/20 border border-red-500/50' :
                      alert.alertType === 'danger' ? 'bg-orange-500/20 border border-orange-500/50' :
                      'bg-yellow-500/20 border border-yellow-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`w-5 h-5 ${
                        alert.alertType === 'critical' ? 'text-red-500' :
                        alert.alertType === 'danger' ? 'text-orange-500' :
                        'text-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{alert.locationName}: AQI {alert.currentAqi}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                      Dismiss
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Health</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Weekly Report</span>
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
              {/* Current AQI Card */}
              {currentAqi && (
                <Card className="glass p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Wind className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Current Air Quality</h3>
                        <p className="text-sm text-muted-foreground">{currentAqi.location}</p>
                      </div>
                    </div>
                    <div className={`text-4xl font-bold ${getAqiColor(currentAqi.aqi)}`}>
                      {currentAqi.aqi}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-lg font-semibold">{currentAqi.pm25.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">PM2.5 µg/m³</p>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-lg font-semibold">{currentAqi.o3.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">O₃ µg/m³</p>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-lg font-semibold">{currentAqi.no2.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">NO₂ µg/m³</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Health Score</span>
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {healthScore}%
                  </div>
                  <Progress value={healthScore} className="mt-2" />
                </Card>

                <Card className="glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Risk Level</span>
                    <Shield className={`w-4 h-4 ${getRiskColor(weeklyReport?.riskLevel || 'low')}`} />
                  </div>
                  <div className={`text-3xl font-bold capitalize ${getRiskColor(weeklyReport?.riskLevel || 'low')}`}>
                    {weeklyReport?.riskLevel || 'Low'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Based on weekly exposure</p>
                </Card>

                <Card className="glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Weekly Trend</span>
                    {getTrendIcon(weeklyReport?.trend || 'stable')}
                  </div>
                  <div className="text-3xl font-bold capitalize text-foreground">
                    {weeklyReport?.trend || 'Stable'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg AQI: {weeklyReport?.averageAqi || 0}
                  </p>
                </Card>
              </div>

              {/* 7-Day Chart */}
              {exposures.length > 0 && (
                <Card className="glass p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    7-Day Health & Exposure Trend
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formatChartData()}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="glass p-3 rounded-lg border border-border">
                                  <p className="font-medium">{payload[0]?.payload?.fullDate}</p>
                                  <p className="text-green-500">Health: {payload[0]?.value}%</p>
                                  <p className="text-orange-500">AQI: {payload[1]?.value}</p>
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
                          stroke="hsl(142, 76%, 36%)"
                          fill="hsl(142, 76%, 36%)"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* No data message */}
              {exposures.length === 0 && (
                <Card className="glass p-8 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No tracking data yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Save a location to start tracking your air quality exposure and health metrics.
                  </p>
                  <Button onClick={onClose}>Explore Globe & Save Location</Button>
                </Card>
              )}
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Health Score Breakdown */}
                <Card className="glass p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-500/20 rounded-full">
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Health Score Breakdown</h3>
                      <p className="text-sm text-muted-foreground">Based on real exposure data</p>
                    </div>
                  </div>
                  
                  <div className="text-center py-6">
                    <div className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {healthScore}
                    </div>
                    <p className="text-muted-foreground mt-2">out of 100</p>
                    <Progress value={healthScore} className="mt-4 h-3" />
                  </div>

                  {healthBreakdown.length > 0 && (
                    <div className="space-y-3 mt-6 pt-6 border-t border-border/50">
                      {healthBreakdown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span className={item.impact > 0 ? 'text-green-500' : 'text-red-500'}>
                              {item.impact > 0 ? '+' : ''}{item.impact}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* AI Recommendations */}
                <Card className="glass p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Personalized Recommendations</h3>
                      <p className="text-sm text-muted-foreground">Based on your weekly data</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {weeklyReport?.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* PM2.5 Bar Chart */}
              {exposures.length > 0 && (
                <Card className="glass p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    Daily PM2.5 Exposure (µg/m³)
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formatChartData()}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="pm25" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    WHO guideline: &lt;12 µg/m³ annual average
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* Weekly Report Tab */}
            <TabsContent value="report" className="space-y-6">
              {weeklyReport && (
                <>
                  <Card className="glass p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold">Weekly Health Report</h3>
                          <p className="text-sm text-muted-foreground">
                            {weeklyReport.weekStart && new Date(weeklyReport.weekStart).toLocaleDateString()} - {weeklyReport.weekEnd && new Date(weeklyReport.weekEnd).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getRiskBg(weeklyReport.riskLevel)} variant="outline">
                        {weeklyReport.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <p className={`text-3xl font-bold ${getAqiColor(weeklyReport.averageAqi)}`}>
                          {weeklyReport.averageAqi}
                        </p>
                        <p className="text-sm text-muted-foreground">Avg AQI</p>
                      </div>
                      <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <p className="text-3xl font-bold text-primary">
                          {weeklyReport.averageHealthScore}%
                        </p>
                        <p className="text-sm text-muted-foreground">Avg Health</p>
                      </div>
                      <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <p className="text-3xl font-bold text-green-500">
                          {weeklyReport.bestDay.aqi}
                        </p>
                        <p className="text-sm text-muted-foreground">Best Day AQI</p>
                      </div>
                      <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <p className="text-3xl font-bold text-orange-500">
                          {weeklyReport.worstDay.aqi}
                        </p>
                        <p className="text-sm text-muted-foreground">Worst Day AQI</p>
                      </div>
                    </div>

                    {/* Trend indicator */}
                    <div className="flex items-center gap-3 p-4 bg-muted/10 rounded-lg">
                      {getTrendIcon(weeklyReport.trend)}
                      <div>
                        <p className="font-medium capitalize">Air Quality is {weeklyReport.trend}</p>
                        <p className="text-sm text-muted-foreground">
                          {weeklyReport.trend === 'improving' 
                            ? 'Great news! Air quality has been getting better this week.'
                            : weeklyReport.trend === 'worsening'
                            ? 'Air quality has declined. Consider spending more time indoors.'
                            : 'Air quality has remained relatively stable this week.'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Daily Breakdown */}
                  <Card className="glass p-6">
                    <h3 className="text-lg font-semibold mb-4">Daily Breakdown</h3>
                    <div className="space-y-2">
                      {exposures.map((exposure, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-8 rounded ${
                              exposure.aqi <= 50 ? 'bg-green-500' :
                              exposure.aqi <= 100 ? 'bg-yellow-500' :
                              exposure.aqi <= 150 ? 'bg-orange-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="font-medium">
                                {new Date(exposure.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PM2.5: {exposure.pm25} | O₃: {exposure.o3} | NO₂: {exposure.no2}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${getAqiColor(exposure.aqi)}`}>
                              {exposure.aqi}
                            </p>
                            <p className="text-xs text-muted-foreground">AQI</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              )}

              {!weeklyReport && (
                <Card className="glass p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No report available</h4>
                  <p className="text-sm text-muted-foreground">
                    Save a location to generate your weekly health report.
                  </p>
                </Card>
              )}
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
                  <Bell className="w-5 h-5" />
                  Alert Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">AQI Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified when AQI exceeds 100</p>
                    </div>
                    <Switch 
                      checked={notificationsEnabled} 
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-muted-foreground">Receive weekly health summary</p>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Health Score Updates</p>
                      <p className="text-sm text-muted-foreground">Daily health score notifications</p>
                    </div>
                    <Switch checked={false} />
                  </div>
                </div>
              </Card>

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
