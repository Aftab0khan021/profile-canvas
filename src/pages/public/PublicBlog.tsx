import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPageContent } from '@/hooks/useProfileItems';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { FileText, Calendar, ArrowRight, Search, X, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function PublicBlog() {
  const { profile, brandColor, template, username } = usePublicLayoutContext();
  const { getContent } = usePublicPageContent(profile?.id);
  const [searchQuery, setSearchQuery] = useState('');

  // Get dynamic content
  const heroSubtitle = getContent('blog', 'hero_subtitle', 'Thoughts, tutorials, and insights on development, technology, and beyond.');
  const emptyStateMessage = getContent('blog', 'empty_state', 'No articles published yet.');

  // Fetch all published blogs
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['publicBlogs', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Filter blogs by search
  const filteredBlogs = useMemo(() => {
    if (!searchQuery) return blogs;
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [blogs, searchQuery]);

  // Separate featured (first) and rest
  const featuredBlog = filteredBlogs[0];
  const restBlogs = filteredBlogs.slice(1);

  // ─── MINIMAL TEMPLATE ───
  if (template === 'minimal') {
    return (
      <>
        <section className="py-20 px-4 text-center border-b">
          <div className="container mx-auto max-w-2xl">
            <h1 className="text-4xl font-bold mb-3">Writing</h1>
            <p className="text-muted-foreground">{heroSubtitle}</p>
          </div>
        </section>
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl space-y-8">
            {filteredBlogs.length === 0 && <p className="text-center text-muted-foreground py-12">{emptyStateMessage}</p>}
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="border-b pb-8 last:border-0">
                <time className="text-xs text-muted-foreground block mb-1">
                  {format(new Date(blog.published_at || blog.created_at), 'MMMM d, yyyy')}
                </time>
                <Link to={`/p/${username}/blog/${blog.slug}`}>
                  <h2 className="text-xl font-semibold hover:underline mb-2">{blog.title}</h2>
                </Link>
                <p className="text-muted-foreground text-sm line-clamp-2">{blog.content}</p>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  // ─── PROFESSIONAL TEMPLATE ───
  if (template === 'professional') {
    return (
      <>
        <section className="py-10 px-4 border-b bg-muted/20">
          <div className="container mx-auto max-w-5xl flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Articles & Insights</h1>
              <p className="text-muted-foreground text-sm">{heroSubtitle}</p>
            </div>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-48" />
            </div>
          </div>
        </section>
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-5xl">
            {filteredBlogs.length === 0 && <p className="text-center text-muted-foreground py-12">{emptyStateMessage}</p>}
            <div className="space-y-3">
              {filteredBlogs.map((blog) => (
                <Link key={blog.id} to={`/p/${username}/blog/${blog.slug}`}>
                  <div className="border rounded-lg p-4 flex items-start justify-between hover:bg-muted/30 transition-colors gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold hover:underline mb-1">{blog.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{blog.content}</p>
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                      {format(new Date(blog.published_at || blog.created_at), 'MMM d, yyyy')}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  // ─── MODERN TEMPLATE (default) ───
  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Latest Insights</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="pb-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Blog List */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
              <p className="mt-4 text-muted-foreground">Loading articles...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No Articles Found' : 'No Articles Published Yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try a different search term.' : emptyStateMessage}
              </p>
              {searchQuery && (
                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              {/* Featured Article */}
              {featuredBlog && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-12"
                >
                  <Link to={`/p/${username}/blog/${featuredBlog.slug}`}>
                    <Card className="overflow-hidden hover:shadow-2xl transition-all cursor-pointer group">
                      <div className="grid md:grid-cols-2">
                        <div 
                          className="h-64 md:h-auto flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${brandColor}25, ${brandColor}05)` }}
                        >
                          <FileText className="h-24 w-24 opacity-30" style={{ color: brandColor }} />
                        </div>
                        <CardContent className="pt-8 pb-8 flex flex-col justify-center">
                          <Badge 
                            className="w-fit mb-4 text-white"
                            style={{ backgroundColor: brandColor }}
                          >
                            Featured Article
                          </Badge>
                          <h2 className="font-bold text-2xl md:text-3xl mb-4 group-hover:underline">
                            {featuredBlog.title}
                          </h2>
                          <p className="text-muted-foreground line-clamp-3 mb-6 text-lg">
                            {featuredBlog.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <time dateTime={featuredBlog.published_at || featuredBlog.created_at}>
                                {format(
                                  new Date(featuredBlog.published_at || featuredBlog.created_at),
                                  'MMMM d, yyyy'
                                )}
                              </time>
                            </div>
                            <Button 
                              className="text-white gap-2"
                              style={{ backgroundColor: brandColor }}
                            >
                              Read Article <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              )}

              {/* Rest of the Articles - 3 Column Grid */}
              {restBlogs.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restBlogs.map((blog, index) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link to={`/p/${username}/blog/${blog.slug}`}>
                        <Card className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
                          <div 
                            className="h-32 flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${brandColor}15, ${brandColor}05)` }}
                          >
                            <FileText className="h-12 w-12 opacity-30" style={{ color: brandColor }} />
                          </div>
                          <CardContent className="pt-6">
                            <h3 className="font-bold text-lg mb-2 group-hover:underline line-clamp-2">
                              {blog.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                              {blog.content}
                            </p>
                            <div className="flex items-center justify-between">
                              <time 
                                className="text-xs text-muted-foreground"
                                dateTime={blog.published_at || blog.created_at}
                              >
                                {format(
                                  new Date(blog.published_at || blog.created_at),
                                  'MMM d, yyyy'
                                )}
                              </time>
                              <span
                                className="text-sm font-medium flex items-center gap-1"
                                style={{ color: brandColor }}
                              >
                                Read <ArrowRight className="h-3 w-3" />
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
