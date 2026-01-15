import { useState } from 'react';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPageContent } from '@/hooks/useProfileItems';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Mail, Phone, Linkedin, Github, MapPin, Send, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PublicContact() {
  const { profile, brandColor } = usePublicLayoutContext();
  const { getContent } = usePublicPageContent(profile?.id);
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Get dynamic content
  const heroSubtitle = getContent('contact', 'hero_subtitle', "Have a project in mind, a question, or just want to say hello? I'd love to hear from you.");
  const formSuccessMessage = getContent('contact', 'form_success', "Thanks for reaching out. I'll get back to you soon.");
  const availabilityText = getContent('contact', 'availability_text', 'Available for new projects');

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      user_id: profile.id,
      sender_name: contactForm.name,
      sender_email: contactForm.email,
      content: contactForm.message,
    });
    setSending(false);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to send message. Please try again.', variant: 'destructive' });
    } else {
      setSent(true);
      toast({ title: 'Message sent!', description: formSuccessMessage });
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    }
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: profile?.email, href: `mailto:${profile?.email}` },
    { icon: Phone, label: 'Phone', value: profile?.phone, href: `tel:${profile?.phone}` },
    { icon: Linkedin, label: 'LinkedIn', value: 'Connect with me', href: profile?.linkedin_url },
    { icon: Github, label: 'GitHub', value: 'View my code', href: profile?.github_url },
  ].filter(item => item.value || item.href);

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
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
              className="lg:col-span-2 space-y-6"
            >
              <Card 
                className="overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${brandColor}10, ${brandColor}05)` }}
              >
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Prefer to reach out directly? Here's how you can contact me.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-background/50 transition-colors group"
                      >
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${brandColor}20` }}
                        >
                          <item.icon className="h-5 w-5" style={{ color: brandColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground truncate">{item.value}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.a>
                    )
                  ))}
                </CardContent>
              </Card>

              {/* Quick Response Time */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="h-3 w-3 rounded-full animate-pulse"
                      style={{ backgroundColor: '#10b981' }}
                    />
                    <span className="font-medium">{availabilityText}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    I typically respond within 24 hours. Looking forward to hearing from you!
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Send a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and I'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sent ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div 
                        className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: `${brandColor}15` }}
                      >
                        <CheckCircle2 className="h-8 w-8" style={{ color: brandColor }} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">
                        {formSuccessMessage}
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleContact} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={contactForm.name}
                            onChange={(e) =>
                              setContactForm((p) => ({ ...p, name: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={contactForm.email}
                            onChange={(e) =>
                              setContactForm((p) => ({ ...p, email: e.target.value }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell me about your project, question, or just say hello..."
                          rows={6}
                          value={contactForm.message}
                          onChange={(e) =>
                            setContactForm((p) => ({ ...p, message: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full text-white"
                        style={{ backgroundColor: brandColor }}
                        disabled={sending}
                      >
                        {sending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
