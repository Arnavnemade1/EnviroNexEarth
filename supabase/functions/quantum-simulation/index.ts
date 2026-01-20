import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch all active models
        const { data: models, error: modelsError } = await supabaseClient
            .from('models')
            .select('*')

        if (modelsError) throw modelsError

        const metrics = []

        // 2. Generate simulated metrics for each model
        // Fetch real quantum entropy from ANU QRNG (Keyless, Public API)
        let quantumEntropy = 0.5; // Default fallback

        try {
            console.log('Attempting to connect to ANU Quantum Random Number Generator...');
            // Fetch 1 byte of quantum randomness (0-255)
            const response = await fetch('https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8');

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data && data.data.length > 0) {
                    const quantumValue = data.data[0]; // 0-255
                    quantumEntropy = quantumValue / 255; // Normalize to 0-1
                    console.log('ANU Quantum Value received:', quantumValue, 'Entropy:', quantumEntropy);
                } else {
                    console.warn('ANU API response format unexpected:', data);
                }
            } else {
                console.warn('ANU API call failed, falling back to simulation:', response.status);
            }
        } catch (err) {
            console.error('Error calling ANU QRNG API:', err);
        }


        for (const model of models) {
            // Simulate quantum noise/drift using the quantum entropy
            // Accuracy varies slightly around the base accuracy (+/- 1.5%)
            // We mix the quantum entropy with local random to ensure variance between models
            const localRandom = Math.random();
            const combinedEntropy = (quantumEntropy + localRandom) / 2;

            const accuracyVariance = (combinedEntropy * 3) - 1.5;
            let simulatedAccuracy = model.base_accuracy + accuracyVariance

            // Clamp accuracy between 0 and 100
            simulatedAccuracy = Math.min(100, Math.max(0, simulatedAccuracy))

            // Latency varies based on "quantum coherence" simulation (+/- 10%)
            const latencyVariance = (combinedEntropy * 0.2) - 0.1
            const simulatedLatency = Math.round(model.base_latency * (1 + latencyVariance))

            metrics.push({
                model_id: model.id,
                accuracy: parseFloat(simulatedAccuracy.toFixed(2)),
                latency: simulatedLatency,
                timestamp: new Date().toISOString(),
            })
        }

        // 3. Insert metrics into the database
        const { error: insertError } = await supabaseClient
            .from('model_metrics')
            .insert(metrics)

        if (insertError) throw insertError

        return new Response(
            JSON.stringify({ success: true, message: `Generated metrics for ${metrics.length} models` }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})
