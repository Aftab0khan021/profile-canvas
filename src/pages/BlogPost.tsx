import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePublicProfile } from '@/hooks/useProfile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function BlogPost() {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const { data: profile, isLoading: profileLoading } = usePublicProfile(username || '');

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

  const isLoading = profileLoading || blogLoading;
  const brandColor = profile?.brand_color || '#3b82f6';

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
              <Link to={`/p/${username}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <article className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time dateTime={blog.published_at || blog.created_at}>
                {format(new Date(blog.published_at || blog.created_at), 'MMMM d, yyyy')}
              </time>
            </div>
          </header>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {blog.content?.split('\n').map((paragraph, i) => (
              paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
            ))}
          </div>
        </div>
      </article>

      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profile.full_name}. Built with FolioX.
        </div>
      </footer>
    </div>
  );
}
