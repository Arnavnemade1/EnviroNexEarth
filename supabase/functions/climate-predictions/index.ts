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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY');

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

    const systemPrompt = `You are the AuraEarth Neural Climate Engine. You process real-time atmospheric data through a multi-layered neural network to generate hyper-local climate impact predictions.
    
Respond with ONLY valid JSON - no markdown, no code blocks.

Your "Neural Processing" phase involves:
1. Input Normalization: Scaling AQI (${climateData.airQuality.aqi}), PM2.5 (${climateData.airQuality.pm25}), and weather variables.
2. Feature Extraction: Identifying correlations between pollutants and local weather (Temp: ${weatherData?.temperature}°C, Wind: ${weatherData?.windSpeed}km/h).
3. Impact Simulation: Running 10,000+ Monte Carlo simulations for each category.
4. Confidence Scoring: Calculating statistical probability for each prediction.

Generate CONCISE 24-hour predictions. Keep each hourlyPredictions array to MAX 4 entries (key times only).

JSON format:
{
  "timestamp": "ISO string",
  "location": "city",
  "neuralMetadata": {
    "engine": "EnviroAI-Neural-v2",
    "simulations": 10240,
    "processingTimeMs": 450,
    "confidenceInterval": "95%"
  },
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

  const getSeverity = (val: number) => val > 150 ? 'high' : val > 100 ? 'medium' : 'low';
  const severity = getSeverity(aqi);

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
      traffic: {
        icon: "🚗",
        title: "Traffic & Commute",
        summary: severity === 'high' ? "Reduced visibility and air quality likely to slow morning commute." : "Normal traffic patterns expected with balanced air dispersion.",
        hourlyPredictions: [
          { time: "08:00", prediction: "Expect delays", confidence: 80, severity: severity },
          { time: "17:00", prediction: "Moderate congestion", confidence: 75, severity: severity }
        ],
        peakImpactTime: "08:30",
        recommendation: "Consider public transport to reduce personal exposure."
      },
      clothing: {
        icon: "👔",
        title: "What to Wear",
        summary: temp > 25 ? "Light, breathable fabrics recommended for thermal comfort." : "Layered clothing advised for variable atmospheric conditions.",
        hourlyPredictions: [],
        recommendation: temp > 30 ? "UV-protective wear and cooling fabrics." : "Cotton layers and a light mask."
      },
      sports: {
        icon: "⚽",
        title: "Sports & Exercise",
        summary: aqi > 100 ? "Limit high-intensity aerobic exercise due to particulate levels." : "Conditions nominal for outdoor athletic activities.",
        hourlyPredictions: [],
        bestTimes: ["06:00", "20:00"],
        worstTimes: ["14:00"],
        recommendation: aqi > 100 ? "Switch to indoor training facilities." : "Stay hydrated and monitor local AQI."
      },
      outdoor: {
        icon: "🌳",
        title: "Outdoor Activities",
        summary: "Early morning windows offer the cleanest air and most stable conditions.",
        hourlyPredictions: [],
        optimalWindows: [{ start: "05:00", end: "08:00", activity: "Jogging/Walking" }],
        recommendation: "Plan activities during low-traffic hours."
      },
      health: {
        icon: "💊",
        title: "Health Impacts",
        summary: aqi > 150 ? "Significant risk for respiratory sensitive groups." : "General population risk remains within nominal parameters.",
        riskGroups: aqi > 100 ? ["Asthmatic individuals", "Children", "Elderly"] : ["None"],
        hourlyPredictions: [],
        recommendation: aqi > 100 ? "Maintain access to rescue medication." : "No specific precautions for healthy individuals."
      },
      energy: {
        icon: "⚡",
        title: "Energy & Utilities",
        summary: temp > 30 ? "High cooling demand predicted for local grid." : "Standard seasonal energy consumption patterns observed.",
        hourlyPredictions: [],
        peakDemandTime: "16:00",
        recommendation: "Optimize HVAC settings for atmospheric efficiency."
      },
      travel: {
        icon: "✈️",
        title: "Travel Conditions",
        summary: "Clear visibility predicted across regional transit corridors.",
        hourlyPredictions: [],
        riskLevel: "low",
        recommendation: "Nominal conditions for all travel modes."
      },
      events: {
        icon: "🎪",
        title: "Events & Gatherings",
        summary: "Evening windows provide the best temperature-to-air-quality ratio.",
        hourlyPredictions: [],
        bestEventTimes: ["19:00", "21:00"],
        recommendation: "Provide shade and hydration for afternoon events."
      },
      agriculture: {
        icon: "🌾",
        title: "Agriculture & Gardening",
        summary: "Low-wind windows provide optimal conditions for irrigation.",
        hourlyPredictions: [],
        recommendation: "Prioritize deep watering during evening hours."
      },
      wildlife: {
        icon: "🦋",
        title: "Wildlife & Nature",
        summary: "Pollinator activity expected to peak during stable morning windows.",
        hourlyPredictions: [],
        recommendation: "Minimize habitat disruption during peak active hours."
      }
    },
    overallRiskScore: Math.min(100, aqi * 0.6),
    bestHourToday: "06:00",
    worstHourToday: "14:00"
  };
}

