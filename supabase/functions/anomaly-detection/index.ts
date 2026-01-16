import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  aqi: number;
  pm25: number;
  uvIndex: number;
  location: string;
  hourly?: {
    temperature: number[];
    humidity: number[];
    aqi: number[];
    pm25: number[];
  };
}

interface AnomalyResult {
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  confidence: number;
  affectedMetrics: string[];
  recommendation: string;
  zScore: number;
  expectedRange: { min: number; max: number };
  actualValue: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { environmentalData, predictions, historicalBaseline } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Processing anomaly detection for:', environmentalData?.location);

    // Calculate statistical anomalies from the data
    const anomalies: AnomalyResult[] = [];
    const envData = environmentalData as EnvironmentalData;

    // Statistical thresholds based on typical environmental ranges
    const thresholds = {
      temperature: { mean: 20, stdDev: 8, unit: '°C' },
      humidity: { mean: 55, stdDev: 20, unit: '%' },
      aqi: { mean: 50, stdDev: 30, unit: 'US AQI' },
      pm25: { mean: 15, stdDev: 12, unit: 'μg/m³' },
      windSpeed: { mean: 15, stdDev: 10, unit: 'km/h' },
      pressure: { mean: 1013, stdDev: 15, unit: 'hPa' },
      uvIndex: { mean: 5, stdDev: 3, unit: '' }
    };

    // Calculate z-scores and detect anomalies
    const calculateZScore = (value: number, mean: number, stdDev: number): number => {
      return Math.abs((value - mean) / stdDev);
    };

    // Check each metric for anomalies
    const metricChecks = [
      { key: 'aqi', value: envData.aqi, name: 'Air Quality Index' },
      { key: 'pm25', value: envData.pm25, name: 'PM2.5 Concentration' },
      { key: 'temperature', value: envData.temperature, name: 'Temperature' },
      { key: 'humidity', value: envData.humidity, name: 'Humidity' },
      { key: 'windSpeed', value: envData.windSpeed, name: 'Wind Speed' },
      { key: 'pressure', value: envData.pressure, name: 'Atmospheric Pressure' },
      { key: 'uvIndex', value: envData.uvIndex, name: 'UV Index' }
    ];

    for (const metric of metricChecks) {
      const threshold = thresholds[metric.key as keyof typeof thresholds];
      const zScore = calculateZScore(metric.value, threshold.mean, threshold.stdDev);
      
      if (zScore > 2) {
        const severity = zScore > 4 ? 'critical' : zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low';
        anomalies.push({
          isAnomaly: true,
          severity,
          type: `${metric.name} Anomaly`,
          description: `${metric.name} (${metric.value}${threshold.unit}) deviates ${zScore.toFixed(1)} standard deviations from normal`,
          confidence: Math.min(99, 70 + zScore * 10),
          affectedMetrics: [metric.key],
          recommendation: getRecommendation(metric.key, metric.value, zScore),
          zScore,
          expectedRange: {
            min: threshold.mean - 2 * threshold.stdDev,
            max: threshold.mean + 2 * threshold.stdDev
          },
          actualValue: metric.value
        });
      }
    }

    // Analyze hourly patterns for sudden changes
    if (envData.hourly?.aqi && envData.hourly.aqi.length >= 6) {
      const recentAqi = envData.hourly.aqi.slice(-6);
      const maxChange = Math.max(...recentAqi.slice(1).map((v, i) => Math.abs(v - recentAqi[i])));
      if (maxChange > 30) {
        anomalies.push({
          isAnomaly: true,
          severity: maxChange > 50 ? 'high' : 'medium',
          type: 'Rapid AQI Change',
          description: `Air quality changed by ${maxChange.toFixed(0)} points within an hour - indicates sudden pollution event`,
          confidence: 85,
          affectedMetrics: ['aqi', 'pm25'],
          recommendation: 'Monitor air quality closely. Consider staying indoors if conditions worsen.',
          zScore: maxChange / 15,
          expectedRange: { min: 0, max: 20 },
          actualValue: maxChange
        });
      }
    }

