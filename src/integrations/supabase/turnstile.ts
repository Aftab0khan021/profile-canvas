import { supabase } from './client';

export interface TurnstileVerificationResult {
    success: boolean;
    error?: string;
    errorCodes?: string[];
}

export async function verifyTurnstileToken(token: string): Promise<TurnstileVerificationResult> {
    try {
        const { data, error } = await supabase.functions.invoke('verify-turnstile', {
            body: { token },
        });

        if (error) {
            console.error('Error calling verify-turnstile function:', error);
            return {
                success: false,
                error: 'Failed to verify security check',
            };
        }

        return data;
    } catch (error) {
        console.error('Exception verifying Turnstile token:', error);
        return {
            success: false,
            error: 'Failed to verify security check',
        };
    }
}
