import { Link } from 'react-router-dom';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FileText, Calendar, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function PublicBlog() {
  const { profile, brandColor, username } = usePublicLayoutContext();

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

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-muted-foreground text-lg">
              Thoughts, tutorials, and insights on development and technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog List */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles published yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                          <div className="flex-1">
                            <h2 className="font-semibold text-xl mb-2 group-hover:underline">
                              {blog.title}
                            </h2>
                            <p className="text-muted-foreground line-clamp-2 mb-3">
                              {blog.content}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <time dateTime={blog.published_at || blog.created_at}>
                                  {format(
                                    new Date(blog.published_at || blog.created_at),
                                    'MMMM d, yyyy'
                                  )}
                                </time>
                              </div>
                              <span
                                className="text-sm font-medium flex items-center gap-1"
                                style={{ color: brandColor }}
                              >
                                Read more <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
