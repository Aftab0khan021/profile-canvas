import { useState, useEffect, useRef } from 'react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Turnstile } from '@marsidev/react-turnstile';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-z0-9_-]+$/, 'Lowercase letters, numbers, _ and - only'),
  fullName: z.string().min(1, 'Full name is required').max(100),
});

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [loginTurnstileToken, setLoginTurnstileToken] = useState<string | null>(null);
  const [signupTurnstileToken, setSignupTurnstileToken] = useState<string | null>(null);
  const loginTurnstileRef = useRef<TurnstileInstance>(null);
  const signupTurnstileRef = useRef<TurnstileInstance>(null);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user && !justSignedUp) navigate(from, { replace: true });
  }, [user, navigate, from, justSignedUp]);

  useEffect(() => {
    const check = async () => {
      if (!signupUsername || signupUsername.length < 3) { setUsernameAvailable(null); return; }
      setIsCheckingUsername(true);
      try {
        const { data, error } = await supabase.from('profiles').select('username').eq('username', signupUsername.toLowerCase()).maybeSingle();
        if (error && error.code !== 'PGRST116') { setUsernameAvailable(null); }
        else setUsernameAvailable(!data);
      } catch { setUsernameAvailable(null); }
      finally { setIsCheckingUsername(false); }
    };
    const t = setTimeout(check, 500);
    return () => clearTimeout(t);
  }, [signupUsername]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) { toast({ title: 'Error', description: result.error.errors[0].message, variant: 'destructive' }); return; }
    if (!loginTurnstileToken) { toast({ title: 'Complete the security check', variant: 'destructive' }); return; }
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword, loginTurnstileToken);
    setIsLoading(false);
    if (error) { toast({ title: 'Login failed', description: error.message, variant: 'destructive' }); loginTurnstileRef.current?.reset(); setLoginTurnstileToken(null); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse({ email: signupEmail, password: signupPassword, username: signupUsername.toLowerCase(), fullName: signupFullName });
    if (!result.success) { toast({ title: 'Error', description: result.error.errors[0].message, variant: 'destructive' }); return; }
    if (!signupTurnstileToken) { toast({ title: 'Complete the security check', variant: 'destructive' }); return; }
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupUsername, signupFullName, signupTurnstileToken);
    setIsLoading(false);
    if (error) {
      let msg = error.message;
      if (msg.includes('already registered')) msg = 'An account with this email already exists.';
      else if (msg.includes('profiles_username_key')) msg = `Username "${signupUsername}" is already taken.`;
      toast({ title: 'Signup failed', description: msg, variant: 'destructive' });
    } else {
      setJustSignedUp(true);
      localStorage.setItem('pendingVerificationEmail', signupEmail);
      toast({ title: 'Account created!', description: 'Check your email to verify your account.' });
      setTimeout(() => navigate('/verify-email'), 1500);
    }
  };

  const tabVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 12 : -12 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -12 : 12, transition: { duration: 0.18 } }),
  };
  const dir = activeTab === 'signup' ? 1 : -1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple top bar */}
      <div className="h-[52px] flex items-center justify-between px-5 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2 group">
          <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-[22px] w-[22px] rounded-[5px] bg-[#0E0E0E] dark:bg-[#C6F135] flex items-center justify-center">
            <span className="text-[9px] font-bold text-white dark:text-[#0E0E0E] font-mono">Fx</span>
          </div>
          <span className="font-display font-bold text-sm">FolioX</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Left — dark branding column */}
        <div
          className="hidden lg:flex w-[42%] xl:w-[45%] flex-col justify-between p-10 relative overflow-hidden"
          style={{ background: '#0E0E0E' }}
        >
          {/* Background text watermark */}
          <div
            className="absolute bottom-0 left-0 right-0 leading-none font-display font-bold select-none pointer-events-none overflow-hidden"
            style={{ fontSize: 'clamp(100px, 18vw, 200px)', color: 'rgba(255,255,255,0.03)', lineHeight: 0.85 }}
            aria-hidden="true"
          >
            FolioX
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] font-mono text-xs font-semibold tracking-widest"
              style={{ background: 'rgba(198,241,53,0.08)', color: '#C6F135', border: '1px solid rgba(198,241,53,0.15)' }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#C6F135' }} />
              10,000+ portfolios built
            </div>
          </div>

          <div>
            <h2 className="font-display text-[clamp(32px,4vw,52px)] font-bold text-[#F0EDE6] leading-[1.05] tracking-tight mb-5">
              Your work.<br />
              Their first<br />
              impression.
            </h2>
            <p className="text-[#5A5750] text-sm leading-relaxed max-w-xs">
              Build a portfolio that stands out, loads fast, and tells your story exactly the way you want.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { n: '01', text: 'Live in under 5 minutes' },
                { n: '02', text: 'Beautiful, customizable themes' },
                { n: '03', text: 'Built-in analytics & blog' },
              ].map(f => (
                <div key={f.n} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-[10px] text-[#3A3830]">{f.n}</span>
                  <span className="text-[#8C8982]">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="rounded-xl p-4 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[#6A6660] text-xs leading-relaxed mb-3 italic">
              "FolioX helped me land my dream role. Recruiters kept complimenting how polished my portfolio looked."
            </p>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full" style={{ background: '#C6F135', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-[10px] font-bold text-[#0E0E0E]">AJ</span>
              </div>
              <div>
                <p className="text-[#8C8982] text-xs font-semibold">Alex Johnson</p>
                <p className="text-[#3A3830] text-[10px] font-mono">Frontend Developer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[380px]">
            {/* Tab switcher */}
            <div className="flex mb-8 border-b border-border">
              {(['login', 'signup'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative flex-1 pb-3 text-sm font-semibold transition-colors duration-200"
                  style={{ color: activeTab === tab ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}
                >
                  {tab === 'login' ? 'Sign in' : 'Create account'}
                  {activeTab === tab && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-foreground"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" custom={dir}>
              {activeTab === 'login' ? (
                <motion.div key="login" custom={dir} variants={tabVariants} initial="enter" animate="center" exit="exit">
                  <div className="mb-7">
                    <h1 className="font-display text-[22px] font-bold tracking-tight mb-1">Welcome back</h1>
                    <p className="text-muted-foreground text-sm">Sign in to manage your portfolio</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">Email</Label>
                      <Input type="email" placeholder="you@example.com" value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)} required
                        className="h-10 rounded-lg bg-muted/40 border-border/60 text-sm focus:bg-background focus:border-foreground/30 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">Password</Label>
                        <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Forgot?</Link>
                      </div>
                      <div className="relative">
                        <Input type={showLoginPass ? 'text' : 'password'} placeholder="••••••••" value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)} required
                          className="h-10 rounded-lg bg-muted/40 border-border/60 text-sm focus:bg-background focus:border-foreground/30 transition-all pr-10" />
                        <button type="button" onClick={() => setShowLoginPass(!showLoginPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showLoginPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Turnstile ref={loginTurnstileRef} siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''} onSuccess={setLoginTurnstileToken} onError={() => setLoginTurnstileToken(null)} onExpire={() => setLoginTurnstileToken(null)} />
                    </div>
                    <button type="submit" disabled={isLoading}
                      className="btn-primary w-full h-10 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
                      {isLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Signing in...</> : <>Sign in <ArrowRight className="h-3.5 w-3.5" /></>}
                    </button>
                  </form>
                  <p className="text-center text-xs text-muted-foreground mt-5">
                    No account?{' '}
                    <button onClick={() => setActiveTab('signup')} className="font-semibold text-foreground hover:underline">Create one free</button>
                  </p>
                </motion.div>
              ) : (
                <motion.div key="signup" custom={dir} variants={tabVariants} initial="enter" animate="center" exit="exit">
                  <div className="mb-7">
                    <h1 className="font-display text-[22px] font-bold tracking-tight mb-1">Create your account</h1>
                    <p className="text-muted-foreground text-sm">Free forever. No credit card needed.</p>
                  </div>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">Full Name</Label>
                      <Input type="text" placeholder="John Doe" value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)} required
                        className="h-10 rounded-lg bg-muted/40 border-border/60 text-sm focus:bg-background transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">Username</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono pointer-events-none select-none">/p/</span>
                        <Input type="text" placeholder="johndoe" value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                          className="h-10 rounded-lg bg-muted/40 border-border/60 text-sm focus:bg-background transition-all pl-9 pr-8" required />
                        {signupUsername.length >= 3 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isCheckingUsername ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                              : usernameAvailable === true ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                : usernameAvailable === false ? <XCircle className="h-3.5 w-3.5 text-red-500" /> : null}
                          </div>
                        )}
                      </div>
                      {signupUsername.length >= 3 && (
                        <p className={`text-[11px] font-mono ${usernameAvailable === false ? 'text-red-500' : usernameAvailable === true ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {usernameAvailable === false ? 'Username taken' : usernameAvailable === true ? 'Username available ✓' : 'Checking...'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">Email</Label>
                      <Input type="email" placeholder="you@example.com" value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)} required
                        className="h-10 rounded-lg bg-muted/40 border-border/60 text-sm focus:bg-background transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">Password</Label>
                      <div className="relative">
                        <Input type={showSignupPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)} required
                          className="h-10 rounded-lg bg-muted/40 border-border/60 text-sm focus:bg-background transition-all pr-10" />
                        <button type="button" onClick={() => setShowSignupPass(!showSignupPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showSignupPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Turnstile ref={signupTurnstileRef} siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''} onSuccess={setSignupTurnstileToken} onError={() => setSignupTurnstileToken(null)} onExpire={() => setSignupTurnstileToken(null)} />
                    </div>
                    <button type="submit" disabled={isLoading}
                      className="btn-primary w-full h-10 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
                      {isLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Creating account...</> : <>Create free account <ArrowRight className="h-3.5 w-3.5" /></>}
                    </button>
                  </form>
                  <p className="text-center text-xs text-muted-foreground mt-5">
                    Already have an account?{' '}
                    <button onClick={() => setActiveTab('login')} className="font-semibold text-foreground hover:underline">Sign in</button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
