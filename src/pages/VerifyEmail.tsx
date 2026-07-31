import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, RefreshCw, LogOut, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isChecking, setIsChecking] = useState(true);
  const [pollExpired, setPollExpired] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pendingEmail = localStorage.getItem('pendingVerificationEmail');
      if (!user && !pendingEmail) { navigate('/auth'); return; }
      if (user) {
        const { data: { user: refreshedUser } } = await supabase.auth.getUser();
        if (refreshedUser?.email_confirmed_at) {
          localStorage.removeItem('pendingVerificationEmail');
          toast({ title: 'Email Verified!', description: 'Redirecting to dashboard...' });
          setTimeout(() => navigate('/dashboard'), 1500);
          return;
        }
      }
      setIsChecking(false);
    };
    checkVerification();
  }, [user, navigate, toast]);

  useEffect(() => {
    if (isChecking) return;
    let attempts = 0;
    const MAX_ATTEMPTS = 60;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts >= MAX_ATTEMPTS) { clearInterval(interval); setPollExpired(true); return; }
      const { data: { user: refreshedUser } } = await supabase.auth.getUser();
      if (refreshedUser?.email_confirmed_at) {
        clearInterval(interval);
        toast({ title: 'Email Verified!', description: 'Redirecting to dashboard...' });
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isChecking, navigate, toast]);

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
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      toast({ title: 'Email Sent', description: `Verification email sent to ${email}` });
      setCooldown(60);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to resend', variant: 'destructive' });
    } finally { setIsResending(false); }
  };

  const handleLogout = async () => {
    localStorage.removeItem('pendingVerificationEmail');
    await signOut();
    navigate('/auth');
  };

  const displayEmail = user?.email || localStorage.getItem('pendingVerificationEmail');

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Checking verification status...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { icon: Mail, title: 'Check your inbox', desc: 'Click the verification link in the email we sent you', done: false },
    { icon: CheckCircle2, title: 'Check spam folder', desc: 'Sometimes emails end up in spam or promotions', done: false },
    { icon: RefreshCw, title: 'Auto-redirect enabled', desc: pollExpired ? 'Auto-check timed out. Refresh or click the email link.' : 'This page will redirect automatically once verified', done: false },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 mesh-bg opacity-60" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="bento-card p-8 rounded-3xl shadow-xl">
          {/* Animated mail icon */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mb-5 h-20 w-20 rounded-3xl btn-gradient flex items-center justify-center shadow-lg"
            >
              <Mail className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold mb-2">Check your inbox</h1>
            <p className="text-muted-foreground text-sm">We sent a verification link to</p>
            <p className="font-semibold text-sm mt-0.5 gradient-text">{displayEmail}</p>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/50"
              >
                <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <step.icon className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cooldown ring progress */}
          {cooldown > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-violet-500" />
              Resend available in {cooldown}s
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5">
            <Button onClick={handleResendEmail} disabled={isResending || cooldown > 0} variant="outline" className="w-full h-11 rounded-xl font-semibold border-border/60">
              {isResending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                : <><RefreshCw className="mr-2 h-4 w-4" />Resend Verification Email</>}
            </Button>
            <Button onClick={handleLogout} variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground hover:text-foreground">
              <LogOut className="mr-2 h-4 w-4" />Sign Out
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <a href="/" className="hover:text-foreground transition-colors">← Back to home</a>
        </p>
      </motion.div>
    </div>
  );
}
