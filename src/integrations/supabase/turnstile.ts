import { supabase } from './client';
import { logger } from '@/lib/logger';

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
            logger.error('Turnstile verification call failed', error);
            return {
                success: false,
                error: 'Failed to verify security check',
            };
        }

        return data;
    } catch (error) {
        logger.error('Exception verifying Turnstile token', error);
        return {
            success: false,
            error: 'Failed to verify security check',
        };
    }
}
