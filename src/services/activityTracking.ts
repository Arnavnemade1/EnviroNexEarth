// Passive Activity Tracking Service
// Uses Geolocation API to track location when app is open and calculates exposure

export interface TrackedActivity {
  id: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  locationName: string;
  duration: number; // minutes
  aqi: number;
  activityType: 'stationary' | 'walking' | 'commuting';
}

export interface LearnedHabit {
  id: string;
  name: string;
  timeOfDay: string; // "morning", "afternoon", "evening"
  dayOfWeek: number[]; // 0-6
  location: { lat: number; lng: number; name: string };
  averageAqi: number;
  optimalTimeWindow: { start: string; end: string };
  confidence: number; // 0-100
  suggestion: string;
}

export interface DailyActivitySummary {
  date: string;
  totalOutdoorMinutes: number;
  avgAqi: number;
  bestAqiTime: string;
  worstAqiTime: string;
  activities: TrackedActivity[];
  exposureScore: number;
}

// Fetch current location AQI from Open-Meteo
async function fetchLocationAqi(lat: number, lon: number): Promise<number> {
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`
    );
    const data = await response.json();
    return data.current?.us_aqi || 50;
  } catch (error) {
    console.error('Error fetching AQI:', error);
    return 50; // Default moderate AQI
  }
}

// Get location name from coordinates using reverse geocoding
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${lat}&longitude=${lon}&count=1&format=json`
    );
    // If API doesn't support reverse geocoding, use a simple approach
    return `Location (${lat.toFixed(3)}, ${lon.toFixed(3)})`;
  } catch {
    return `Location (${lat.toFixed(3)}, ${lon.toFixed(3)})`;
  }
}

// Determine activity type based on speed
function determineActivityType(speedMps: number): TrackedActivity['activityType'] {
  if (speedMps < 0.5) return 'stationary';
  if (speedMps < 2) return 'walking';
  return 'commuting';
}

// Start passive location tracking
export function startLocationTracking(
  onLocationUpdate: (activity: TrackedActivity) => void,
  onError: (error: string) => void
): { stop: () => void } | null {
  if (!navigator.geolocation) {
    onError('Geolocation is not supported by your browser');
    return null;
  }

  let lastPosition: GeolocationPosition | null = null;
  let trackingInterval: number | null = null;

  const processPosition = async (position: GeolocationPosition) => {
    const { latitude, longitude, speed } = position.coords;
    const now = new Date();
    
    // Calculate duration since last update (default 5 min tracking interval)
    const duration = lastPosition 
      ? Math.round((now.getTime() - lastPosition.timestamp) / 60000)
      : 5;

    const aqi = await fetchLocationAqi(latitude, longitude);
    const locationName = await reverseGeocode(latitude, longitude);
    const activityType = determineActivityType(speed || 0);

    const activity: TrackedActivity = {
      id: `${now.getTime()}`,
      timestamp: now,
      latitude,
      longitude,
      locationName,
      duration,
      aqi,
      activityType
    };

    lastPosition = position;
    onLocationUpdate(activity);
  };

  // Get initial position
  navigator.geolocation.getCurrentPosition(
    processPosition,
    (error) => onError(error.message),
    { enableHighAccuracy: true }
  );

  // Track every 5 minutes
  trackingInterval = window.setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      processPosition,
      (error) => console.warn('Location update failed:', error.message),
      { enableHighAccuracy: true }
    );
  }, 5 * 60 * 1000);

  return {
    stop: () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    }
  };
}

