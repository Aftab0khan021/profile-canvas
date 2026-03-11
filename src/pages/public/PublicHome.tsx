import { Link } from 'react-router-dom';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { usePublicProfileItems, usePublicPageContent } from '@/hooks/useProfileItems';
import { useTrackView } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github, Linkedin, Mail, ExternalLink, ArrowRight, FileText,
  Star, Quote, ChevronLeft, ChevronRight, Download, Code, Sparkles
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { getOptimizedImageUrl, IMAGE_PRESETS } from '@/lib/imageOptimization';

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
  }, [profile?.id, username, trackView]);

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
                      <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
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

  // ===== MODERN TEMPLATE (default) ====
  return (
    <>
      {/* Hero Section with Animated Background */}
      <section className="relative pt-24 pb-32 px-4 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse-slow"
            style={{ backgroundColor: `${brandColor}20` }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse-slow"
            style={{ backgroundColor: `${brandColor}15`, animationDelay: '2s' }}
          />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1" /> {availabilityStatus}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                Hi, I'm{' '}
                <span style={{ color: brandColor }}>{profile?.full_name?.split(' ')[0] || 'there'}</span>
              </h1>
              <div className="h-12 mb-6">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentRoleIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl md:text-3xl font-medium text-muted-foreground"
                  >
                    {roles[currentRoleIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                {profile?.bio}
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Button size="lg" style={{ backgroundColor: brandColor }} className="text-white gap-2" asChild>
                  <Link to={`${basePath}/projects`}>
                    View My Work <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {profile?.resume_url && (
                  <Button size="lg" variant="outline" className="gap-2" asChild>
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" /> Resume
                    </a>
                  </Button>
                )}
              </div>
              <div className="flex gap-4">
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {profile?.email && (
                  <a href={`mailto:${profile.email}`}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <Mail className="h-5 w-5" />
                  </a>
                )}
              </div>
            </motion.div>

            {/* Right: Profile Image with Floating Skill Badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative flex justify-center"
            >
              <div className="relative">
                {/* Avatar: photo or initials fallback */}
                <div
                  className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden animate-float-slow flex-shrink-0"
                  style={{
                    boxShadow: `0 0 0 5px ${brandColor}40, 0 25px 50px -12px ${brandColor}60`,
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
                      className="w-full h-full flex items-center justify-center text-white text-6xl font-bold select-none"
                      style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}99)` }}
                    >
                      {profile?.full_name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                {/* Floating skill badges — evenly spaced outside the circle */}
                {topSkillNames[0] && (
                  <Badge
                    className="absolute -top-6 left-1/2 -translate-x-1/2 animate-float text-white shadow-lg max-w-[100px] truncate block"
                    style={{ backgroundColor: brandColor }}
                    title={topSkillNames[0]}
                  >
                    {truncateBadge(topSkillNames[0])}
                  </Badge>
                )}
                {topSkillNames[1] && (
                  <Badge
                    className="absolute top-1/2 -right-14 -translate-y-1/2 animate-float-delayed text-white shadow-lg max-w-[100px] truncate block"
                    style={{ backgroundColor: brandColor }}
                    title={topSkillNames[1]}
                  >
                    {truncateBadge(topSkillNames[1])}
                  </Badge>
                )}
                {topSkillNames[2] && (
                  <Badge
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 animate-float text-white shadow-lg max-w-[100px] truncate block"
                    style={{ backgroundColor: brandColor, animationDelay: '0.5s' }}
                    title={topSkillNames[2]}
                  >
                    {truncateBadge(topSkillNames[2])}
                  </Badge>
                )}
                {topSkillNames[3] && (
                  <Badge
                    className="absolute top-1/2 -left-14 -translate-y-1/2 animate-float-delayed text-white shadow-lg max-w-[100px] truncate block"
                    style={{ backgroundColor: brandColor, animationDelay: '0.8s' }}
                    title={topSkillNames[3]}
                  >
                    {truncateBadge(topSkillNames[3])}
                  </Badge>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      {projects.length > 0 && (
        <section className="py-20 px-4 border-t">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Projects</h2>
                <p className="text-muted-foreground">A selection of my recent work</p>
              </div>
              <Button variant="ghost" asChild>
                <Link to={`${basePath}/projects`} className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 h-full">
                    {project.image_url && (
                      <div className="relative overflow-hidden h-56">
                        <img
                          src={getOptimizedImageUrl(project.image_url, IMAGE_PRESETS.card)}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          {project.live_url && (
                            <Button size="sm" className="text-white" style={{ backgroundColor: brandColor }} asChild>
                              <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                                View Demo
                              </a>
                            </Button>
                          )}
                          {project.github_url && (
                            <Button size="sm" variant="secondary" asChild>
                              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {(project.tech_stack || []).slice(0, 4).map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                        {(project.tech_stack || []).length > 4 && (
                          <Badge variant="outline" className="text-xs">+{(project.tech_stack || []).length - 4}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Preview with Progress Bars */}
      {skills.length > 0 && (
        <section className="py-20 px-4 border-t">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Skills & Expertise</h2>
                <p className="text-muted-foreground">Technologies I work with</p>
              </div>
              <Button variant="ghost" asChild>
                <Link to={`${basePath}/about`} className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {topCategories.map(([category, categorySkills], catIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code className="h-5 w-5" style={{ color: brandColor }} />
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categorySkills.slice(0, 4).map((skill) => (
                        <div key={skill.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{skill.skill_name}</span>
                            <span className="text-muted-foreground">{skill.proficiency_level}%</span>
                          </div>
                          <Progress value={skill.proficiency_level} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {/* Soft Skills Cloud */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">Soft Skills</p>
              <div className="flex flex-wrap justify-center gap-2">
                {skills
                  .filter(s => s.category.toLowerCase().includes('soft'))
                  .slice(0, 8)
                  .map((skill) => (
                    <Badge key={skill.id} variant="outline" className="px-3 py-1">
                      {skill.skill_name}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Carousel */}
      {testimonials.length > 0 && (
        <section className="py-20 px-4 border-t" style={{ backgroundColor: `${brandColor}05` }}>
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>
            <div className="relative">
              <Card className="p-8 md:p-12">
                <CardContent className="text-center p-0">
                  <Quote className="h-12 w-12 mx-auto mb-6 opacity-20" style={{ color: brandColor }} />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTestimonial}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-xl md:text-2xl italic mb-6 text-foreground/90">
                        "{testimonials[currentTestimonial]?.text}"
                      </p>
                      <div className="flex items-center justify-center gap-1 mb-4">
                        {[...Array(testimonials[currentTestimonial]?.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="font-semibold text-lg">{testimonials[currentTestimonial]?.client_name}</p>
                      {testimonials[currentTestimonial]?.company && (
                        <p className="text-muted-foreground">{testimonials[currentTestimonial]?.company}</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentTestimonial(i)}
                        className="w-2 h-2 rounded-full transition-colors"
                        style={{ backgroundColor: i === currentTestimonial ? brandColor : 'hsl(var(--muted))' }}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Blog Preview - Featured Layout */}
      {blogs.length > 0 && (
        <section className="py-20 px-4 border-t">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Latest Insights</h2>
                <p className="text-muted-foreground">Thoughts and tutorials</p>
              </div>
              <Button variant="ghost" asChild>
                <Link to={`${basePath}/blog`} className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Featured Article */}
              {featuredBlog && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Link to={`/p/${username}/blog/${featuredBlog.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all cursor-pointer group overflow-hidden">
                      <div
                        className="h-48 flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${brandColor}20, ${brandColor}05)` }}
                      >
                        <FileText className="h-16 w-16 opacity-30" style={{ color: brandColor }} />
                      </div>
                      <CardContent className="pt-6">
                        <Badge variant="secondary" className="mb-3">Featured</Badge>
                        <h3 className="font-bold text-2xl mb-3 group-hover:underline">{featuredBlog.title}</h3>
                        <p className="text-muted-foreground line-clamp-3 mb-4">{featuredBlog.content}</p>
                        <div className="flex items-center justify-between">
                          <time className="text-sm text-muted-foreground">
                            {format(new Date(featuredBlog.published_at || featuredBlog.created_at), 'MMMM d, yyyy')}
                          </time>
                          <span className="text-sm font-medium flex items-center gap-1" style={{ color: brandColor }}>
                            Read Article <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )}

              {/* Recent Articles List */}
              <div className="space-y-4">
                {recentBlogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={`/p/${username}/blog/${blog.slug}`}>
                      <Card className="hover:shadow-lg transition-all cursor-pointer group">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div
                              className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${brandColor}15` }}
                            >
                              <FileText className="h-6 w-6" style={{ color: brandColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 group-hover:underline truncate">
                                {blog.title}
                              </h3>
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                                {blog.content}
                              </p>
                              <time className="text-xs text-muted-foreground">
                                {format(new Date(blog.published_at || blog.created_at), 'MMMM d, yyyy')}
                              </time>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
                {recentBlogs.length === 0 && featuredBlog && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>More articles coming soon...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA Section */}
      <section className="py-20 px-4 border-t">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card
              className="p-8 md:p-12 text-center overflow-hidden relative"
              style={{ background: `linear-gradient(135deg, ${brandColor}15, ${brandColor}05)` }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ background: `radial-gradient(circle at 30% 50%, ${brandColor}, transparent 50%)` }}
              />
              <CardContent className="relative z-10 p-0">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{ctaTitle}</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                  {ctaDescription}
                </p>
                <Button size="lg" style={{ backgroundColor: brandColor }} className="text-white gap-2" asChild>
                  <Link to={`${basePath}/contact`}>
                    <Mail className="h-4 w-4" /> Start a Project
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </>
  );
}
