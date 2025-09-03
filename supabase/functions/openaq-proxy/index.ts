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

    // Helper to call OpenAQ with proper headers
    const callOpenAQ = async (url: string) => {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(apiKey ? { "X-API-Key": apiKey } : {}),
        },
      });
      const text = await res.text();
      if (!res.ok) {
        console.error("OpenAQ API error:", res.status, text);
        throw new Error(`OpenAQ API error ${res.status}: ${text}`);
      }
      return JSON.parse(text);
    };

    // 1) Try v3/latest directly (preferred)
    const params = new URLSearchParams({
      coordinates: `${lat},${lon}`,
      radius: String(radius),
      limit: "1",
      sort: "distance",
    });
    const latestUrl = `https://api.openaq.org/v3/latest?${params.toString()}`;

    let data: any | null = null;
    try {
      data = await callOpenAQ(latestUrl);
    } catch (e1) {
      // Retry without sort param
      const fallbackParams = new URLSearchParams({
        coordinates: `${lat},${lon}`,
        radius: String(radius),
        limit: "1",
      });
      const latestFallbackUrl = `https://api.openaq.org/v3/latest?${fallbackParams.toString()}`;
      data = await callOpenAQ(latestFallbackUrl);
    }

    if (!data?.results || data.results.length === 0) {
      return new Response(
        JSON.stringify({ error: "No air quality stations found in this area" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const item = data.results[0];

    // measurements may be in item.measurements (v3 latest) or item.parameters (v3 locations)
    let measurements: Array<{ parameter: string; value: number; unit: string }> = [];
    if (Array.isArray(item.measurements)) {
      measurements = item.measurements.map((m: any) => ({
        parameter: m.parameter,
        value: Number(m.value),
        unit: m.unit,
      }));
    } else if (Array.isArray(item.parameters)) {
      measurements = item.parameters
        .filter((p: any) => p?.lastValue != null)
        .map((p: any) => ({
          parameter: p.parameter,
          value: Number(p.lastValue),
          unit: p.unit ?? "µg/m³",
        }));
    }

    const coordinates = item.coordinates ?? item.location?.coordinates ?? { latitude: lat, longitude: lon };

    const transformedData = {
      results: [
        {
          coordinates,
          measurements,
        },
      ],
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