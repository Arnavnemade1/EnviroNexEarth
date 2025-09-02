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

    const url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=${radius}&limit=1&order_by=distance`;

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
      return new Response(
        JSON.stringify({ error: `OpenAQ API error: ${res.status}`, details: text }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = JSON.parse(text);

    return new Response(JSON.stringify(data), {
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