// OpenAQ service: fetch nearest measurements and compute AQI (US EPA) based on PM2.5 when available
import type { AirQualityData } from '@/types';

interface OpenAQLatestResponse {
  results: Array<{
    coordinates?: { latitude: number; longitude: number };
    measurements: Array<{
      parameter: string; // pm25, pm10, so2, no2, o3, co, etc
      value: number;
      unit: string; // 'µg/m³', 'ppm', 'ppb'
    }>;
  }>;
}

class OpenAQService {
  private baseUrl = 'https://api.openaq.org/v2/latest';

  private async fetchNearest(lat: number, lon: number, radius: number = 25000) {
    const url = `${this.baseUrl}?coordinates=${lat},${lon}&radius=${radius}&limit=1&order_by=distance`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenAQ error ${res.status}`);
    const data: OpenAQLatestResponse = await res.json();
    return data.results?.[0] || null;
  }

  private computeAQIFromPM25(pm25: number): number {
    // US EPA AQI for PM2.5 (24-hr) using breakpoints
    const bp = [
      { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
      { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
      { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
      { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
      { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
      { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
      { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
    ];
    for (const b of bp) {
      if (pm25 >= b.cLow && pm25 <= b.cHigh) {
        return Math.round(((b.iHigh - b.iLow) / (b.cHigh - b.cLow)) * (pm25 - b.cLow) + b.iLow);
      }
    }
    return Math.min(500, Math.max(0, Math.round(pm25 * 4))); // fallback
  }

  async getLatestAirQuality(lat: number, lon: number): Promise<AirQualityData> {
    // Try smaller radius first, then expand if needed
    let result = await this.fetchNearest(lat, lon, 20000);
    if (!result) result = await this.fetchNearest(lat, lon, 50000);
    if (!result) throw new Error('No OpenAQ stations nearby');

    const map: Record<string, { value: number; unit: string }> = {};
    for (const m of result.measurements) {
      map[m.parameter.toLowerCase()] = { value: m.value, unit: m.unit };
    }

    // Helper to read value safely (µg/m3 preferred). For gases often ppb/ppm; keep raw value when unit is µg/m3
    const readValue = (key: string): number => {
      const entry = map[key];
      if (!entry) return 0;
      const { value, unit } = entry;
      if (unit.includes('µg')) return Math.round(value);
      // Basic conversion for O3 if provided in ppb/ppm to µg/m3 using MW/24.45 (MW O3 = 48)
      if (key === 'o3') {
        if (unit.toLowerCase() === 'ppb') return Math.round(value * (48 / 24.45)); // ≈1.963 µg/m3 per ppb
        if (unit.toLowerCase() === 'ppm') return Math.round(value * 1000 * (48 / 24.45));
      }
      // For others, return rounded value; units vary but UI labels as µg/m3 generically
      return Math.round(value);
    };

    const pm25 = readValue('pm25');
    const pm10 = readValue('pm10');
    const no2 = readValue('no2');
    const so2 = readValue('so2');
    const o3 = readValue('o3');
    const co = readValue('co');

    const aqi = this.computeAQIFromPM25(pm25 || 0);

    return {
      aqi,
      pm25,
      pm10,
      o3,
      no2,
      so2,
      co,
      timestamp: new Date().toISOString(),
    };
  }
}

export const openaqService = new OpenAQService();
