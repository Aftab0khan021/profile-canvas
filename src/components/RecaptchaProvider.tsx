import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ReactNode } from 'react';

interface RecaptchaProviderProps {
    children: ReactNode;
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    if (!recaptchaSiteKey) {
        console.warn('reCAPTCHA site key not found. CAPTCHA protection is disabled.');
        return <>{children}</>;
    }

    return (
        <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
            {children}
        </GoogleReCaptchaProvider>
    );
}
