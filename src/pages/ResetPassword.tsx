import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        // Check if we have a valid recovery session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsValidSession(true);
            } else {
                toast({
                    title: 'Invalid or Expired Link',
                    description: 'Please request a new password reset link.',
                    variant: 'destructive',
                });
                setTimeout(() => navigate('/forgot-password'), 3000);
            }
        });
    }, [navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = passwordSchema.safeParse({ password, confirmPassword });
        if (!result.success) {
            toast({
                title: 'Validation Error',
                description: result.error.errors[0].message,
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        setIsLoading(false);

        if (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            setIsSuccess(true);
            toast({
                title: 'Password Updated',
                description: 'Your password has been successfully reset.',
            });
            setTimeout(() => navigate('/dashboard'), 2000);
        }
    };

    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="absolute inset-0 hero-gradient pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold">FolioX</span>
                    </div>
                    <p className="text-muted-foreground">Create a new password</p>
                </div>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>
                            {isSuccess
                                ? "Your password has been successfully reset."
                                : "Enter your new password below."
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSuccess ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center p-4 rounded-lg bg-green-500/10">
                                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                                </div>
                                <p className="text-center text-sm text-muted-foreground">
                                    Redirecting you to the dashboard...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        At least 6 characters
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating Password...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
