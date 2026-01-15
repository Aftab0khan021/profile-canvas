import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePublicProfile } from '@/hooks/useProfile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Loader2, 
  Clock, 
  Heart, 
  Bookmark, 
  Share2,
  User,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

export default function BlogPost() {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const { data: profile, isLoading: profileLoading } = usePublicProfile(username || '');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: blog, isLoading: blogLoading } = useQuery({
    queryKey: ['publicBlog', profile?.id, slug],
    queryFn: async () => {
      if (!profile?.id || !slug) return null;
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('user_id', profile.id)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id && !!slug,
  });

  // Fetch related articles
  const { data: relatedBlogs = [] } = useQuery({
    queryKey: ['relatedBlogs', profile?.id, slug],
    queryFn: async () => {
      if (!profile?.id || !slug) return [];
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'published')
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id && !!slug,
  });

  const isLoading = profileLoading || blogLoading;
  const brandColor = profile?.brand_color || '#3b82f6';

  // Calculate read time
  const readTime = useMemo(() => {
    if (!blog?.content) return 1;
    const wordsPerMinute = 200;
    const wordCount = blog.content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }, [blog?.content]);

  // Demo tags
  const tags = useMemo(() => {
    return ['Technology', 'Web Development', 'Tutorial'];
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: blog?.title,
        text: blog?.content?.substring(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Portfolio not found.</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Article not found.</p>
        <Button asChild variant="outline">
          <Link to={`/p/${username}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Link>
        </Button>
      </div>
    );
  }

  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        .brand-primary { color: ${brandColor}; }
        .brand-bg { background-color: ${brandColor}; }
        .brand-border { border-color: ${brandColor}; }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to={`/p/${username}`} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg brand-bg flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
            <span className="font-semibold">{profile.full_name}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link to={`/p/${username}/blog`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Image Placeholder */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-14"
      >
        <div 
          className="w-full h-64 md:h-96"
          style={{ 
            background: `linear-gradient(135deg, ${brandColor}30, ${brandColor}10)` 
          }}
        >
          <div className="container mx-auto h-full flex items-center justify-center">
            <div className="text-center">
              <div 
                className="h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <span className="text-4xl">📝</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <article className="pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Article Header */}
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="py-8 -mt-20 relative z-10"
          >
            <Card className="p-8">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-6">{blog.title}</h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback style={{ backgroundColor: brandColor }} className="text-white text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{profile.full_name}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={blog.published_at || blog.created_at}>
                    {format(new Date(blog.published_at || blog.created_at), 'MMMM d, yyyy')}
                  </time>
                </div>

                {/* Read Time */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readTime} min read</span>
                </div>
              </div>

              {/* Interaction Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant={liked ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLiked(!liked)}
                  style={liked ? { backgroundColor: brandColor } : undefined}
                  className={liked ? 'text-white' : ''}
                >
                  <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                  Like
                </Button>
                <Button
                  variant={saved ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSaved(!saved)}
                  style={saved ? { backgroundColor: brandColor } : undefined}
                  className={saved ? 'text-white' : ''}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${saved ? 'fill-current' : ''}`} />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </Card>
          </motion.header>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="prose prose-slate dark:prose-invert max-w-none py-8"
          >
            {blog.content?.split('\n').map((paragraph, i) => (
              paragraph.trim() ? (
                <p key={i} className="mb-4 text-lg leading-relaxed">
                  {paragraph}
                </p>
              ) : (
                <br key={i} />
              )
            ))}
          </motion.div>

          {/* Author Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="mt-8">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback 
                      style={{ backgroundColor: brandColor }} 
                      className="text-white text-xl"
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {profile.bio || profile.title || 'Author'}
                    </p>
                    <Button 
                      size="sm" 
                      className="text-white"
                      style={{ backgroundColor: brandColor }}
                      asChild
                    >
                      <Link to={`/p/${username}/contact`}>
                        <User className="h-4 w-4 mr-2" />
                        Get in Touch
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog, index) => (
                  <motion.div
                    key={relatedBlog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  >
                    <Link to={`/p/${username}/blog/${relatedBlog.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                        <CardHeader className="pb-2">
                          <div 
                            className="h-32 rounded-lg mb-3 flex items-center justify-center"
                            style={{ 
                              background: `linear-gradient(135deg, ${brandColor}20, ${brandColor}05)` 
                            }}
                          >
                            <span className="text-3xl">📄</span>
                          </div>
                          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {relatedBlog.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(relatedBlog.published_at || relatedBlog.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </article>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profile.full_name}. Built with FolioX.
        </div>
      </footer>
    </div>
  );
}
