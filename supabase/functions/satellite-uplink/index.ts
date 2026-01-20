import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { latitude, longitude } = await req.json()

        if (!latitude || !longitude) {
            throw new Error('Missing coordinates')
        }

        console.log(`Establishing satellite uplink for coordinates: ${latitude}, ${longitude}`)

        // Fetch real-time air quality and solar data from OpenMeteo (Satellite-derived)
        const response = await fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust&hourly=uv_index`
        )

        const data = await response.json()
        const current = data.current

        // Simulate satellite telemetry format
        const telemetry = {
            timestamp: new Date().toISOString(),
            satellite_id: 'TEMPO-1',
            orbit_segment: 'DESCENDING',
            scan_angle: (Math.random() * 40 - 20).toFixed(2),
            quality_flag: 'NOMINAL',
            spectral_bands: {
                'UV-VIS': {
                    nitrogen_dioxide: {
                        value: current.nitrogen_dioxide,
                        unit: 'μg/m³',
                        column_density: (current.nitrogen_dioxide * 1.8e15).toExponential(2) // Simulated column density
                    },
                    ozone: {
                        value: current.ozone,
                        unit: 'μg/m³',
                        dobson_units: (current.ozone * 0.47).toFixed(1)
                    },
                    formaldehyde: {
                        value: (Math.random() * 5 + 1).toFixed(2), // Simulated as not always available
                        unit: 'μg/m³'
                    }
                },
                'AEROSOL': {
                    aod: current.aerosol_optical_depth || 0.15,
                    dust_mass: current.dust || 0,
                    pm10: current.pm10
                }
            },
            raw_stream: Array.from({ length: 5 }, () => Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0'))
        }

        return new Response(JSON.stringify(telemetry), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Satellite uplink failed:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
