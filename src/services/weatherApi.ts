import { supabase } from "@/integrations/supabase/client";

export interface CloudData {
  lat: number;
  lng: number;
  clouds: number; // 0-100% cloud coverage
  weather: string;
  temp: number;
  humidity: number;
}

export interface WeatherGridData {
  timestamp: number;
  clouds: CloudData[];
}

class WeatherService {
  private cloudCache: WeatherGridData | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /**
   * Fetch real-time cloud coverage data for a grid across the globe
   * Using OpenWeatherMap's Current Weather Data API
   */
  async getGlobalCloudData(): Promise<WeatherGridData> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cloudCache && now < this.cacheExpiry) {
      return this.cloudCache;
    }

    try {
      // Fetch weather data via our edge function proxy
      const { data, error } = await supabase.functions.invoke('weather-proxy', {
        body: { action: 'global-clouds' }
      });

      if (error) throw error;

      this.cloudCache = data;
      this.cacheExpiry = now + this.CACHE_DURATION;
      
      return data;
    } catch (error) {
      console.error('Failed to fetch cloud data, using fallback:', error);
      return this.generateFallbackCloudData();
    }
  }

  /**
   * Fetch weather for a specific location
   */
  async getLocationWeather(lat: number, lon: number): Promise<CloudData> {
    try {
      const { data, error } = await supabase.functions.invoke('weather-proxy', {
        body: { action: 'location-weather', lat, lon }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch location weather:', error);
      return {
        lat,
        lng: lon,
        clouds: Math.random() * 100,
        weather: 'Unknown',
        temp: 20,
        humidity: 50
      };
    }
  }

  /**
   * Generate realistic fallback cloud data based on climate patterns
   */
  private generateFallbackCloudData(): WeatherGridData {
    const clouds: CloudData[] = [];
    
    // Create a grid covering the globe
    for (let lat = -80; lat <= 80; lat += 10) {
      for (let lng = -180; lng < 180; lng += 10) {
        // Realistic cloud patterns:
        // - More clouds near equator (ITCZ)
        // - More clouds in mid-latitudes (storm tracks)
        // - Less clouds in subtropical high-pressure belts
        
        const absLat = Math.abs(lat);
        let cloudiness = 50;
        
        if (absLat < 10) {
          // Tropical convergence zone - high cloudiness
          cloudiness = 60 + Math.random() * 30;
        } else if (absLat > 20 && absLat < 40) {
          // Subtropical high - low cloudiness
          cloudiness = 20 + Math.random() * 30;
        } else if (absLat > 40 && absLat < 70) {
          // Mid-latitude storm tracks - high cloudiness
          cloudiness = 55 + Math.random() * 35;
        } else {
          // Polar regions - moderate cloudiness
          cloudiness = 40 + Math.random() * 40;
        }
        
        // Add some randomness for realistic variation
        cloudiness = Math.min(100, Math.max(0, cloudiness + (Math.random() - 0.5) * 20));
        
        clouds.push({
          lat,
          lng,
          clouds: Math.round(cloudiness),
          weather: cloudiness > 70 ? 'Cloudy' : cloudiness > 40 ? 'Partly Cloudy' : 'Clear',
          temp: 25 - absLat * 0.5 + (Math.random() - 0.5) * 10,
          humidity: 40 + Math.random() * 40
        });
      }
    }

    return {
      timestamp: Date.now(),
      clouds
    };
  }
}

export const weatherService = new WeatherService();
