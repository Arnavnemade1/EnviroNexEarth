import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClimateData {
  cityName: string;
  lat: number;
  lon: number;
  airQuality: {
    aqi: number;
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  weather?: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    precipitation?: number;
    uvIndex?: number;
    visibility?: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { climateData }: { climateData: ClimateData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Processing climate predictions for:', climateData.cityName);

    // Fetch weather data from Open-Meteo
    let weatherData = climateData.weather;
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${climateData.lat}&longitude=${climateData.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,uv_index,visibility&hourly=temperature_2m,precipitation_probability,wind_speed_10m,uv_index&forecast_days=1&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      if (weatherRes.ok) {
        const data = await weatherRes.json();
        weatherData = {
          temperature: data.current?.temperature_2m,
          humidity: data.current?.relative_humidity_2m,
          windSpeed: data.current?.wind_speed_10m,
          precipitation: data.current?.precipitation,
          uvIndex: data.current?.uv_index,
          visibility: data.current?.visibility,
          hourlyTemp: data.hourly?.temperature_2m,
          hourlyPrecipProb: data.hourly?.precipitation_probability,
          hourlyWind: data.hourly?.wind_speed_10m,
          hourlyUV: data.hourly?.uv_index,
        };
        console.log('Weather data fetched:', weatherData);
      }
    } catch (e) {
      console.log('Weather fetch failed, using defaults:', e);
    }

    const currentHour = new Date().getHours();
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const systemPrompt = `You are ClimatePredict AI - a specialized prediction engine that analyzes climate and environmental data to forecast impacts across ALL aspects of daily life.

You MUST respond with ONLY valid JSON - no markdown, no code blocks, no explanation text. Just pure JSON.

Based on the provided climate data, generate comprehensive 24-hour predictions for the following categories. Each prediction should have specific times, confidence levels, and actionable insights.

Response format (STRICT JSON only):
{
  "timestamp": "ISO timestamp",
  "location": "city name",
  "predictions": {
    "traffic": {
      "icon": "🚗",
      "title": "Traffic & Commute",
      "summary": "Brief overview",
      "hourlyPredictions": [
        {"time": "HH:MM", "prediction": "specific prediction", "confidence": 0-100, "severity": "low|medium|high"}
      ],
      "peakImpactTime": "HH:MM",
      "recommendation": "actionable advice"
    },
    "clothing": {
      "icon": "👔",
      "title": "What to Wear",
      "summary": "Brief overview",
      "hourlyPredictions": [...],
      "peakImpactTime": "HH:MM",
      "recommendation": "specific clothing suggestions"
    },
    "sports": {
      "icon": "⚽",
      "title": "Sports & Exercise",
      "summary": "Brief overview",
      "hourlyPredictions": [...],
      "bestTimes": ["HH:MM", "HH:MM"],
      "worstTimes": ["HH:MM"],
      "recommendation": "specific activity suggestions"
    },
    "outdoor": {
      "icon": "🌳",
      "title": "Outdoor Activities",
      "summary": "Brief overview",
      "hourlyPredictions": [...],
      "optimalWindows": [{"start": "HH:MM", "end": "HH:MM", "activity": "suggested activity"}],
      "recommendation": "what activities are best"
    },
    "health": {
      "icon": "💊",
      "title": "Health Impacts",
      "summary": "Brief overview",
      "riskGroups": ["sensitive groups affected"],
      "hourlyPredictions": [...],
      "recommendation": "health precautions"
    },
    "energy": {
      "icon": "⚡",
      "title": "Energy & Utilities",
      "summary": "Brief overview on AC/heating demand",
      "hourlyPredictions": [...],
      "peakDemandTime": "HH:MM",
      "recommendation": "energy saving tips"
    },
    "travel": {
      "icon": "✈️",
      "title": "Travel Conditions",
      "summary": "Flight delays, road conditions",
      "hourlyPredictions": [...],
      "riskLevel": "low|medium|high",
      "recommendation": "travel advice"
    },
    "events": {
      "icon": "🎪",
      "title": "Events & Gatherings",
      "summary": "Impact on outdoor events",
      "hourlyPredictions": [...],
      "bestEventTimes": ["HH:MM"],
      "recommendation": "event planning advice"
    },
    "agriculture": {
      "icon": "🌾",
      "title": "Agriculture & Gardening",
      "summary": "Farming and plant care impacts",
      "hourlyPredictions": [...],
      "recommendation": "gardening tips"
    },
    "wildlife": {
      "icon": "🦋",
      "title": "Wildlife & Nature",
      "summary": "Animal behavior predictions",
      "hourlyPredictions": [...],
      "recommendation": "nature observation tips"
    }
  },
  "overallRiskScore": 0-100,
  "bestHourToday": "HH:MM",
  "worstHourToday": "HH:MM"
}`;

    const userPrompt = `Analyze this climate data for ${climateData.cityName} and generate detailed 24-hour predictions:

CURRENT CONDITIONS (${currentTime}):
- Air Quality Index (AQI): ${climateData.airQuality.aqi}
- PM2.5: ${climateData.airQuality.pm25} μg/m³
- PM10: ${climateData.airQuality.pm10} μg/m³
- Ozone (O3): ${climateData.airQuality.o3} μg/m³
- Nitrogen Dioxide (NO2): ${climateData.airQuality.no2} μg/m³
- Sulfur Dioxide (SO2): ${climateData.airQuality.so2} μg/m³
- Carbon Monoxide (CO): ${climateData.airQuality.co} μg/m³

WEATHER DATA:
- Temperature: ${weatherData?.temperature ?? 'N/A'}°C
- Humidity: ${weatherData?.humidity ?? 'N/A'}%
- Wind Speed: ${weatherData?.windSpeed ?? 'N/A'} km/h
- Precipitation: ${weatherData?.precipitation ?? 0} mm
- UV Index: ${weatherData?.uvIndex ?? 'N/A'}
- Visibility: ${weatherData?.visibility ?? 'N/A'} m

Current hour: ${currentHour}:00

Generate predictions for ALL categories with specific hourly breakdowns for the next 24 hours. Consider:
1. How AQI affects outdoor activities, sports, health
2. How temperature/humidity affects clothing choices, energy use
3. How visibility/precipitation affects traffic, travel
4. Peak pollution hours (typically 7-9 AM, 5-7 PM in urban areas)
5. UV exposure windows
6. Best/worst times for each activity type

Be specific with times and provide confidence percentages. Return ONLY valid JSON.`;

    console.log('Calling Lovable AI for climate predictions...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI raw response received');

    if (data.choices && data.choices[0]) {
      let content = data.choices[0].message?.content || '';
      
      // Clean the response - remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const predictions = JSON.parse(content);
        console.log('Successfully parsed predictions');
        
        return new Response(
          JSON.stringify({
            success: true,
            predictions,
            model: 'gemini-2.5-flash',
            powered_by: 'Lovable AI'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Content:', content.substring(0, 500));
        throw new Error('Failed to parse AI predictions');
      }
    }

    throw new Error('Invalid response format from AI service');
  } catch (error) {
    console.error('Climate predictions error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
