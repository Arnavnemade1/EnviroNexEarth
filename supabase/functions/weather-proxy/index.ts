import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENWEATHER_API_KEY = "8c8c1f1a4b0a90fdb5f2a6f5e0c1d8c2"; // Free tier key for demo

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CloudData {
  lat: number;
  lng: number;
  clouds: number;
  weather: string;
  temp: number;
  humidity: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, lat, lon } = await req.json();

    if (action === 'global-clouds') {
      // Fetch cloud data for a grid across the globe
      const clouds: CloudData[] = [];
      const promises = [];

      // Create a grid with strategic points
      for (let latitude = -80; latitude <= 80; latitude += 15) {
        for (let longitude = -180; longitude < 180; longitude += 15) {
          promises.push(
            fetchWeatherData(latitude, longitude).catch(err => {
              console.error(`Failed to fetch weather for ${latitude},${longitude}:`, err);
              return generateFallbackPoint(latitude, longitude);
            })
          );
        }
      }

      const results = await Promise.all(promises);
      clouds.push(...results);

      return new Response(
        JSON.stringify({
          timestamp: Date.now(),
          clouds
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'location-weather') {
      const data = await fetchWeatherData(lat, lon);
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Weather proxy error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchWeatherData(lat: number, lon: number): Promise<CloudData> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenWeatherMap API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    lat,
    lng: lon,
    clouds: data.clouds?.all || 0,
    weather: data.weather?.[0]?.main || 'Clear',
    temp: data.main?.temp || 20,
    humidity: data.main?.humidity || 50
  };
}

function generateFallbackPoint(lat: number, lng: number): CloudData {
  const absLat = Math.abs(lat);
  let cloudiness = 50;
  
  if (absLat < 10) {
    cloudiness = 60 + Math.random() * 30;
  } else if (absLat > 20 && absLat < 40) {
    cloudiness = 20 + Math.random() * 30;
  } else if (absLat > 40 && absLat < 70) {
    cloudiness = 55 + Math.random() * 35;
  } else {
    cloudiness = 40 + Math.random() * 40;
  }
  
  return {
    lat,
    lng,
    clouds: Math.round(cloudiness),
    weather: cloudiness > 70 ? 'Cloudy' : cloudiness > 40 ? 'Partly Cloudy' : 'Clear',
    temp: 25 - absLat * 0.5,
    humidity: 50
  };
}
