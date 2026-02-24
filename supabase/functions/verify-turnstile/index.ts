import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// H-2: Restrict CORS to known origins — not a wildcard
const ALLOWED_ORIGINS = [
    'https://portfolio-hubs.vercel.app',
    'http://localhost:5173',
    'http://localhost:8080',
];

function getCorsHeaders(req: Request): Record<string, string> {
    const origin = req.headers.get('Origin') || '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
}

interface TurnstileVerifyResponse {
    success: boolean;
    'error-codes'?: string[];
    challenge_ts?: string;
    hostname?: string;
}

serve(async (req) => {
    const corsHeaders = getCorsHeaders(req);

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { token } = await req.json();

        if (!token) {
            return new Response(
                JSON.stringify({ error: 'Turnstile token is required' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        const secretKey = Deno.env.get('TURNSTILE_SECRET_KEY');
        if (!secretKey) {
            console.error('TURNSTILE_SECRET_KEY not configured');
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Verify token with Cloudflare Turnstile
        const verifyResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret: secretKey,
                    response: token,
                }),
            }
        );

        const verifyData: TurnstileVerifyResponse = await verifyResponse.json();

        if (!verifyData.success) {
            console.error('Turnstile verification failed:', verifyData['error-codes']);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Verification failed',
                    errorCodes: verifyData['error-codes'],
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Verification successful
        return new Response(
            JSON.stringify({
                success: true,
                challenge_ts: verifyData.challenge_ts,
                hostname: verifyData.hostname,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error verifying Turnstile token:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
