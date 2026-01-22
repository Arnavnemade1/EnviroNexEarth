import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  startLocationTracking,
  analyzeHabits,
  generateDailySummary,
  getOptimalActivityTimes,
  type TrackedActivity,
  type LearnedHabit,
  type DailyActivitySummary
} from '@/services/activityTracking';

interface HabitPattern {
  id: string;
  user_id: string;
  location_lat: number;
  location_lng: number;
  time_of_day: string;
  day_of_week: number;
  duration_minutes: number | null;
  environmental_aqi: number | null;
  activity_type: string | null;
  environmental_temp: number | null;
  created_at: string;
}

export interface ActivityTrackingData {
  isTracking: boolean;
  activities: TrackedActivity[];
  learnedHabits: LearnedHabit[];
  dailySummaries: DailyActivitySummary[];
  optimalTimes: { hour: number; aqi: number; recommendation: string }[];
  trackingError: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export function useActivityTracking() {
  const { user, userProfile } = useAuth();
  const [data, setData] = useState<ActivityTrackingData>({
    isTracking: false,
    activities: [],
    learnedHabits: [],
    dailySummaries: [],
    optimalTimes: [],
    trackingError: null,
    permissionStatus: 'unknown'
  });

  const trackingRef = useRef<{ stop: () => void } | null>(null);

  // Check geolocation permission
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setData(prev => ({ ...prev, permissionStatus: result.state }));
        
        result.onchange = () => {
          setData(prev => ({ ...prev, permissionStatus: result.state }));
        };
      });
    }
  }, []);

  // Load activities from database
  const loadActivities = useCallback(async () => {
    if (!user) return;

    try {
      const { data: habitPatterns, error } = await (supabase as any)
        .from('habit_patterns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading habit patterns:', error);
        return;
      }

      if (habitPatterns) {
        const typedPatterns = habitPatterns as HabitPattern[];
        const activities: TrackedActivity[] = typedPatterns.map(hp => ({
          id: hp.id,
          timestamp: new Date(hp.created_at),
          latitude: hp.location_lat,
          longitude: hp.location_lng,
          locationName: `Location (${hp.location_lat.toFixed(3)}, ${hp.location_lng.toFixed(3)})`,
          duration: hp.duration_minutes || 5,
          aqi: hp.environmental_aqi || 50,
          activityType: (hp.activity_type as TrackedActivity['activityType']) || 'stationary'
        }));

        const habits = analyzeHabits(activities);
        
        // Generate daily summaries for last 7 days
        const summaries: DailyActivitySummary[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          summaries.push(generateDailySummary(activities, date));
        }

        setData(prev => ({
          ...prev,
          activities,
          learnedHabits: habits,
          dailySummaries: summaries.reverse()
        }));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  }, [user]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Handle new activity from tracking
  const handleNewActivity = useCallback(async (activity: TrackedActivity) => {
    if (!user) return;

    // Save to database
    try {
      const { error } = await (supabase as any).from('habit_patterns').insert({
        user_id: user.id,
        location_lat: activity.latitude,
        location_lng: activity.longitude,
        time_of_day: activity.timestamp.toTimeString().split(' ')[0],
        day_of_week: activity.timestamp.getDay(),
        duration_minutes: activity.duration,
        environmental_aqi: activity.aqi,
        activity_type: activity.activityType
      });

      if (error) {
        console.error('Error saving activity:', error);
      }
    } catch (error) {
      console.error('Error saving activity:', error);
    }

    // Update local state
    setData(prev => {
      const newActivities = [...prev.activities, activity];
      const habits = analyzeHabits(newActivities);
      
      return {
        ...prev,
        activities: newActivities,
        learnedHabits: habits
      };
    });
  }, [user]);

  // Start tracking
  const startTracking = useCallback(() => {
    if (trackingRef.current) return;

    const tracker = startLocationTracking(
      handleNewActivity,
      (error) => setData(prev => ({ ...prev, trackingError: error }))
    );

    if (tracker) {
      trackingRef.current = tracker;
      setData(prev => ({ ...prev, isTracking: true, trackingError: null }));
    }
  }, [handleNewActivity]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (trackingRef.current) {
      trackingRef.current.stop();
      trackingRef.current = null;
      setData(prev => ({ ...prev, isTracking: false }));
    }
  }, []);

  // Fetch optimal activity times
  const fetchOptimalTimes = useCallback(async (lat: number, lon: number) => {
    const times = await getOptimalActivityTimes(lat, lon);
    setData(prev => ({ ...prev, optimalTimes: times }));
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (trackingRef.current) {
        trackingRef.current.stop();
      }
    };
  }, []);

  return {
    ...data,
    startTracking,
    stopTracking,
    fetchOptimalTimes,
    refreshActivities: loadActivities
  };
}