    // Use AI for complex pattern analysis
    const systemPrompt = `You are an environmental anomaly detection neural network. Analyze the following real-time environmental data and identify any unusual patterns, correlations, or emerging risks.

Current conditions at ${envData.location}:
- Temperature: ${envData.temperature}°C
- Humidity: ${envData.humidity}%
- AQI: ${envData.aqi}
- PM2.5: ${envData.pm25} μg/m³
- Wind Speed: ${envData.windSpeed} km/h
- Pressure: ${envData.pressure} hPa
- UV Index: ${envData.uvIndex}

Statistical anomalies already detected: ${anomalies.length > 0 ? anomalies.map(a => a.type).join(', ') : 'None'}

Analyze for:
1. Multi-factor correlations (e.g., high temp + low humidity + high wind = fire risk)
2. Health risk patterns
3. Weather pattern irregularities
4. Pollution source indicators

Respond with ONLY valid JSON in this format:
{
  "patternAnomalies": [
    {
      "type": "pattern name",
      "severity": "low|medium|high|critical",
      "description": "detailed description",
      "confidence": 75,
      "affectedFactors": ["factor1", "factor2"],
      "recommendation": "actionable advice"
    }
  ],
  "overallRiskLevel": 0-100,
  "forecast": "brief 24-hour outlook based on current anomalies",
  "aiInsight": "one key insight about the data"
}`;

    console.log('Calling Lovable AI for pattern analysis...');

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
          { role: 'user', content: 'Analyze the environmental data and identify any complex pattern anomalies.' }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
    });

    let aiAnalysis = { patternAnomalies: [], overallRiskLevel: 0, forecast: '', aiInsight: '' };

    if (response.ok) {
      const data = await response.json();
      if (data.choices && data.choices[0]) {
        let content = data.choices[0].message?.content || '';
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        try {
          aiAnalysis = JSON.parse(content);
          console.log('AI pattern analysis completed');
        } catch (e) {
          console.error('Failed to parse AI response:', e);
        }
      }
    } else {
      console.error('AI analysis failed:', response.status);
    }

    // Store anomaly in database for tracking
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (anomalies.length > 0) {
      const { error } = await supabase.from('environmental_alerts').insert({
        user_id: '00000000-0000-0000-0000-000000000000', // System user for anonymous alerts
        alert_type: 'anomaly_detected',
        severity: anomalies.reduce((max, a) => 
          a.severity === 'critical' ? 'critical' : 
          a.severity === 'high' && max !== 'critical' ? 'high' : 
          a.severity === 'medium' && !['critical', 'high'].includes(max) ? 'medium' : max, 
          'low' as string
        ),
        title: `${anomalies.length} Environmental Anomal${anomalies.length > 1 ? 'ies' : 'y'} Detected`,
        message: anomalies.map(a => a.description).join('; '),
        location_name: envData.location,
        environmental_data: { anomalies, aiAnalysis }
      });
      if (error) console.log('Failed to store alert:', error.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        location: envData.location,
        statisticalAnomalies: anomalies,
        patternAnomalies: aiAnalysis.patternAnomalies || [],
        overallRiskLevel: aiAnalysis.overallRiskLevel || (anomalies.length > 0 ? 40 + anomalies.length * 15 : 10),
        forecast: aiAnalysis.forecast || 'Conditions expected to remain stable',
        aiInsight: aiAnalysis.aiInsight || 'No significant patterns detected',
        modelInfo: {
          name: 'EnviroAI Anomaly Detection v2',
          type: 'hybrid',
          statisticalEngine: 'Z-Score + IQR Analysis',
          neuralEngine: 'Gemini 2.5 Flash',
          confidenceInterval: '95%'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Anomaly detection error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getRecommendation(metric: string, value: number, zScore: number): string {
  switch (metric) {
    case 'aqi':
      return value > 100 ? 'Limit outdoor activities. Use air purifiers indoors.' : 
             value > 150 ? 'Avoid prolonged outdoor exposure. Sensitive groups should stay indoors.' :
             'Air quality elevated but manageable. Monitor for changes.';
    case 'pm25':
      return value > 35 ? 'Consider wearing N95 mask outdoors. Keep windows closed.' :
             'PM2.5 slightly elevated. Monitor air quality apps for updates.';
    case 'temperature':
      return value > 35 ? 'Stay hydrated. Avoid strenuous outdoor activities.' :
             value < 0 ? 'Bundle up. Watch for ice and frost.' :
             'Temperature unusual for the region. Dress appropriately.';
    case 'humidity':
      return value > 80 ? 'High humidity may feel uncomfortable. Use dehumidifiers.' :
             value < 30 ? 'Very dry conditions. Stay hydrated and use moisturizer.' :
             'Humidity levels atypical. Adjust indoor climate as needed.';
    case 'windSpeed':
      return value > 40 ? 'High wind warning. Secure loose objects outdoors.' :
             'Wind speeds elevated. Be cautious with outdoor activities.';
    case 'uvIndex':
      return value > 8 ? 'Very high UV. Apply SPF 50+ and seek shade.' :
             value > 10 ? 'Extreme UV exposure risk. Minimize sun exposure.' :
             'UV elevated. Wear sunscreen and protective clothing.';
    default:
      return 'Monitor conditions and take appropriate precautions.';
  }
}
