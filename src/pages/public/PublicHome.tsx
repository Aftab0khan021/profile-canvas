import { Link } from 'react-router-dom';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { useTrackView } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, ExternalLink, ArrowRight, FileText, Code } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { format } from 'date-fns';

export default function PublicHome() {
  const { profile, brandColor, username } = usePublicLayoutContext();
  const { projects, skills } = usePublicPortfolioData(profile?.id);
  const trackView = useTrackView();
  const hasTracked = useRef(false);

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

  // Group skills by category (show top 3 categories)
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);
  const topCategories = Object.entries(skillsByCategory).slice(0, 3);

  const basePath = `/p/${username}`;

  return (
    <>
      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || ''}
                className="w-28 h-28 rounded-full mx-auto mb-6 object-cover border-4 border-background shadow-xl"
              />
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Hi, I'm {profile?.full_name || 'there'}
            </h1>
            <p className="text-xl md:text-2xl mb-6" style={{ color: brandColor }}>
              {profile?.title || 'Creative Professional'}
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg">
              {profile?.bio}
            </p>
            <div className="flex justify-center gap-3 mb-8">
              <Button size="lg" style={{ backgroundColor: brandColor }} className="text-white" asChild>
                <Link to={`${basePath}/projects`}>View My Work</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={`${basePath}/contact`}>Get in Touch</Link>
              </Button>
            </div>
            <div className="flex justify-center gap-4">
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:opacity-80 transition-opacity">
                  <Github className="h-6 w-6" />
                </a>
              )}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:opacity-80 transition-opacity">
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
              {profile?.email && (
                <a href={`mailto:${profile.email}`} className="text-muted-foreground hover:opacity-80 transition-opacity">
                  <Mail className="h-6 w-6" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      {projects.length > 0 && (
        <section className="py-20 px-4 border-t">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Featured Projects</h2>
              <Button variant="ghost" asChild>
                <Link to={`${basePath}/projects`} className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 3).map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {project.image_url && (
                    <img src={project.image_url} alt={project.title} className="w-full h-40 object-cover" />
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(project.tech_stack || []).slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {project.live_url && (
                        <Button size="sm" style={{ backgroundColor: brandColor }} className="text-white" asChild>
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />Live
                          </a>
                        </Button>
                      )}
                      {project.github_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-3 w-3 mr-1" />Code
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Preview */}
      {skills.length > 0 && (
        <section className="py-20 px-4 border-t">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Top Skills</h2>
              <Button variant="ghost" asChild>
                <Link to={`${basePath}/skills`} className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {topCategories.map(([category, categorySkills]) => (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-5 w-5" style={{ color: brandColor }} />
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {categorySkills.slice(0, 5).map((skill) => (
                        <Badge key={skill.id} variant="secondary">{skill.skill_name}</Badge>
                      ))}
                      {categorySkills.length > 5 && (
                        <Badge variant="outline">+{categorySkills.length - 5}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Preview */}
      {blogs.length > 0 && (
        <section className="py-20 px-4 border-t">
          <div className="container mx-auto max-w-3xl">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Latest Articles</h2>
              <Button variant="ghost" asChild>
                <Link to={`${basePath}/blog`} className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {blogs.slice(0, 3).map((blog) => (
                <Link key={blog.id} to={`/p/${username}/blog/${blog.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <FileText className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: brandColor }} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{blog.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{blog.content}</p>
                          <time className="text-xs text-muted-foreground">
                            {format(new Date(blog.published_at || blog.created_at), 'MMMM d, yyyy')}
                          </time>
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

      {/* CTA Section */}
      <section className="py-20 px-4 border-t">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Let's Work Together</h2>
          <p className="text-muted-foreground mb-8">
            Have a project in mind or just want to chat? I'd love to hear from you.
          </p>
          <Button size="lg" style={{ backgroundColor: brandColor }} className="text-white" asChild>
            <Link to={`${basePath}/contact`}>Get in Touch</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
