import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, ArrowLeft, Mail } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectUrl}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setEmailSent(true);
      toast({
        title: 'Email Sent',
        description: 'Check your email for password reset instructions.',
      });
    }
  };

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
          <p className="text-muted-foreground">Reset your password</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              {emailSent
                ? "We've sent you an email with instructions to reset your password."
                : "Enter your email address and we'll send you a link to reset your password."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 rounded-lg bg-primary/10">
                  <Mail className="h-12 w-12 text-primary" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Check your email inbox and click the link to reset your password.
                  The link will expire in 1 hour.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Send another email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/auth" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
