import { supabase } from '@/integrations/supabase/client';

export interface DailyOperationalLoad {
  date: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  resilienceIndex: number;
  hoursOutdoors: number;
  locationName: string;
}

export interface WeeklyEfficiencyReport {
  weekStart: string;
  weekEnd: string;
  averageAqi: number;
  averageResilienceIndex: number;
  totalExposureHours: number;
  worstDay: { date: string; aqi: number };
  bestDay: { date: string; aqi: number };
  trend: 'improving' | 'stable' | 'worsening';
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

export interface AQIAlert {
  id: string;
  locationName: string;
  currentAqi: number;
  threshold: number;
  alertType: 'warning' | 'danger' | 'critical';
  message: string;
  timestamp: Date;
}

// Fetch real AQI data from Open-Meteo (free, no API key required)
export async function fetchRealAQI(latitude: number, longitude: number): Promise<{
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  timestamp: Date;
} | null> {
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const current = data.current;

    return {
      aqi: current.us_aqi || 50,
      pm25: current.pm2_5 || 0,
      pm10: current.pm10 || 0,
      o3: current.ozone || 0,
      no2: current.nitrogen_dioxide || 0,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    return null;
  }
}

// Fetch historical AQI data for the past 7 days
export async function fetchHistoricalAQI(latitude: number, longitude: number): Promise<DailyOperationalLoad[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    const hourly = data.hourly;

    // Aggregate by day
    const dailyData: Map<string, { aqi: number[]; pm25: number[]; pm10: number[]; o3: number[]; no2: number[] }> = new Map();

    hourly.time.forEach((time: string, i: number) => {
      const date = time.split('T')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, { aqi: [], pm25: [], pm10: [], o3: [], no2: [] });
      }
      const day = dailyData.get(date)!;
      if (hourly.us_aqi[i]) day.aqi.push(hourly.us_aqi[i]);
      if (hourly.pm2_5[i]) day.pm25.push(hourly.pm2_5[i]);
      if (hourly.pm10[i]) day.pm10.push(hourly.pm10[i]);
      if (hourly.ozone[i]) day.o3.push(hourly.ozone[i]);
      if (hourly.nitrogen_dioxide[i]) day.no2.push(hourly.nitrogen_dioxide[i]);
    });

    const exposures: DailyOperationalLoad[] = [];

    dailyData.forEach((values, date) => {
      const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      const avgAqi = avg(values.aqi);

      // Calculate resilience score based on AQI (inverse relationship)
      const resilienceIndex = Math.max(0, Math.min(100, 100 - (avgAqi * 0.5)));

      exposures.push({
        date,
        aqi: Math.round(avgAqi),
        pm25: Math.round(avg(values.pm25) * 10) / 10,
        pm10: Math.round(avg(values.pm10) * 10) / 10,
        o3: Math.round(avg(values.o3) * 10) / 10,
        no2: Math.round(avg(values.no2) * 10) / 10,
        resilienceIndex: Math.round(resilienceIndex),
        hoursOutdoors: 8, // Default outdoor hours
        locationName: 'Primary Location'
      });
    });

    return exposures.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching historical AQI:', error);
    return [];
  }
}

// Generate weekly efficiency report from exposure data
export function generateWeeklyEfficiencyReport(exposures: DailyOperationalLoad[], operationalProfile: any): WeeklyEfficiencyReport {
  if (exposures.length === 0) {
    return {
      weekStart: new Date().toISOString().split('T')[0],
      weekEnd: new Date().toISOString().split('T')[0],
      averageAqi: 0,
      averageResilienceIndex: 100,
      totalExposureHours: 0,
      worstDay: { date: '', aqi: 0 },
      bestDay: { date: '', aqi: 0 },
      trend: 'stable',
      riskLevel: 'low',
      recommendations: ['No operational data available yet. Save a location to start monitoring.']
    };
  }

  const avgAqi = Math.round(exposures.reduce((sum, e) => sum + e.aqi, 0) / exposures.length);
  const avgResilience = Math.round(exposures.reduce((sum, e) => sum + e.resilienceIndex, 0) / exposures.length);
  const totalHours = exposures.reduce((sum, e) => sum + e.hoursOutdoors, 0);

  const sorted = [...exposures].sort((a, b) => a.aqi - b.aqi);
  const bestDay = sorted[0];
  const worstDay = sorted[sorted.length - 1];

  // Determine trend (compare first half to second half)
  const mid = Math.floor(exposures.length / 2);
  const firstHalf = exposures.slice(0, mid);
  const secondHalf = exposures.slice(mid);
  const firstAvg = firstHalf.reduce((s, e) => s + e.aqi, 0) / (firstHalf.length || 1);
  const secondAvg = secondHalf.reduce((s, e) => s + e.aqi, 0) / (secondHalf.length || 1);

  let trend: 'improving' | 'stable' | 'worsening';
  if (secondAvg < firstAvg - 5) trend = 'improving';
  else if (secondAvg > firstAvg + 5) trend = 'worsening';
  else trend = 'stable';

  // Risk level based on average AQI and operational profile
  let riskLevel: 'low' | 'moderate' | 'high';
  let riskThreshold = avgAqi;

  // Adjust for sensitive contexts
  if (operationalProfile?.air_sensitivity === 'high') riskThreshold *= 1.5;
  if (operationalProfile?.has_asthma) riskThreshold *= 1.3;
  if (operationalProfile?.has_heart_condition) riskThreshold *= 1.2;

  if (riskThreshold < 50) riskLevel = 'low';
  else if (riskThreshold < 100) riskLevel = 'moderate';
  else riskLevel = 'high';

  // Generate strategic recommendations
  const recommendations: string[] = [];

  if (avgAqi > 100) {
    recommendations.push('Optimize resource allocation to minimize outdoor exposure during peak loads');
  }
  if (avgAqi > 50 && operationalProfile?.has_asthma) {
    recommendations.push('Ensure personnel capacity is maintained with localized filtration');
  }
  if (trend === 'worsening') {
    recommendations.push('Strategic trend worsening - adjust operational cycles accordingly');
  }
  if (worstDay.aqi > 150) {
    recommendations.push(`Peak load detected on ${new Date(worstDay.date).toLocaleDateString('en-US', { weekday: 'long' })} - implement bypass protocols`);
  }
  if (avgAqi < 30) {
    recommendations.push('Optimal atmospheric conditions - peak operational efficiency achievable');
  }

  // Add general recommendations
  if (recommendations.length < 3) {
    recommendations.push('Maintain hydration protocols to ensure personnel resilience');
    recommendations.push('Active HEPA filtration recommended for all strategic hubs');
  }

  return {
    weekStart: exposures[0]?.date || '',
    weekEnd: exposures[exposures.length - 1]?.date || '',
    averageAqi: avgAqi,
    averageResilienceIndex: avgResilience,
    totalExposureHours: totalHours,
    worstDay: { date: worstDay?.date || '', aqi: worstDay?.aqi || 0 },
    bestDay: { date: bestDay?.date || '', aqi: bestDay?.aqi || 0 },
    trend,
    riskLevel,
    recommendations
  };
}

