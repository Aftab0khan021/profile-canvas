import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, ArrowLeft, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

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
      toast({ title: 'Validation Error', description: result.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const redirectUrl = import.meta.env.VITE_APP_URL || 'https://portfolio-hubs.vercel.app';
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${redirectUrl}/reset-password` });
    setIsLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setEmailSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      <div className="absolute inset-0 mesh-bg opacity-50" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-6">
            <div className="h-9 w-9 rounded-xl btn-gradient flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-display font-bold">FolioX</span>
          </Link>
        </div>

        <div className="bento-card p-8 rounded-3xl shadow-xl">
          <AnimatePresence mode="wait">
            {emailSent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </motion.div>
                <h2 className="font-display text-xl font-bold mb-2">Check your email</h2>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. The link expires in 1 hour.
                </p>
                <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => setEmailSent(false)}>
                  Send another email
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h1 className="font-display text-2xl font-bold mb-1.5">Forgot your password?</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Enter your email and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}
                      className="h-11 rounded-xl bg-muted/50 border-border/60 focus:bg-background transition-colors" />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl btn-gradient font-semibold text-sm" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                      : <>Send Reset Link <ArrowRight className="ml-1.5 h-4 w-4" /></>}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/auth" className="hover:text-foreground transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
