import { useParams, Link } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/useProfile';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, ExternalLink, Download, MapPin, Calendar, Star, Loader2, Send, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function PublicPortfolio() {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading } = usePublicProfile(username || '');
  const { projects, experience, skills, testimonials } = usePublicPortfolioData(profile?.id);
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  // Fetch published blogs
  const { data: blogs = [] } = useQuery({
    queryKey: ['publicBlogs', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

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
      toast({ title: 'Message sent!', description: 'Thanks for reaching out.' });
      setContactForm({ name: '', email: '', message: '' });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Portfolio not found.</p></div>;

  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const brandColor = profile.brand_color || '#3b82f6';
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic brand color styles */}
      <style>{`
        .brand-primary { color: ${brandColor}; }
        .brand-bg { background-color: ${brandColor}; }
        .brand-border { border-color: ${brandColor}; }
        .brand-hover:hover { color: ${brandColor}; }
        .brand-btn { background-color: ${brandColor}; color: white; }
        .brand-btn:hover { opacity: 0.9; }
        .brand-fill { fill: ${brandColor}; color: ${brandColor}; }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="h-8 w-8 rounded-lg brand-bg flex items-center justify-center text-white font-bold text-sm">{initials}</div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#about" className="brand-hover transition-colors">About</a>
            <a href="#projects" className="brand-hover transition-colors">Projects</a>
            <a href="#experience" className="brand-hover transition-colors">Experience</a>
            {blogs.length > 0 && <a href="#blog" className="brand-hover transition-colors">Blog</a>}
            <a href="#contact" className="brand-hover transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile.resume_url && <Button size="sm" className="brand-btn" asChild><a href={profile.resume_url} target="_blank"><Download className="h-4 w-4 mr-1" />Resume</a></Button>}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="about" className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {profile.avatar_url && <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4 border-background shadow-lg" />}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Hi, I'm {profile.full_name || 'there'}</h1>
            <p className="text-xl brand-primary mb-6">{profile.title || 'Creative Professional'}</p>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">{profile.bio}</p>
            <div className="flex justify-center gap-3">
              <Button className="brand-btn" asChild><a href="#projects">View Projects</a></Button>
              <Button variant="outline" asChild><a href="#contact">Contact Me</a></Button>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              {profile.github_url && <a href={profile.github_url} target="_blank" className="text-muted-foreground brand-hover"><Github className="h-5 w-5" /></a>}
              {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" className="text-muted-foreground brand-hover"><Linkedin className="h-5 w-5" /></a>}
              {profile.email && <a href={`mailto:${profile.email}`} className="text-muted-foreground brand-hover"><Mail className="h-5 w-5" /></a>}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects */}
      {projects.length > 0 && (
        <section id="projects" className="py-20 px-4 border-t">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Projects</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {project.image_url && <img src={project.image_url} alt={project.title} className="w-full h-48 object-cover" />}
                  <CardHeader><CardTitle>{project.title}</CardTitle><CardDescription className="line-clamp-2">{project.description}</CardDescription></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">{project.tech_stack.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
                    <div className="flex gap-2">
                      {project.live_url && <Button size="sm" className="brand-btn" asChild><a href={project.live_url} target="_blank"><ExternalLink className="h-3 w-3 mr-1" />Live</a></Button>}
                      {project.github_url && <Button size="sm" variant="outline" asChild><a href={project.github_url} target="_blank"><Github className="h-3 w-3 mr-1" />Code</a></Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section id="experience" className="py-20 px-4 border-t">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Experience</h2>
            <div className="space-y-6">
              {experience.map((exp) => (
                <Card key={exp.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <div><h3 className="font-semibold text-lg">{exp.role}</h3><p className="brand-primary">{exp.company}</p></div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}</div>
                        {exp.location && <div className="flex items-center gap-1 justify-end"><MapPin className="h-3 w-3" />{exp.location}</div>}
                      </div>
                    </div>
                    {exp.description && <p className="text-muted-foreground text-sm mt-2">{exp.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section className="py-20 px-4 border-t">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Skills</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <Card key={category}><CardHeader><CardTitle className="text-lg">{category}</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{categorySkills.map((s) => <Badge key={s.id} className="brand-bg text-white">{s.skill_name}</Badge>)}</CardContent></Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog */}
      {blogs.length > 0 && (
        <section id="blog" className="py-20 px-4 border-t">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Latest Articles</h2>
            <div className="space-y-4">
              {blogs.map((blog) => (
                <Link key={blog.id} to={`/p/${username}/blog/${blog.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <FileText className="h-6 w-6 brand-primary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{blog.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{blog.content}</p>
                          <time className="text-xs text-muted-foreground">{format(new Date(blog.published_at || blog.created_at), 'MMMM d, yyyy')}</time>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 px-4 border-t">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Testimonials</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <Card key={t.id}><CardContent className="pt-6">
                  <div className="flex gap-1 mb-3">{[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 brand-fill" />)}</div>
                  <p className="text-muted-foreground italic mb-4">"{t.text}"</p>
                  <p className="font-semibold">{t.client_name}</p>
                  {t.company && <p className="text-sm text-muted-foreground">{t.company}</p>}
                </CardContent></Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="py-20 px-4 border-t">
        <div className="container mx-auto max-w-lg">
          <h2 className="text-3xl font-bold text-center mb-4">Get in Touch</h2>
          <p className="text-center text-muted-foreground mb-8">Have a question or want to work together?</p>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleContact} className="space-y-4">
                <Input placeholder="Your Name" value={contactForm.name} onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} required />
                <Input type="email" placeholder="Your Email" value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} required />
                <Textarea placeholder="Your Message" rows={4} value={contactForm.message} onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))} required />
                <Button type="submit" className="w-full brand-btn" disabled={sending}>{sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profile.full_name}. Built with FolioX.
        </div>
      </footer>
    </div>
  );
}