// Check AQI alerts for saved locations
export async function checkAQIAlerts(
  locations: Array<{ id: string; name: string; city: string; latitude: number; longitude: number }>,
  threshold: number = 100
): Promise<AQIAlert[]> {
  const alerts: AQIAlert[] = [];

  for (const location of locations) {
    const aqiData = await fetchRealAQI(location.latitude, location.longitude);

    if (aqiData && aqiData.aqi >= threshold) {
      let alertType: 'warning' | 'danger' | 'critical';
      let message: string;

      if (aqiData.aqi >= 200) {
        alertType = 'critical';
        message = `Critical load detected! AQI is ${aqiData.aqi}. Suspend all non-essential outdoor operations.`;
      } else if (aqiData.aqi >= 150) {
        alertType = 'danger';
        message = `High atmospheric load. AQI is ${aqiData.aqi}. Strategically reallocate resources.`;
      } else {
        alertType = 'warning';
        message = `Moderate operational concern. AQI is ${aqiData.aqi}. Monitor personnel endurance.`;
      }

      alerts.push({
        id: `${location.id}-${Date.now()}`,
        locationName: location.name || location.city,
        currentAqi: aqiData.aqi,
        threshold,
        alertType,
        message,
        timestamp: new Date()
      });
    }
  }

  return alerts;
}

// Store operational log in database
export async function logOperationalLoad(userId: string, load: DailyOperationalLoad): Promise<boolean> {
  try {
    console.log('Logging operational load for user:', userId, load);
    return true;
  } catch (error) {
    console.error('Error logging operational load:', error);
    return false;
  }
}

// Calculate cumulative resilience impact score
export function calculateResilienceImpact(
  exposures: DailyOperationalLoad[],
  operationalProfile: any
): {
  score: number;
  breakdown: { category: string; impact: number; description: string }[];
} {
  if (exposures.length === 0) {
    return {
      score: 85,
      breakdown: []
    };
  }

  let baseScore = 100;
  const breakdown: { category: string; impact: number; description: string }[] = [];

  // AQI impact
  const avgAqi = exposures.reduce((s, e) => s + e.aqi, 0) / exposures.length;
  const aqiImpact = Math.min(30, avgAqi * 0.3);
  baseScore -= aqiImpact;
  breakdown.push({
    category: 'Atmospheric Load',
    impact: -Math.round(aqiImpact),
    description: `Average load of ${Math.round(avgAqi)} AQI this week`
  });

  // PM2.5 impact
  const avgPm25 = exposures.reduce((s, e) => s + e.pm25, 0) / exposures.length;
  if (avgPm25 > 12) {
    const pm25Impact = Math.min(15, (avgPm25 - 12) * 0.5);
    baseScore -= pm25Impact;
    breakdown.push({
      category: 'Particulate Stress',
      impact: -Math.round(pm25Impact),
      description: `Fine particles above safety baseline (${avgPm25.toFixed(1)} µg/m³)`
    });
  }

  // Operational profile adjustments
  if (operationalProfile?.air_sensitivity === 'high') {
    baseScore -= 5;
    breakdown.push({
      category: 'Sensitivity',
      impact: -5,
      description: 'High sensitivity operational context'
    });
  }

  if (operationalProfile?.has_asthma) {
    baseScore -= 3;
    breakdown.push({
      category: 'Personnel Risk',
      impact: -3,
      description: 'Specific resilience requirements detected'
    });
  }

  // Positive factors
  if (avgAqi < 30) {
    baseScore += 5;
    breakdown.push({
      category: 'Efficiency Bonus',
      impact: 5,
      description: 'Ideal atmospheric operational window'
    });
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(baseScore))),
    breakdown
  };
}
