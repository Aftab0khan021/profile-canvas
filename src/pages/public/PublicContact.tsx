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
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ color: brandColor }}>
              CONTACT
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight gradient-title" style={{ '--gradient-color': brandColor } as React.CSSProperties}>
              Get in Touch
            </h1>
            <p className="text-base max-w-2xl leading-relaxed" style={{ color: '#6b7280' }}>
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Contact Info — Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-2 space-y-4"
            >
              {/* Availability badge */}
              <div className="rounded-xl p-5" style={{ backgroundColor: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="pulse-dot" />
                  <span className="text-xs font-mono font-semibold" style={{ color: '#22c55e' }}>AVAILABLE</span>
                </div>
                <p className="text-xs" style={{ color: '#6b7280' }}>{availabilityText}</p>
              </div>

              {/* Contact links */}
              {contactInfo.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.label !== 'Email' && item.label !== 'Phone' ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      data-cursor="OPEN"
                      className="flex items-center gap-3 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
                      style={{ backgroundColor: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}12`, border: `1px solid ${brandColor}20` }}>
                        <item.icon className="h-4 w-4" style={{ color: brandColor }} />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: '#4b5563' }}>{item.label}</div>
                        <div className="text-sm font-semibold truncate max-w-[180px]" style={{ color: '#e5e7eb' }}>{item.value}</div>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl p-4" style={{ backgroundColor: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}12` }}>
                        <item.icon className="h-4 w-4" style={{ color: brandColor }} />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: '#4b5563' }}>{item.label}</div>
                        <div className="text-sm" style={{ color: '#6b7280' }}>{item.value}</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Form — Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-3"
            >
              <div
                className="rounded-xl p-6 md:p-8 neon-border"
                style={{ backgroundColor: '#0e0e0e', '--neon-color': brandColor } as React.CSSProperties}
              >
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4" style={{ color: '#22c55e' }} />
                    <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#f0ede6' }}>Message Sent!</h3>
                    <p className="text-sm font-mono" style={{ color: '#6b7280' }}>{formSuccessMessage}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleContact} className="space-y-5">
                    {/* Terminal intro */}
                    <div className="font-mono text-[11px] space-y-1 mb-4 pb-4" style={{ borderBottom: `1px solid ${brandColor}15`, color: '#4b5563' }}>
                      <p><span style={{ color: brandColor }}>$</span> establishing_connection...</p>
                      <p><span style={{ color: brandColor }}>$</span> status: <span style={{ color: '#22c55e' }}>READY</span></p>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-semibold uppercase tracking-widest block mb-2" style={{ color: '#6b7280' }}>Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        maxLength={100}
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-300"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#f0ede6',
                          caretColor: brandColor,
                        }}
                        onFocus={e => e.target.style.borderColor = `${brandColor}60`}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-semibold uppercase tracking-widest block mb-2" style={{ color: '#6b7280' }}>Email</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        maxLength={254}
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-300"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#f0ede6',
                          caretColor: brandColor,
                        }}
                        onFocus={e => e.target.style.borderColor = `${brandColor}60`}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-semibold uppercase tracking-widest block mb-2" style={{ color: '#6b7280' }}>Message</label>
                      <textarea
                        required
                        rows={5}
                        value={contactForm.message}
                        onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        maxLength={2000}
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-300 resize-none"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#f0ede6',
                          caretColor: brandColor,
                        }}
                        onFocus={e => e.target.style.borderColor = `${brandColor}60`}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>

                    {rateLimited && (
                      <p className="text-xs font-mono" style={{ color: '#ef4444' }}>
                        Rate limited. Try again in {cooldownTime}s
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={sending || rateLimited}
                      data-cursor="CONNECT"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                      style={{
                        backgroundColor: brandColor,
                        color: '#fff',
                        boxShadow: `0 0 24px -6px ${brandColor}60`,
                      }}
                    >
                      {sending ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="h-4 w-4" /> Send Message</>
                      )}
                    </button>

                    <p className="text-[10px] font-mono text-center flex items-center justify-center gap-1" style={{ color: '#374151' }}>
                      <Shield className="h-3 w-3" /> Protected by reCAPTCHA
                    </p>
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
