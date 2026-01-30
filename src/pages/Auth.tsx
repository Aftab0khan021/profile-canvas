import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Turnstile } from '@marsidev/react-turnstile';
import { verifyTurnstileToken } from '@/integrations/supabase/turnstile';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores, and hyphens'),
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name is too long'),
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
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
  const loginTurnstileRef = useRef<any>(null);
  const signupTurnstileRef = useRef<any>(null);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Don't auto-navigate if user just signed up (we'll manually redirect to verify-email)
    if (user && !justSignedUp) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from, justSignedUp]);

  // Check username availability with debouncing
  useEffect(() => {
    const checkUsername = async () => {
      if (!signupUsername || signupUsername.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setIsCheckingUsername(true);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', signupUsername.toLowerCase())
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking username:', error);
          setUsernameAvailable(null);
        } else {
          setUsernameAvailable(!data);
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timer = setTimeout(checkUsername, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [signupUsername]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    // Check Turnstile token
    if (!loginTurnstileToken) {
      toast({
        title: 'Security Check Required',
        description: 'Please complete the security verification',
        variant: 'destructive',
      });
      return;
    }

    // Verify Turnstile token server-side
    const verification = await verifyTurnstileToken(loginTurnstileToken);
    if (!verification.success) {
      toast({
        title: 'Security Verification Failed',
        description: verification.error || 'Please try again',
        variant: 'destructive',
      });
      loginTurnstileRef.current?.reset();
      setLoginTurnstileToken(null);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
      // Reset Turnstile on error
      loginTurnstileRef.current?.reset();
      setLoginTurnstileToken(null);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = signupSchema.safeParse({
      email: signupEmail,
      password: signupPassword,
      username: signupUsername.toLowerCase(),
      fullName: signupFullName,
    });

    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    // Check Turnstile token
    if (!signupTurnstileToken) {
      toast({
        title: 'Security Check Required',
        description: 'Please complete the security verification',
        variant: 'destructive',
      });
      return;
    }

    // Verify Turnstile token server-side
    const verification = await verifyTurnstileToken(signupTurnstileToken);
    if (!verification.success) {
      toast({
        title: 'Security Verification Failed',
        description: verification.error || 'Please try again',
        variant: 'destructive',
      });
      signupTurnstileRef.current?.reset();
      setSignupTurnstileToken(null);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupUsername, signupFullName);
    setIsLoading(false);

    if (error) {
      let message = error.message;

      // Handle duplicate email
      if (message.includes('already registered') || message.includes('User already registered')) {
        message = 'An account with this email already exists. Please login instead.';
      }

      // Handle duplicate username
      else if (message.includes('duplicate key') && message.includes('profiles_username_key')) {
        message = `The username "${signupUsername}" is already taken. Please choose a different username.`;
      }

      // Handle other database errors
      else if (message.includes('Database error') || message.includes('SQLSTATE')) {
        message = 'There was a problem creating your account. Please try again or contact support if the issue persists.';
      }

      toast({
        title: 'Signup Failed',
        description: message,
        variant: 'destructive',
      });
    } else {
      // Mark that user just signed up to prevent auto-navigation
      setJustSignedUp(true);

      // Store email for verification page (user session won't exist until email is verified)
      localStorage.setItem('pendingVerificationEmail', signupEmail);

      toast({
        title: 'Welcome to FolioX!',
        description: 'Your account has been created. Please check your email to verify your account.',
      });

      // Redirect to verify-email page after auth state settles
      setTimeout(() => {
        navigate('/verify-email');
      }, 1500);
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
          <p className="text-muted-foreground">Build your stunning portfolio in minutes</p>
        </div>

        <Card className="glass-card">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Turnstile Security Check */}
                  <div className="flex justify-center">
                    <Turnstile
                      ref={loginTurnstileRef}
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''}
                      onSuccess={(token) => setLoginTurnstileToken(token)}
                      onError={() => setLoginTurnstileToken(null)}
                      onExpire={() => setLoginTurnstileToken(null)}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full Name</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="John Doe"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        foliox.com/p/
                      </span>
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="johndoe"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        className="pl-28 pr-10"
                        required
                      />
                      {signupUsername.length >= 3 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isCheckingUsername ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : usernameAvailable === true ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : usernameAvailable === false ? (
                            <XCircle className="h-4 w-4 text-destructive" />
                          ) : null}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {signupUsername.length >= 3 && usernameAvailable === false ? (
                        <span className="text-destructive">This username is already taken</span>
                      ) : signupUsername.length >= 3 && usernameAvailable === true ? (
                        <span className="text-green-500">This username is available</span>
                      ) : (
                        'This will be your public portfolio URL'
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      At least 8 characters
                    </p>
                  </div>

                  {/* Turnstile Security Check */}
                  <div className="flex justify-center">
                    <Turnstile
                      ref={signupTurnstileRef}
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''}
                      onSuccess={(token) => setSignupTurnstileToken(token)}
                      onError={() => setSignupTurnstileToken(null)}
                      onExpire={() => setSignupTurnstileToken(null)}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
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
