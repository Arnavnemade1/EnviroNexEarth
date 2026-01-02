import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  fetchRealAQI,
  fetchHistoricalAQI,
  generateWeeklyReport,
  checkAQIAlerts,
  calculateHealthImpact,
  type DailyExposure,
  type WeeklyReport,
  type AQIAlert
} from '@/services/healthTracking';

export interface SavedLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  is_favorite: boolean;
}

export interface HealthTrackingData {
  exposures: DailyExposure[];
  weeklyReport: WeeklyReport | null;
  alerts: AQIAlert[];
  healthScore: number;
  healthBreakdown: { category: string; impact: number; description: string }[];
  currentAqi: { location: string; aqi: number; pm25: number; o3: number; no2: number } | null;
  savedLocations: SavedLocation[];
  isLoading: boolean;
  lastUpdated: Date | null;
}

export function useHealthTracking() {
  const { user, userProfile } = useAuth();
  const [data, setData] = useState<HealthTrackingData>({
    exposures: [],
    weeklyReport: null,
    alerts: [],
    healthScore: 0,
    healthBreakdown: [],
    currentAqi: null,
    savedLocations: [],
    isLoading: true,
    lastUpdated: null
  });

  const loadSavedLocations = useCallback(async (): Promise<SavedLocation[]> => {
    if (!user) return [];
    
    try {
      const { data: locations, error } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false });

      if (error) throw error;
      return locations || [];
    } catch (error) {
      console.error('Error loading saved locations:', error);
      return [];
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    if (!user) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setData(prev => ({ ...prev, isLoading: true }));

    try {
      // Load saved locations
      const locations = await loadSavedLocations();
      
      // Get primary location (favorite or first)
      const primaryLocation = locations.find(l => l.is_favorite) || locations[0];
      
      let exposures: DailyExposure[] = [];
      let currentAqi = null;
      let alerts: AQIAlert[] = [];

      if (primaryLocation) {
        // Fetch historical data for the past week
        exposures = await fetchHistoricalAQI(primaryLocation.latitude, primaryLocation.longitude);
        
        // Update location name on exposures
        exposures = exposures.map(e => ({
          ...e,
          locationName: primaryLocation.name || primaryLocation.city
        }));

        // Fetch current AQI
        const realAqi = await fetchRealAQI(primaryLocation.latitude, primaryLocation.longitude);
        if (realAqi) {
          currentAqi = {
            location: primaryLocation.name || primaryLocation.city,
            aqi: realAqi.aqi,
            pm25: realAqi.pm25,
            o3: realAqi.o3,
            no2: realAqi.no2
          };
        }

        // Check for alerts on all locations
        alerts = await checkAQIAlerts(locations, 100);
      }

      // Generate weekly report
      const healthProfile = userProfile?.health_profile || {};
      const weeklyReport = generateWeeklyReport(exposures, healthProfile);
      
      // Calculate health impact
      const { score, breakdown } = calculateHealthImpact(exposures, healthProfile);

      setData({
        exposures,
        weeklyReport,
        alerts,
        healthScore: score,
        healthBreakdown: breakdown,
        currentAqi,
        savedLocations: locations,
        isLoading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error refreshing health data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, userProfile, loadSavedLocations]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Dismiss an alert
  const dismissAlert = useCallback((alertId: string) => {
    setData(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== alertId)
    }));
  }, []);

  // Save alert preference
  const setAlertThreshold = useCallback(async (locationId: string, threshold: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('air_quality_alerts')
        .upsert({
          user_id: user.id,
          location_id: locationId,
          alert_type: 'aqi_threshold',
          threshold_value: threshold,
          is_active: true
        }, { onConflict: 'user_id,location_id' });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting alert threshold:', error);
    }
  }, [user]);

  return {
    ...data,
    refreshData,
    dismissAlert,
    setAlertThreshold
  };
}
