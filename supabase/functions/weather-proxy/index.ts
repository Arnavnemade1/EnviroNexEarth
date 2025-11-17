import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();

    if (action === 'global-clouds') {
      // Generate realistic global cloud data
      const clouds: any[] = [];
      const timestamp = Date.now();

      // Sample points across the globe
      for (let lat = -80; lat <= 80; lat += 15) {
        for (let lng = -180; lng < 180; lng += 15) {
          // Use noise-like patterns for realistic cloud coverage
          const latFactor = Math.abs(lat / 90);
          const baseClouds = 50 + Math.sin(lng * 0.1) * 20 + Math.cos(lat * 0.1) * 15;
          const variation = Math.random() * 30 - 15;
          const cloudCoverage = Math.max(0, Math.min(100, baseClouds + variation));

          clouds.push({
            lat,
            lng,
            clouds: Math.round(cloudCoverage),
            weather: cloudCoverage > 70 ? 'Cloudy' : cloudCoverage > 40 ? 'Partly Cloudy' : 'Clear',
            temp: Math.round(15 - Math.abs(lat) * 0.3 + Math.random() * 5),
            humidity: 50
          });
        }
      }

      return new Response(
        JSON.stringify({ timestamp, clouds }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Weather proxy error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});