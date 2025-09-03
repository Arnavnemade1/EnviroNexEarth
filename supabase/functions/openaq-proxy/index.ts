import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, radius = 25000 } = await req.json();

    if (typeof lat !== "number" || typeof lon !== "number") {
      return new Response(
        JSON.stringify({ error: "lat and lon are required numbers" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("OPENAQ_API_KEY") ?? "";

    // OpenAQ v3 API: First get locations near the coordinates
    const locationsUrl = `https://api.openaq.org/v3/locations?coordinates=${lat},${lon}&radius=${radius}&limit=5&order_by=distance`;

    const locRes = await fetch(locationsUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(apiKey ? { "X-API-Key": apiKey } : {}),
      },
    });

    if (!locRes.ok) {
      const text = await locRes.text();
      console.error("OpenAQ locations API error:", locRes.status, text);
      return new Response(
        JSON.stringify({ error: `OpenAQ locations API error: ${locRes.status}`, details: text }),
        { status: locRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const locData = await locRes.json();
    
    if (!locData.results || locData.results.length === 0) {
      return new Response(
        JSON.stringify({ error: "No air quality stations found in this area" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the first location and fetch its latest measurements
    const location = locData.results[0];
    const locationId = location.id;

    const measurementsUrl = `https://api.openaq.org/v3/locations/${locationId}/latest`;

    const measRes = await fetch(measurementsUrl, {
      method: "GET", 
      headers: {
        Accept: "application/json",
        ...(apiKey ? { "X-API-Key": apiKey } : {}),
      },
    });

    if (!measRes.ok) {
      const text = await measRes.text();
      console.error("OpenAQ measurements API error:", measRes.status, text);
      return new Response(
        JSON.stringify({ error: `OpenAQ measurements API error: ${measRes.status}`, details: text }),
        { status: measRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const measData = await measRes.json();

    // Transform v3 format to match v2 format expected by frontend
    const transformedData = {
      results: [{
        coordinates: location.coordinates,
        measurements: measData.results?.map((m: any) => ({
          parameter: m.parameter,
          value: m.value,
          unit: m.unit
        })) || []
      }]
    };

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("openaq-proxy error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});