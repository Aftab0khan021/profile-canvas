import { Link } from 'react-router-dom';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { usePublicProfileItems, usePublicPageContent } from '@/hooks/useProfileItems';
import { useTrackView } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { HeroSkeleton } from '@/components/PublicPageSkeleton';
import { stripMarkdown } from '@/components/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Github, Linkedin, Mail, ExternalLink, ArrowRight, FileText,
  Star, Quote, ChevronLeft, ChevronRight, Download, Code, Sparkles,
  Terminal, MousePointer2, ChevronDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { getOptimizedImageUrl, IMAGE_PRESETS } from '@/lib/imageOptimization';
import { maskStorageUrl } from '@/lib/storageUrl';
import { ConstellationGraph } from '@/components/ConstellationGraph';
import { SectionMarker } from '@/components/ScrollProgress';
import { useTextScramble } from '@/hooks/useTextScramble';
import { useMagnetic } from '@/hooks/useMagnetic';
import { use3DTilt } from '@/hooks/use3DTilt';

export default function PublicHome() {
  const { profile, brandColor, username, template } = usePublicLayoutContext();
  const { projects, skills, testimonials, isLoading } = usePublicPortfolioData(profile?.id);
  const { getContent } = usePublicPageContent(profile?.id);
  const trackView = useTrackView();
  const hasTracked = useRef(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  // Get roles from profile for typewriter effect
  const profileAny = profile as any;
  const roles = profileAny?.roles?.length > 0
    ? profileAny.roles
    : [profile?.title || 'Software Engineer'];
  const availabilityStatus = profileAny?.availability_status || 'Available for Opportunities';

  // Get dynamic content
  const ctaTitle = getContent('home', 'cta_title', "Let's Build Something Amazing");
  const ctaDescription = getContent('home', 'cta_description', 'Have a project in mind? Let\'s discuss how we can work together to bring your ideas to life.');

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

  // Track page view
  useEffect(() => {
    if (profile?.id && !hasTracked.current) {
      hasTracked.current = true;
      trackView.mutate({
        userId: profile.id,
        pagePath: `/p/${username}`,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, username]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Animated roles rotation
  useEffect(() => {
    if (roles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  // Group skills by category (show top 3 categories)
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);
  const topCategories = Object.entries(skillsByCategory).slice(0, 3);

  // Top skills for floating badges
  const topSkillNames = skills.slice(0, 6).map(s => s.skill_name);

  const basePath = `/p/${username}`;
  const featuredProjects = projects.slice(0, 2);
  const featuredBlog = blogs[0];

  // Truncate skill names for floating badges — keep them short & clean
  const truncateBadge = (name: string, max = 12) =>
    name.length > max ? name.slice(0, max).trimEnd() + '…' : name;
  const recentBlogs = blogs.slice(1, 3);

  if (isLoading && !profile) return <HeroSkeleton />;

  // ===== MINIMAL TEMPLATE HERO =====
  if (template === 'minimal') {
    return (
      <>
        {/* MINIMAL: Centered, clean, no noise */}
        <section className="py-32 px-4 text-center">
          <div className="container mx-auto max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              {profile?.avatar_url ? (
                <img
                  src={getOptimizedImageUrl(profile.avatar_url, IMAGE_PRESETS.avatar)}
                  alt={profile.full_name || ''}
                  className="w-28 h-28 rounded-full object-cover mx-auto mb-8"
                  style={{ boxShadow: `0 0 0 4px ${brandColor}50` }}
                />
              ) : (
                <div
                  className="w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center text-white text-4xl font-bold"
                  style={{ background: brandColor }}
                >
                  {profile?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                </div>
              )}
              <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                {profile?.full_name}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-6" style={{ color: brandColor }}>
                {profile?.title}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
                {profile?.bio}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button size="lg" style={{ backgroundColor: brandColor }} className="text-white" asChild>
                  <Link to={`${basePath}/projects`}>View My Work</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to={`${basePath}/contact`}>Contact Me</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* MINIMAL: Simple skill tags */}
        {skills.length > 0 && (
          <section className="py-16 px-4 border-t">
            <div className="container mx-auto max-w-2xl text-center">
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">Skills</h2>
              <div className="flex flex-wrap gap-2 justify-center">
                {skills.slice(0, 18).map((s) => (
                  <Badge key={s.id} variant="outline" className="px-3 py-1 text-sm">
                    {s.skill_name}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* MINIMAL: Featured projects grid */}
        {featuredProjects.length > 0 && (
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-3xl">
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-8 text-center">Selected Work</h2>
              <div className="grid gap-6">
                {featuredProjects.map((project) => (
                  <Link key={project.id} to={`${basePath}/projects`}>
                    <Card className="hover:border-foreground/30 transition-colors">
                      <CardHeader>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                      </CardHeader>
                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {project.tech_stack.slice(0, 5).map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button variant="outline" asChild>
                  <Link to={`${basePath}/projects`}>All Projects</Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </>
    );
  }

  // ===== PROFESSIONAL TEMPLATE HERO =====
  if (template === 'professional') {
    return (
      <>
        {/* PROFESSIONAL: Image left, text right — compact corporate feel */}
        <section className="py-16 px-4 border-b">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              {/* Left: Avatar */}
              <div className="flex-shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={getOptimizedImageUrl(profile.avatar_url, IMAGE_PRESETS.avatar)}
                    alt={profile.full_name || ''}
                    className="w-48 h-48 rounded-2xl object-cover"
                    style={{ boxShadow: `4px 4px 0 ${brandColor}` }}
                  />
                ) : (
                  <div
                    className="w-48 h-48 rounded-2xl flex items-center justify-center text-white text-5xl font-bold"
                    style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)` }}
                  >
                    {profile?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                  </div>
                )}
              </div>
              {/* Right: Content */}
              <div className="flex-1">
                <div className="inline-block px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                  {availabilityStatus}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight">{profile?.full_name}</h1>
                <p className="text-lg mb-4" style={{ color: brandColor }}>{profile?.title}</p>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-lg">{profile?.bio}</p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button style={{ backgroundColor: brandColor }} className="text-white" asChild>
                    <Link to={`${basePath}/projects`}>View Projects</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`${basePath}/contact`}>Get in Touch</Link>
                  </Button>
                  {profile?.resume_url && (
                    <Button variant="ghost" asChild>
                      <a href={maskStorageUrl(profile.resume_url)} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />Resume
                      </a>
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  {profile?.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"><Github className="h-5 w-5" /></a>
                  )}
                  {profile?.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="h-5 w-5" /></a>
                  )}
                  {profile?.email && (
                    <a href={`mailto:${profile.email}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"><Mail className="h-5 w-5" /></a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROFESSIONAL: Competencies bar */}
        {topCategories.length > 0 && (
          <section className="py-10 px-4 border-b bg-muted/20">
            <div className="container mx-auto max-w-5xl">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {topCategories.map(([category, catSkills]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{category}</span>
                      <span className="text-xs text-muted-foreground">{catSkills.length} skills</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {catSkills.slice(0, 3).map((s) => (
                        <Badge key={s.id} variant="outline" className="text-xs">{s.skill_name}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PROFESSIONAL: Projects table-like list */}
        {featuredProjects.length > 0 && (
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-5xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Selected Projects</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`${basePath}/projects`}>View All <ArrowRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </div>
              <div className="space-y-3">
                {projects.slice(0, 4).map((project) => (
                  <Link key={project.id} to={`${basePath}/projects`}>
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/40 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold group-hover:text-foreground">{project.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {project.tech_stack?.slice(0, 3).map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </>
    );
  }

  // ===== MODERN TEMPLATE (default) — IMMERSIVE 3D ====

  // Hooks for immersive effects
  const { scramble } = useTextScramble();
  const { magneticRef: ctaRef, springX: ctaX, springY: ctaY } = useMagnetic(14);
  const { tiltRef: avatarTiltRef, rotateX: avatarRX, rotateY: avatarRY } = use3DTilt(10);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [nameRevealed, setNameRevealed] = useState(false);

  // Scramble name on mount
  useEffect(() => {
    if (nameRevealed || !nameRef.current || !profile?.full_name) return;
    const cancel = scramble(nameRef.current, profile.full_name, 900);
    setNameRevealed(true);
    return cancel;
  }, [profile?.full_name, nameRevealed, scramble]);

  // Section marker config
  const sections = [
    { id: 'hero-section', label: 'HOME' },
    { id: 'projects-section', label: 'WORK' },
    { id: 'skills-section', label: 'SKILLS' },
    { id: 'testimonials-section', label: 'PROOF' },
    { id: 'blog-section', label: 'BLOG' },
    { id: 'cta-section', label: 'CONNECT' },
  ];

  return (
    <>
      {/* Section Marker — right side nav */}
      <SectionMarker sections={sections} brandColor={brandColor} />

      {/* ════ HERO ════ */}
      <section id="hero-section" className="relative min-h-[90vh] flex items-center px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Availability badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mb-6"
              >
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold"
                  style={{ backgroundColor: `${brandColor}12`, color: brandColor, border: `1px solid ${brandColor}25`, letterSpacing: '0.08em' }}
                >
                  <span className="pulse-dot" style={{ width: 6, height: 6, background: '#22c55e' }} />
                  {availabilityStatus.toUpperCase()}
                </span>
              </motion.div>

              {/* Name — scramble decode */}
              <h1
                ref={nameRef}
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-2 tracking-tight decode-text text-3d"
                style={{ color: '#f0ede6', letterSpacing: '-0.04em' }}
              >
                {profile?.full_name || 'Developer'}
              </h1>

              {/* Role — animated rotate */}
              <div className="h-12 mb-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentRoleIndex}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.45 }}
                    className="text-xl md:text-2xl font-mono"
                    style={{ color: brandColor, letterSpacing: '0.02em' }}
                  >
                    {'> '}{roles[currentRoleIndex]}
                    <span className="inline-block w-[2px] h-5 ml-1 align-middle" style={{ backgroundColor: brandColor, animation: 'blink 1s step-end infinite' }} />
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Bio */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-base mb-8 max-w-lg leading-relaxed"
                style={{ color: '#9ca3af' }}
              >
                {profile?.bio}
              </motion.p>

              {/* CTA buttons — magnetic */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="flex flex-wrap gap-4 mb-8"
              >
                <motion.div ref={ctaRef} style={{ x: ctaX, y: ctaY }} className="magnetic-target">
                  <Link
                    to={`${basePath}/projects`}
                    data-cursor="VIEW"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.03]"
                    style={{ backgroundColor: brandColor, color: '#fff', boxShadow: `0 0 24px -6px ${brandColor}60` }}
                  >
                    View My Work <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
                {profile?.resume_url && (
                  <a
                    href={maskStorageUrl(profile.resume_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm neon-border transition-all duration-300 hover:scale-[1.03]"
                    style={{ color: '#f0ede6', '--neon-color': brandColor } as React.CSSProperties}
                  >
                    <Download className="h-4 w-4" /> Resume
                  </a>
                )}
              </motion.div>

              {/* Social links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex gap-3"
              >
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                    data-cursor="OPEN"
                    className="p-2.5 rounded-lg transition-all duration-300 hover:scale-110"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Github className="h-4 w-4" style={{ color: '#9ca3af' }} />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                    data-cursor="OPEN"
                    className="p-2.5 rounded-lg transition-all duration-300 hover:scale-110"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Linkedin className="h-4 w-4" style={{ color: '#9ca3af' }} />
                  </a>
                )}
                {profile?.email && (
                  <a href={`mailto:${profile.email}`}
                    data-cursor="CONNECT"
                    className="p-2.5 rounded-lg transition-all duration-300 hover:scale-110"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Mail className="h-4 w-4" style={{ color: '#9ca3af' }} />
                  </a>
                )}
              </motion.div>
            </motion.div>

            {/* Right: 3D Tilt Avatar with orbital badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative flex justify-center"
            >
              <motion.div
                ref={avatarTiltRef}
                style={{
                  rotateX: avatarRX,
                  rotateY: avatarRY,
                  transformStyle: 'preserve-3d',
                  perspective: 1000,
                }}
                className="relative"
              >
                {/* Avatar */}
                <div
                  className="w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden"
                  style={{
                    boxShadow: `0 0 0 1px ${brandColor}30, 0 0 60px -12px ${brandColor}50, 0 25px 50px -12px rgba(0,0,0,0.6)`,
                  }}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={getOptimizedImageUrl(profile.avatar_url, IMAGE_PRESETS.hero)}
                      alt={profile.full_name || ''}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-6xl font-bold select-none"
                      style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}99)`, color: '#fff' }}
                    >
                      {profile?.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                {/* Orbital skill badges */}
                {topSkillNames.slice(0, 4).map((name, i) => {
                  const angles = [
                    { top: '-16px', left: '50%', transform: 'translateX(-50%)' },
                    { top: '50%', right: '-60px', transform: 'translateY(-50%)' },
                    { bottom: '-16px', left: '50%', transform: 'translateX(-50%)' },
                    { top: '50%', left: '-60px', transform: 'translateY(-50%)' },
                  ];
                  return (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + i * 0.15, type: 'spring', stiffness: 300 }}
                      className="absolute px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold shadow-lg max-w-[90px] truncate"
                      style={{
                        ...angles[i],
                        backgroundColor: '#0e0e0e',
                        border: `1px solid ${brandColor}40`,
                        color: brandColor,
                        boxShadow: `0 0 12px -4px ${brandColor}40`,
                        zIndex: 10,
                      } as React.CSSProperties}
                    >
                      {truncateBadge(name, 10)}
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-indicator"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#4b5563' }}>Scroll</span>
            <ChevronDown className="h-4 w-4" style={{ color: '#4b5563' }} />
          </motion.div>
        </div>
      </section>

      {/* ════ FEATURED PROJECTS — Coverflow-inspired ════ */}
      {projects.length > 0 && (
        <section id="projects-section" className="py-24 px-4" style={{ borderTop: `1px solid ${brandColor}10` }}>
          <div className="container mx-auto max-w-6xl">
            {/* Section header */}
            <div className="flex items-end justify-between mb-14">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ color: brandColor }}>
                  01 — SELECTED WORK
                </span>
                <h2 className="font-display text-4xl font-bold tracking-tight gradient-title" style={{ '--gradient-color': brandColor } as React.CSSProperties}>
                  Featured Projects
                </h2>
              </div>
              <Link
                to={`${basePath}/projects`}
                data-cursor="VIEW"
                className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest transition-colors hover:opacity-80"
                style={{ color: brandColor }}
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Project cards with 3D depth */}
            <div className="grid md:grid-cols-2 gap-6">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 40, rotateY: index % 2 === 0 ? 6 : -6 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: index * 0.12 }}
                >
                  <div
                    className="group rounded-xl overflow-hidden transition-all duration-500 h-full flex flex-col scan-line relative"
                    style={{
                      backgroundColor: '#0e0e0e',
                      border: '1px solid rgba(255,255,255,0.06)',
                      '--scan-color': `${brandColor}15`,
                    } as React.CSSProperties}
                    data-cursor="VIEW"
                  >
                    {project.image_url && (
                      <div className="relative overflow-hidden h-52">
                        <img
                          src={getOptimizedImageUrl(project.image_url, IMAGE_PRESETS.card)}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 flex gap-2">
                          {project.live_url && (
                            <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold transition-colors"
                              style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', color: '#f0ede6' }}
                              onClick={e => e.stopPropagation()}>
                              <ExternalLink className="h-3 w-3" /> LIVE
                            </a>
                          )}
                          {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold transition-colors"
                              style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', color: '#f0ede6' }}
                              onClick={e => e.stopPropagation()}>
                              <Github className="h-3 w-3" /> CODE
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#f0ede6' }}>{project.title}</h3>
                      <p className="text-sm line-clamp-2 mb-4 flex-1" style={{ color: '#6b7280' }}>{project.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(project.tech_stack || []).slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded text-[10px] font-mono transition-all duration-300"
                            style={{ backgroundColor: `${brandColor}10`, color: `${brandColor}cc`, border: `1px solid ${brandColor}20` }}
                          >
                            {t}
                          </span>
                        ))}
                        {(project.tech_stack || []).length > 4 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ color: '#4b5563' }}>
                            +{(project.tech_stack || []).length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════ SKILLS — Constellation Network ════ */}
      {skills.length > 0 && (
        <section id="skills-section" className="py-24 px-4" style={{ borderTop: `1px solid ${brandColor}10` }}>
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-end justify-between mb-14">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ color: brandColor }}>
                  02 — EXPERTISE
                </span>
                <h2 className="font-display text-4xl font-bold tracking-tight gradient-title" style={{ '--gradient-color': brandColor } as React.CSSProperties}>
                  Skill Network
                </h2>
              </div>
              <Link
                to={`${basePath}/skills`}
                data-cursor="VIEW"
                className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest transition-colors hover:opacity-80"
                style={{ color: brandColor }}
              >
                Explore All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Constellation graph */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-xl p-6"
              style={{ backgroundColor: 'rgba(14,14,14,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <ConstellationGraph skills={skills} brandColor={brandColor} />
            </motion.div>

            {/* Category legend */}
            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              {topCategories.map(([category, catSkills]) => (
                <span
                  key={category}
                  className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold"
                  style={{ backgroundColor: `${brandColor}10`, color: `${brandColor}cc`, border: `1px solid ${brandColor}20` }}
                >
                  {category} · {catSkills.length}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════ TESTIMONIALS — Stacked Cards ════ */}
      {testimonials.length > 0 && (
        <section id="testimonials-section" className="py-24 px-4" style={{ borderTop: `1px solid ${brandColor}10` }}>
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-14">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ color: brandColor }}>
                03 — SOCIAL PROOF
              </span>
              <h2 className="font-display text-4xl font-bold tracking-tight gradient-title" style={{ '--gradient-color': brandColor } as React.CSSProperties}>
                What People Say
              </h2>
            </div>

            {/* Card stack */}
            <div className="relative" style={{ minHeight: 280 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 30, rotateZ: -2 }}
                  animate={{ opacity: 1, y: 0, rotateZ: 0 }}
                  exit={{ opacity: 0, x: -200, rotateZ: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="rounded-xl p-8 md:p-12 text-center"
                  style={{
                    backgroundColor: '#0e0e0e',
                    border: `1px solid ${brandColor}15`,
                    boxShadow: `0 0 40px -12px ${brandColor}15`,
                  }}
                >
                  <Quote className="h-8 w-8 mx-auto mb-6 opacity-20" style={{ color: brandColor }} />
                  <p className="text-lg md:text-xl italic mb-6 leading-relaxed" style={{ color: '#e5e7eb' }}>
                    &ldquo;{testimonials[currentTestimonial]?.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(testimonials[currentTestimonial]?.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: '#f0ede6' }}>
                    {testimonials[currentTestimonial]?.client_name}
                  </p>
                  {testimonials[currentTestimonial]?.company && (
                    <p className="text-xs mt-1 font-mono" style={{ color: '#6b7280' }}>
                      {testimonials[currentTestimonial]?.company}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Stacked card shadows behind */}
              {testimonials.length > 1 && (
                <>
                  <div className="absolute inset-x-4 -bottom-2 h-full rounded-xl -z-10"
                    style={{ backgroundColor: '#0a0a0a', border: `1px solid ${brandColor}08`, transform: 'scale(0.97)' }} />
                  {testimonials.length > 2 && (
                    <div className="absolute inset-x-8 -bottom-4 h-full rounded-xl -z-20"
                      style={{ backgroundColor: '#080808', border: `1px solid ${brandColor}05`, transform: 'scale(0.94)' }} />
                  )}
                </>
              )}
            </div>

            {/* Navigation dots */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-3 mt-8">
                <button onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                  style={{ border: `1px solid ${brandColor}30`, color: '#6b7280' }}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  {testimonials.map((_, i) => (
                    <button key={i} onClick={() => setCurrentTestimonial(i)}
                      className="w-2 h-2 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: i === currentTestimonial ? brandColor : '#374151',
                        transform: i === currentTestimonial ? 'scale(1.5)' : 'scale(1)',
                        boxShadow: i === currentTestimonial ? `0 0 8px ${brandColor}` : 'none',
                      }}
                    />
                  ))}
                </div>
                <button onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                  className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                  style={{ border: `1px solid ${brandColor}30`, color: '#6b7280' }}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════ BLOG — Marquee Strip ════ */}
      {blogs.length > 0 && (
        <section id="blog-section" className="py-24 px-4" style={{ borderTop: `1px solid ${brandColor}10` }}>
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-end justify-between mb-14">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ color: brandColor }}>
                  04 — INSIGHTS
                </span>
                <h2 className="font-display text-4xl font-bold tracking-tight gradient-title" style={{ '--gradient-color': brandColor } as React.CSSProperties}>
                  Latest Writing
                </h2>
              </div>
              <Link
                to={`${basePath}/blog`}
                data-cursor="READ"
                className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest transition-colors hover:opacity-80"
                style={{ color: brandColor }}
              >
                All Posts <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link to={`/p/${username}/blog/${blog.slug}`} data-cursor="READ">
                    <div
                      className="group flex items-center gap-6 p-5 rounded-xl transition-all duration-500 hover:scale-[1.01]"
                      style={{
                        backgroundColor: 'rgba(14,14,14,0.6)',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110"
                        style={{ backgroundColor: `${brandColor}12`, border: `1px solid ${brandColor}20` }}
                      >
                        <FileText className="h-5 w-5" style={{ color: brandColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-sm mb-0.5 truncate" style={{ color: '#f0ede6' }}>{blog.title}</h3>
                        <p className="text-xs line-clamp-1" style={{ color: '#6b7280' }}>{blog.content}</p>
                      </div>
                      <time className="text-[10px] font-mono flex-shrink-0 hidden sm:block" style={{ color: '#4b5563' }}>
                        {format(new Date(blog.published_at || blog.created_at), 'MMM d, yyyy')}
                      </time>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" style={{ color: '#4b5563' }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════ CTA — Terminal Prompt ════ */}
      <section id="cta-section" className="py-24 px-4" style={{ borderTop: `1px solid ${brandColor}10` }}>
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="rounded-xl overflow-hidden neon-border"
              style={{ '--neon-color': brandColor, backgroundColor: '#0a0a0a' } as React.CSSProperties}
            >
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: `1px solid ${brandColor}15` }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] font-mono ml-2" style={{ color: '#4b5563' }}>connection.sh</span>
              </div>

              {/* Terminal body */}
              <div className="p-8 md:p-12">
                <div className="font-mono text-sm space-y-2 mb-8">
                  <p style={{ color: '#4b5563' }}>
                    <span style={{ color: brandColor }}>$</span> initiating_connection...
                  </p>
                  <p style={{ color: '#4b5563' }}>
                    <span style={{ color: brandColor }}>$</span> target: <span style={{ color: '#f0ede6' }}>{profile?.email || 'available'}</span>
                  </p>
                  <p style={{ color: '#4b5563' }}>
                    <span style={{ color: brandColor }}>$</span> status: <span style={{ color: '#22c55e' }}>AVAILABLE_FOR_HIRE</span>
                  </p>
                </div>

                <div className="text-center">
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 tracking-tight" style={{ color: '#f0ede6' }}>
                    {ctaTitle}
                  </h2>
                  <p className="text-sm mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: '#6b7280' }}>
                    {ctaDescription}
                  </p>
                  <Link
                    to={`${basePath}/contact`}
                    data-cursor="CONNECT"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.04]"
                    style={{
                      backgroundColor: brandColor,
                      color: '#fff',
                      boxShadow: `0 0 32px -8px ${brandColor}60`,
                    }}
                  >
                    <Terminal className="h-4 w-4" /> Start a Project
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
