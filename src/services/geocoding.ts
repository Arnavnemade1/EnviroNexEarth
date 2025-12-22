import { API_KEYS } from '@/types';

const OPENCAGE_BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';

export class GeocodingService {
  private apiKey: string;
  private cache: Map<string, any>;

  constructor() {
    this.apiKey = API_KEYS.OPENCAGE;
    this.cache = new Map();
  }

  async searchCity(query: string) {
    if (this.cache.has(query)) {
      return this.cache.get(query);
    }

    const url = `${OPENCAGE_BASE_URL}?q=${encodeURIComponent(query)}&key=${this.apiKey}&limit=5&no_annotations=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const results = data.results?.map((result: any) => ({
        name: result.components.city || result.components.town || result.components.village || result.formatted,
        country: result.components.country,
        lat: result.geometry.lat,
        lng: result.geometry.lng,
        formatted: result.formatted
      })) || [];

      this.cache.set(query, results);
      return results;
    } catch (error) {
      console.error('Geocoding API error:', error);
      return [];
    }
  }

  async reverseGeocode(lat: number, lng: number) {
    const cacheKey = `${lat},${lng}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const url = `${OPENCAGE_BASE_URL}?q=${lat}+${lng}&key=${this.apiKey}&no_annotations=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = {
          name: result.components.city || result.components.town || result.components.village || 'Unknown',
          country: result.components.country || 'Unknown',
          formatted: result.formatted
        };
        this.cache.set(cacheKey, location);
        return location;
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}

export const geocodingService = new GeocodingService();