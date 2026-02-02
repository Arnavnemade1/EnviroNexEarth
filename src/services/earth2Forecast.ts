import { supabase } from '@/integrations/supabase/client';

export interface Earth2ForecastRequest {
  lat: number;
  lon: number;
  forecastDays?: number;
  ensembleMembers?: number;
}

export interface VariableStats {
  mean: number[];
  min: number[];
  max: number[];
  spread: number[];
}

export interface DailySummary {
  date: string;
  temperatureRange: { min: number; max: number };
  precipitationProbability: number;
  windSpeedMax: number;
  confidence: number;
}

export interface Earth2ForecastResponse {
  source: 'nvidia-nim' | 'open-meteo-ensemble';
  model: string;
  location: { lat: number; lon: number };
  generatedAt: string;
  forecastHorizon: string;
  ensembleMembers: number;
  variables: {
    name: string;
    unit: string;
    description: string;
  }[];
  hourlyForecast: {
    time: string[];
    data: Record<string, VariableStats>;
  };
  dailySummary: DailySummary[];
  metadata: {
    processingTimeMs: number;
    resolution: string;
    quantumEnhanced: boolean;
    nvidiaEarth2: boolean;
    algorithmVersion: string;
  };
}

export async function getEarth2Forecast(
  request: Earth2ForecastRequest
): Promise<Earth2ForecastResponse> {
  const { data, error } = await supabase.functions.invoke('earth2-forecast', {
    body: request
  });

  if (error) {
    console.error('Earth-2 Forecast error:', error);
    throw new Error(error.message || 'Failed to fetch Earth-2 forecast');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Unknown error from Earth-2 forecast');
  }

  return data.forecast;
}

// Helper to get forecast for a specific variable
export function getVariableForecast(
  forecast: Earth2ForecastResponse,
  variableName: string
): { times: string[]; stats: VariableStats } | null {
  const stats = forecast.hourlyForecast.data[variableName];
  if (!stats) return null;
  
  return {
    times: forecast.hourlyForecast.time,
    stats
  };
}

// Helper to find the variable unit
export function getVariableUnit(forecast: Earth2ForecastResponse, variableName: string): string {
  const variable = forecast.variables.find(v => v.name === variableName);
  return variable?.unit || '';
}
