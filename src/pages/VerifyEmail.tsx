import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, CheckCircle2, RefreshCw, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function VerifyEmail() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [isChecking, setIsChecking] = useState(true);

    // Check if user is already verified
    useEffect(() => {
        const checkVerification = async () => {
            // Wait a bit for auth state to settle after signup
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check if we have a pending verification email (user won't have session until verified)
            const pendingEmail = localStorage.getItem('pendingVerificationEmail');

            if (!user && !pendingEmail) {
                // No user and no pending verification, redirect to auth
                navigate('/auth');
                return;
            }

            if (user) {
                // User has session, check if already verified
                const { data: { user: refreshedUser } } = await supabase.auth.getUser();

                if (refreshedUser?.email_confirmed_at) {
                    // Clear pending email if it exists
                    localStorage.removeItem('pendingVerificationEmail');

                    toast({
                        title: 'Email Verified!',
                        description: 'Your email has been verified. Redirecting to dashboard...',
                    });
                    setTimeout(() => navigate('/dashboard'), 1500);
                    return;
                }
            }

            // Show verification page
            setIsChecking(false);
        };

        checkVerification();
    }, [user, navigate, toast]);

    // Poll for verification status every 5 seconds
    useEffect(() => {
        if (isChecking) return;

        const interval = setInterval(async () => {
            const { data: { user: refreshedUser } } = await supabase.auth.getUser();

            if (refreshedUser?.email_confirmed_at) {
                clearInterval(interval);
                toast({
                    title: 'Email Verified!',
                    description: 'Your email has been verified. Redirecting to dashboard...',
                });
                setTimeout(() => navigate('/dashboard'), 1500);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isChecking, navigate, toast]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleResendEmail = async () => {
        const email = user?.email || localStorage.getItem('pendingVerificationEmail');

        if (!email || cooldown > 0) return;

        setIsResending(true);

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) throw error;

            toast({
                title: 'Verification Email Sent',
                description: `We've sent a new verification email to ${email}`,
            });

            // Set 60 second cooldown
            setCooldown(60);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to resend verification email',
                variant: 'destructive',
            });
        } finally {
            setIsResending(false);
        }
    };

    const handleLogout = async () => {
        // Clear pending email
        localStorage.removeItem('pendingVerificationEmail');
        await signOut();
        navigate('/auth');
    };

    // Get email to display
    const displayEmail = user?.email || localStorage.getItem('pendingVerificationEmail');

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Checking verification status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="absolute inset-0 hero-gradient pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <Card className="glass-card">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                        <CardDescription>
                            We've sent a verification email to
                        </CardDescription>
                        <p className="text-sm font-medium text-foreground mt-2">
                            {displayEmail}
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-medium mb-1">Check your inbox</p>
                                    <p className="text-muted-foreground">
                                        Click the verification link in the email we sent you
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-medium mb-1">Check spam folder</p>
                                    <p className="text-muted-foreground">
                                        Sometimes verification emails end up in spam
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <RefreshCw className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-medium mb-1">Auto-refresh enabled</p>
                                    <p className="text-muted-foreground">
                                        This page will automatically redirect once verified
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={handleResendEmail}
                                disabled={isResending || cooldown > 0}
                                className="w-full"
                                variant="outline"
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : cooldown > 0 ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Resend in {cooldown}s
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Resend Verification Email
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={handleLogout}
                                variant="ghost"
                                className="w-full"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>

                        <div className="text-center text-xs text-muted-foreground">
                            <p>Didn't receive the email?</p>
                            <p className="mt-1">
                                Make sure {displayEmail} is correct and check your spam folder
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    <a href="/" className="hover:text-primary transition-colors">
                        ← Back to home
                    </a>
                </p>
            </div>
        </div>
    );
}
