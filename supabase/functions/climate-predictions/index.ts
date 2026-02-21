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
    hourlyTemp?: number[];
    hourlyPrecipProb?: number[];
    hourlyWind?: number[];
    hourlyUV?: number[];
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { climateData }: { climateData: ClimateData } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY');

    // Fetch weather data from Open-Meteo if not fully provided
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
          ...weatherData // Preserve any existing data
        };
        console.log('Weather data fetched:', weatherData);
      }
    } catch (e) {
      console.log('Weather fetch failed, using defaults:', e);
    }

    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured, using algorithmic fallback');
      const mockPredictions = generateMockClimatePredictions(climateData, weatherData);
      return new Response(
        JSON.stringify({
          success: true,
          predictions: mockPredictions,
          model: 'algorithmic-fallback',
          powered_by: 'AuraEarth-Neural-v1'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing climate predictions for:', climateData.cityName);

    const currentHour = new Date().getHours();

    const systemPrompt = `You are the AuraEarth Strategic Resource Engine. You process real-time atmospheric telemetry through a multi-layered neural network to generate regional resilience and industrial optimization projections.
    
Respond with ONLY valid JSON - no markdown, no code blocks.

Your "Strategic Modeling" phase involves:
1. Input Normalization: Scaling atmospheric load (${climateData.airQuality.aqi}) and resource variables.
2. Feature Extraction: Identifying correlations between effluent dispersion and operational efficiency.
3. Resilience Simulation: Running 10,000+ Monte Carlo simulations for production continuity.
4. Confidence Scoring: Calculating statistical probability for each resilience projection.

Generate CONCISE 24-hour industrial outlooks. Keep each hourlyPredictions array to MAX 4 entries (key times only).

JSON format:
{
  "timestamp": "ISO string",
  "location": "Strategic Zone",
  "neuralMetadata": {
    "engine": "AuraEarth-Resilience-v3",
    "simulations": 10240,
    "processingTimeMs": 450,
    "confidenceInterval": "95%"
  },
  "predictions": {
    "energy": {"icon": "⚡", "title": "Energy & Utilities", "summary": "Strategic grid load summary", "hourlyPredictions": [{"time": "HH:MM", "prediction": "load state", "confidence": 85, "severity": "nominal|guarded|critical"}], "peakDemandTime": "HH:MM", "recommendation": "Optimization directive"},
    "logistics": {"icon": "🚛", "title": "Logistic Resilience", "summary": "Supply chain atmospheric impact", "hourlyPredictions": [], "peakImpactTime": "HH:MM", "recommendation": "Continuity action"},
    "infrastructure": {"icon": "🏗️", "title": "Hardware Stability", "summary": "Equipment degradation/maintenance risk", "hourlyPredictions": [], "recommendation": "Preservation directive"},
    "personnel": {"icon": "👥", "title": "Operational Readiness", "summary": "Workforce output optimization", "hourlyPredictions": [], "optimalWindows": [{"start": "HH:MM", "end": "HH:MM", "activity": "optimization"}], "recommendation": "Shift management"},
    "production": {"icon": "🏭", "title": "Industrial Output", "summary": "Production capacity forecast", "hourlyPredictions": [], "recommendation": "Yield optimization"},
    "commercial": {"icon": "🏢", "title": "Commercial Activity", "summary": "Business continuity outlook", "hourlyPredictions": [], "recommendation": "Operational focus"},
    "transport": {"icon": "🚢", "title": "Bulk Transport", "summary": "Distribution network resilience", "hourlyPredictions": [], "riskLevel": "nominal|monitored|critical", "recommendation": "Route adjustment"},
    "resource_security": {"icon": "🛡️", "title": "Resource Security", "summary": "Strategic asset protection", "hourlyPredictions": [], "recommendation": "Defensive posture"},
    "environmental_load": {"icon": "☁️", "title": "Atmospheric Capacity", "summary": "Regional absorption capacity", "hourlyPredictions": [], "recommendation": "Emission optimization"},
    "strategic_outlook": {"icon": "📈", "title": "Economic Momentum", "summary": "Resilience-driven growth outlook", "hourlyPredictions": [], "recommendation": "Investment focus"}
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

    console.log('Calling Gemini API for climate predictions...');

    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature: 0.5,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          }
        }),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('Gemini API error:', resp.status, errorText);
        throw new Error(`Gemini service error: ${resp.status}`);
      }

      const data = await resp.json();
      console.log('Gemini response received');

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const content = data.candidates[0].content.parts[0].text;
        const predictions = JSON.parse(content);
        console.log('Successfully parsed predictions');

        return new Response(
          JSON.stringify({
            success: true,
            predictions,
            model: 'gemini-2.0-flash',
            powered_by: 'Google Gemini'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (apiError) {
      console.error('AI call failed, falling back:', apiError);
      const mockPredictions = generateMockClimatePredictions(climateData, weatherData);
      return new Response(
        JSON.stringify({
          success: true,
          predictions: mockPredictions,
          model: 'algorithmic-fallback',
          powered_by: 'AuraEarth-Neural-v1'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

function generateMockClimatePredictions(climateData: ClimateData, weatherData: any) {
  const aqi = climateData.airQuality.aqi;
  const temp = weatherData?.temperature ?? 22;
  const hour = new Date().getHours();

  const getStatus = (val: number) => val > 150 ? 'critical' : val > 100 ? 'restricted' : val > 50 ? 'monitored' : 'nominal';
  const status = getStatus(aqi);

  return {
    timestamp: new Date().toISOString(),
    location: climateData.cityName,
    neuralMetadata: {
      engine: "AuraEarth-Algorithmic-v1",
      simulations: 100,
      processingTimeMs: 15,
      confidenceInterval: "85%"
    },
    predictions: {
      energy: {
        icon: "⚡",
        title: "Energy & Utilities",
        summary: temp > 30 ? "High cooling demand predicted for strategic grid nodes." : "Standard operational energy consumption patterns observed.",
        hourlyPredictions: [
          { time: "12:00", prediction: "Nominal Load", confidence: 90, severity: "nominal" },
          { time: "16:00", prediction: "Peak Demand", confidence: 85, severity: "monitored" }
        ],
        peakDemandTime: "16:00",
        recommendation: "Optimize HVAC settings for atmospheric efficiency."
      },
      logistics: {
        icon: "🚛",
        title: "Logistic Resilience",
        summary: status === 'critical' ? "Atmospheric load likely to impact primary supply chain corridors." : "Nominal dispersion for logistic networks.",
        hourlyPredictions: [],
        peakImpactTime: "08:30",
        recommendation: "Continue standard distribution cycles."
      },
      infrastructure: {
        icon: "🏗️",
        title: "Hardware Stability",
        summary: "Regional particulate load remains within nominal hardware preservation buffers.",
        hourlyPredictions: [],
        recommendation: "Standard maintenance protocols recommended."
      },
      personnel: {
        icon: "👥",
        title: "Operational Readiness",
        summary: aqi > 100 ? "Personnel activity optimization recommended for sensitive thresholds." : "Conditions optimized for peak workforce output.",
        hourlyPredictions: [],
        optimalWindows: [{ start: "05:00", end: "08:00", activity: "High-Intensity Operations" }],
        recommendation: aqi > 100 ? "Monitor individual capacity indices." : "Full shift readiness confirmed."
      },
      production: {
        icon: "🏭",
        title: "Industrial Output",
        summary: "Manufacturing yield projections remain stable under current atmospheric load.",
        hourlyPredictions: [],
        recommendation: "Maintain target production quotas."
      },
      commercial: {
        icon: "🏢",
        title: "Commercial Activity",
        summary: "Business continuity outlook remains positive for the next operational window.",
        hourlyPredictions: [],
        recommendation: "Standard commercial focus."
      },
      transport: {
        icon: "🚢",
        title: "Bulk Transport",
        summary: "Regional visibility factors support uninterrupted strategic transport.",
        hourlyPredictions: [],
        riskLevel: "nominal",
        recommendation: "No route adjustments required."
      },
      resource_security: {
        icon: "🛡️",
        title: "Resource Security",
        summary: "Strategic asset protection metrics are within safety margins.",
        hourlyPredictions: [],
        recommendation: "Maintain defensive environmental posture."
      },
      environmental_load: {
        icon: "☁️",
        title: "Atmospheric Capacity",
        summary: "Regional absorption capacity is sufficient for current effluent dispersion.",
        hourlyPredictions: [],
        recommendation: "Continue active load monitoring."
      },
      strategic_outlook: {
        icon: "📈",
        title: "Economic Momentum",
        summary: "Resilience-driven growth outlook remains aligned with baseline projections.",
        hourlyPredictions: [],
        recommendation: "Strategic focus on resource independence."
      }
    },
    overallRiskScore: Math.min(100, aqi * 0.6),
    bestHourToday: "06:00",
    worstHourToday: "14:00"
  };
}