// Analyze activities to learn habits
export function analyzeHabits(activities: TrackedActivity[]): LearnedHabit[] {
  if (activities.length < 10) return [];

  const habits: LearnedHabit[] = [];
  
  // Group activities by location and time patterns
  const locationGroups = new Map<string, TrackedActivity[]>();
  
  activities.forEach(activity => {
    const locKey = `${Math.round(activity.latitude * 100) / 100},${Math.round(activity.longitude * 100) / 100}`;
    if (!locationGroups.has(locKey)) {
      locationGroups.set(locKey, []);
    }
    locationGroups.get(locKey)!.push(activity);
  });

  // Analyze each location cluster
  locationGroups.forEach((acts, locKey) => {
    if (acts.length < 3) return;

    const [lat, lng] = locKey.split(',').map(Number);
    const avgAqi = acts.reduce((sum, a) => sum + a.aqi, 0) / acts.length;
    
    // Find time patterns
    const hours = acts.map(a => a.timestamp.getHours());
    const avgHour = Math.round(hours.reduce((sum, h) => sum + h, 0) / hours.length);
    
    const timeOfDay = avgHour < 12 ? 'morning' : avgHour < 17 ? 'afternoon' : 'evening';
    
    // Find days of week
    const days = [...new Set(acts.map(a => a.timestamp.getDay()))];
    
    // Find optimal time window (lowest AQI)
    const hourlyAqi = new Map<number, { total: number; count: number }>();
    acts.forEach(a => {
      const hour = a.timestamp.getHours();
      if (!hourlyAqi.has(hour)) {
        hourlyAqi.set(hour, { total: 0, count: 0 });
      }
      const entry = hourlyAqi.get(hour)!;
      entry.total += a.aqi;
      entry.count += 1;
    });

    let bestHour = avgHour;
    let lowestAvgAqi = Infinity;
    hourlyAqi.forEach((data, hour) => {
      const avg = data.total / data.count;
      if (avg < lowestAvgAqi) {
        lowestAvgAqi = avg;
        bestHour = hour;
      }
    });

    const confidence = Math.min(95, 50 + acts.length * 3);
    const locationName = acts[0].locationName;

    habits.push({
      id: `habit-${locKey}`,
      name: `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} activity at ${locationName}`,
      timeOfDay,
      dayOfWeek: days,
      location: { lat, lng, name: locationName },
      averageAqi: Math.round(avgAqi),
      optimalTimeWindow: {
        start: `${bestHour}:00`,
        end: `${(bestHour + 2) % 24}:00`
      },
      confidence,
      suggestion: avgAqi > 75 
        ? `Consider shifting this activity to ${bestHour}:00-${(bestHour + 2) % 24}:00 for better air quality`
        : `Good time for outdoor activities! Average AQI is ${Math.round(avgAqi)}`
    });
  });

  return habits.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

// Generate daily summary from activities
export function generateDailySummary(activities: TrackedActivity[], date: Date): DailyActivitySummary {
  const dateStr = date.toISOString().split('T')[0];
  const dayActivities = activities.filter(a => 
    a.timestamp.toISOString().split('T')[0] === dateStr
  );

  if (dayActivities.length === 0) {
    return {
      date: dateStr,
      totalOutdoorMinutes: 0,
      avgAqi: 0,
      bestAqiTime: '-',
      worstAqiTime: '-',
      activities: [],
      exposureScore: 100
    };
  }

  const totalMinutes = dayActivities.reduce((sum, a) => sum + a.duration, 0);
  const avgAqi = dayActivities.reduce((sum, a) => sum + a.aqi, 0) / dayActivities.length;

  const sortedByAqi = [...dayActivities].sort((a, b) => a.aqi - b.aqi);
  const bestTime = sortedByAqi[0].timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const worstTime = sortedByAqi[sortedByAqi.length - 1].timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Calculate exposure score (higher is better - less exposure to bad air)
  const exposureScore = Math.max(0, Math.min(100, 100 - (avgAqi - 50) * 0.5));

  return {
    date: dateStr,
    totalOutdoorMinutes: totalMinutes,
    avgAqi: Math.round(avgAqi),
    bestAqiTime: bestTime,
    worstAqiTime: worstTime,
    activities: dayActivities,
    exposureScore: Math.round(exposureScore)
  };
}

// Get hourly AQI forecast for optimal activity planning
export async function getOptimalActivityTimes(lat: number, lon: number): Promise<{
  hour: number;
  aqi: number;
  recommendation: 'excellent' | 'good' | 'moderate' | 'avoid';
}[]> {
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi&forecast_days=1`
    );
    const data = await response.json();
    
    if (!data.hourly?.us_aqi) {
      return [];
    }

    return data.hourly.us_aqi.map((aqi: number, i: number) => ({
      hour: i,
      aqi: aqi || 50,
      recommendation: aqi <= 50 ? 'excellent' : aqi <= 75 ? 'good' : aqi <= 100 ? 'moderate' : 'avoid'
    }));
  } catch (error) {
    console.error('Error fetching hourly forecast:', error);
    return [];
  }
}
