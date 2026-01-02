import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

    const systemPrompt = `You are ClimatePredict AI. Respond with ONLY valid JSON - no markdown, no code blocks.

Generate CONCISE 24-hour predictions. IMPORTANT: Keep each hourlyPredictions array to MAX 4 entries (key times only: morning rush, midday, evening rush, night).

JSON format:
{
  "timestamp": "ISO string",
  "location": "city",
  "predictions": {
    "traffic": {"icon": "🚗", "title": "Traffic & Commute", "summary": "1 sentence", "hourlyPredictions": [{"time": "HH:MM", "prediction": "short", "confidence": 85, "severity": "low|medium|high"}], "peakImpactTime": "HH:MM", "recommendation": "1 sentence"},
    "clothing": {"icon": "👔", "title": "What to Wear", "summary": "1 sentence", "hourlyPredictions": [], "recommendation": "specific items"},
    "sports": {"icon": "⚽", "title": "Sports & Exercise", "summary": "1 sentence", "hourlyPredictions": [], "bestTimes": ["HH:MM"], "worstTimes": ["HH:MM"], "recommendation": "1 sentence"},
    "outdoor": {"icon": "🌳", "title": "Outdoor Activities", "summary": "1 sentence", "hourlyPredictions": [], "optimalWindows": [{"start": "HH:MM", "end": "HH:MM", "activity": "activity"}], "recommendation": "1 sentence"},
    "health": {"icon": "💊", "title": "Health Impacts", "summary": "1 sentence", "riskGroups": ["group"], "hourlyPredictions": [], "recommendation": "1 sentence"},
    "energy": {"icon": "⚡", "title": "Energy & Utilities", "summary": "1 sentence", "hourlyPredictions": [], "peakDemandTime": "HH:MM", "recommendation": "1 sentence"},
    "travel": {"icon": "✈️", "title": "Travel Conditions", "summary": "1 sentence", "hourlyPredictions": [], "riskLevel": "low|medium|high", "recommendation": "1 sentence"},
    "events": {"icon": "🎪", "title": "Events & Gatherings", "summary": "1 sentence", "hourlyPredictions": [], "bestEventTimes": ["HH:MM"], "recommendation": "1 sentence"},
    "agriculture": {"icon": "🌾", "title": "Agriculture & Gardening", "summary": "1 sentence", "hourlyPredictions": [], "recommendation": "1 sentence"},
    "wildlife": {"icon": "🦋", "title": "Wildlife & Nature", "summary": "1 sentence", "hourlyPredictions": [], "recommendation": "1 sentence"}
  },
  "overallRiskScore": 0-100,
  "bestHourToday": "HH:MM",
  "worstHourToday": "HH:MM"
}`;

    const userPrompt = `Climate data for ${climateData.cityName}:
AQI: ${climateData.airQuality.aqi}, PM2.5: ${climateData.airQuality.pm25}, O3: ${climateData.airQuality.o3}, NO2: ${climateData.airQuality.no2}
Temp: ${weatherData?.temperature ?? 'N/A'}°C, Humidity: ${weatherData?.humidity ?? 'N/A'}%, Wind: ${weatherData?.windSpeed ?? 'N/A'} km/h, UV: ${weatherData?.uvIndex ?? 'N/A'}
Current hour: ${currentHour}:00

Generate CONCISE predictions for all 10 categories. Keep summaries to 1 sentence. Max 4 hourlyPredictions per category. Return ONLY valid JSON.`;

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
        max_tokens: 6000,
        temperature: 0.5
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
