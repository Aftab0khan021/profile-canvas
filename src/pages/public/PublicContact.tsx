import { useState } from 'react';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Mail, Phone, Linkedin, Github, MapPin, Send, Loader2 } from 'lucide-react';

export default function PublicContact() {
  const { profile, brandColor } = usePublicLayoutContext();
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

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
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    } else {
      toast({ title: 'Message sent!', description: 'Thanks for reaching out. I\'ll get back to you soon.' });
      setContactForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-lg">
              Have a project in mind or just want to say hello? I'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Feel free to reach out through any of these channels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile?.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandColor}15` }}
                      >
                        <Mail className="h-5 w-5" style={{ color: brandColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Email</p>
                        <p className="text-sm">{profile.email}</p>
                      </div>
                    </a>
                  )}

                  {profile?.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandColor}15` }}
                      >
                        <Phone className="h-5 w-5" style={{ color: brandColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Phone</p>
                        <p className="text-sm">{profile.phone}</p>
                      </div>
                    </a>
                  )}

                  {profile?.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandColor}15` }}
                      >
                        <Linkedin className="h-5 w-5" style={{ color: brandColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">LinkedIn</p>
                        <p className="text-sm">Connect with me</p>
                      </div>
                    </a>
                  )}

                  {profile?.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandColor}15` }}
                      >
                        <Github className="h-5 w-5" style={{ color: brandColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">GitHub</p>
                        <p className="text-sm">Check out my code</p>
                      </div>
                    </a>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Send a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and I'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContact} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Your Name"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm((p) => ({ ...p, name: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Your Email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm((p) => ({ ...p, email: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Your Message"
                        rows={5}
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm((p) => ({ ...p, message: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full text-white"
                      style={{ backgroundColor: brandColor }}
                      disabled={sending}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
