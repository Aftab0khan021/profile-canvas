import { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPageContent } from '@/hooks/useProfileItems';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Mail, Phone, Linkedin, Github, Send, Loader2, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function PublicContact() {
  const { profile, brandColor } = usePublicLayoutContext();
  const { getContent } = usePublicPageContent(profile?.id);
  const { toast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Get dynamic content
  const heroSubtitle = getContent('contact', 'hero_subtitle', "Have a project in mind, a question, or just want to say hello? I'd love to hear from you.");
  const formSuccessMessage = getContent('contact', 'form_success', "Thanks for reaching out. I'll get back to you soon.");
  const availabilityText = getContent('contact', 'availability_text', 'Available for new projects');

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    // Check if rate limited
    if (rateLimited) {
      toast({
        title: 'Please wait',
        description: `You can send another message in ${cooldownTime} seconds.`,
        variant: 'destructive'
      });
      return;
    }

    setSending(true);

    // Get reCAPTCHA token — abort if unavailable (no silent bypass)
    let recaptchaToken = '';
    if (!executeRecaptcha) {
      setSending(false);
      toast({
        title: 'Security check unavailable',
        description: 'Please refresh the page and try again.',
        variant: 'destructive'
      });
      return;
    }
    try {
      recaptchaToken = await executeRecaptcha('contact_form');
    } catch (error) {
      setSending(false);
      console.error('reCAPTCHA error:', error);
      logger.error('reCAPTCHA verification failed', error);
      toast({
        title: 'Security check failed',
        description: 'Please refresh the page and try again.',
        variant: 'destructive'
      });
      return;
    }

    // IMPORTANT: Always require spam check via Edge Function before saving to DB.
    // If no email is configured, block submission entirely.
    if (!profile.email) {
      setSending(false);
      toast({
        title: 'Contact unavailable',
        description: 'This portfolio does not have a contact email configured.',
        variant: 'destructive'
      });
      return;
    }

    // Use raw fetch to access 429 response body which Supabase client swallows
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          recipient_email: profile.email,
          recipient_name: profile.full_name || 'Portfolio Owner',
          sender_name: contactForm.name,
          sender_email: contactForm.email,
          message: contactForm.message,
          recaptcha_token: recaptchaToken,
          // H-1: Pass portfolio owner's user_id so edge function can persist the message
          // via service_role (client-side anon INSERT policy was removed in security fix H-4)
          portfolio_user_id: profile.id,
        }),
      });

      const responseData = await response.json();

      // Check if rate limited (429 status)
      if (response.status === 429) {
        setSending(false);

        const remainingSeconds = responseData.remainingTime || 120;
        setRateLimited(true);
        setCooldownTime(remainingSeconds);

        // Countdown timer
        const interval = setInterval(() => {
          setCooldownTime((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setRateLimited(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast({
          title: 'Message limit reached',
          description: `You've reached your message limit. Please wait ${remainingSeconds} seconds before sending another message.`,
          variant: 'destructive'
        });
        return; // Don't save message if rate limited
      }

      // Check for other errors
      if (!response.ok) {
        setSending(false);
        logger.error('Edge Function error', new Error(`Status ${response.status}`));
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      // H-1: Message is now saved to DB server-side by the edge function.
      // No client-side DB insert needed (anon INSERT policy was removed in H-4).

      setSending(false);
      setSent(true);
      toast({ title: 'Message sent!', description: formSuccessMessage });
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      setSending(false);
      logger.error('Contact form network error', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // L-3: Validate email format before rendering as mailto: href to prevent email header injection
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const safeEmail = EMAIL_REGEX.test(profile?.email ?? '') ? profile?.email : null;

  // SEC-6: Validate phone number format before rendering as tel: href
  const PHONE_REGEX = /^[+\d][\d\s()-]{5,20}$/;
  const safePhone = PHONE_REGEX.test(profile?.phone ?? '') ? profile?.phone : null;

  const contactInfo = [
    { icon: Mail, label: 'Email', value: safeEmail, href: safeEmail ? `mailto:${safeEmail}` : undefined },
    { icon: Phone, label: 'Phone', value: safePhone, href: safePhone ? `tel:${safePhone}` : undefined },
    { icon: Linkedin, label: 'LinkedIn', value: 'Connect with me', href: profile?.linkedin_url },
    { icon: Github, label: 'GitHub', value: 'View my code', href: profile?.github_url },
  ].filter(item => item.value || item.href);

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-3">Contact</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">Get in Touch</h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Info - Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-4"
            >
              <div
                className="bento-card"
                style={{ background: `linear-gradient(135deg, ${brandColor}10, ${brandColor}04)` }}
              >
                <h2 className="text-sm font-semibold mb-0.5">Contact Information</h2>
                <p className="text-xs text-muted-foreground mb-4">Prefer to reach out directly? Here's how you can contact me.</p>
                <div className="space-y-2">
                  {contactInfo.map((item, index) => (
                    item.href && (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 transition-colors group"
                      >
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${brandColor}20` }}
                        >
                          <item.icon className="h-4 w-4" style={{ color: brandColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-medium truncate">{item.value}</p>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.a>
                    )
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="bento-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: '#10b981' }} />
                  <span className="font-semibold text-sm">{availabilityText}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  I typically respond within 24 hours. Looking forward to hearing from you!
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="bento-card h-full">
                <h2 className="text-sm font-semibold mb-0.5">Send a Message</h2>
                <p className="text-xs text-muted-foreground mb-5">Fill out the form below and I'll get back to you as soon as possible.</p>
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div
                      className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${brandColor}15` }}
                    >
                      <CheckCircle2 className="h-7 w-7" style={{ color: brandColor }} />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">Message Sent!</h3>
                    <p className="text-sm text-muted-foreground">{formSuccessMessage}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleContact} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Name</label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={contactForm.name}
                          onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                          required
                          className="h-10 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Email</label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                          required
                          className="h-10 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Message</label>
                      <Textarea
                        id="message"
                        placeholder="Tell me about your project, question, or just say hello..."
                        rows={6}
                        value={contactForm.message}
                        onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                        required
                        className="rounded-lg resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending || rateLimited}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold disabled:opacity-60 hover:-translate-y-0.5 transition-all duration-200"
                      style={{ backgroundColor: brandColor }}
                    >
                      {sending ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                      ) : rateLimited ? (
                        <><Shield className="h-4 w-4" /> Wait {cooldownTime}s</>
                      ) : (
                        <><Send className="h-4 w-4" /> Send Message</>
                      )}
                    </button>
                    {executeRecaptcha && (
                      <p className="text-xs text-muted-foreground text-center">Protected by reCAPTCHA</p>
                    )}
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
