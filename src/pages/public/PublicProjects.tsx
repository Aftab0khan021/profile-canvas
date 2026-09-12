import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { usePublicPageContent } from '@/hooks/useProfileItems';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Search, X, LayoutGrid, List, FolderOpen, Eye } from 'lucide-react';
import { getOptimizedImageUrl, IMAGE_PRESETS } from '@/lib/imageOptimization';

type ViewMode = 'grid' | 'list';

export default function PublicProjects() {
  const { profile, brandColor, template, username } = usePublicLayoutContext();
  const { projects } = usePublicPortfolioData(profile?.id);
  const { getContent } = usePublicPageContent(profile?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Get dynamic content
  const heroSubtitle = getContent('projects', 'hero_subtitle', 'A showcase of my work, experiments, and contributions. Each project represents a unique challenge and solution.');
  const emptyStateMessage = getContent('projects', 'empty_state', 'No projects to display yet.');

  // Get unique categories and tech stack for filtering
  const { categories, allTechStack } = useMemo(() => {
    const catSet = new Map<string, number>();
    const techSet = new Set<string>();

    projects.forEach((project) => {
      // Use first tech as category approximation or create generic categories
      const primaryTech = (project.tech_stack || [])[0] || 'Other';
      catSet.set(primaryTech, (catSet.get(primaryTech) || 0) + 1);
      (project.tech_stack || []).forEach((tech) => techSet.add(tech));
    });

    return {
      categories: Array.from(catSet.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
      allTechStack: Array.from(techSet).sort(),
    };
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = !searchQuery ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.tech_stack || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = !selectedCategory ||
        (project.tech_stack || []).includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

  // ─── MINIMAL TEMPLATE ───
  if (template === 'minimal') {
    return (
      <>
        <section className="py-20 px-4 text-center border-b">
          <div className="container mx-auto max-w-2xl">
            <h1 className="text-4xl font-bold mb-3">Projects</h1>
            <p className="text-muted-foreground">{heroSubtitle}</p>
          </div>
        </section>
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl space-y-8">
            {filteredProjects.length === 0 && <p className="text-center text-muted-foreground py-12">{emptyStateMessage}</p>}
            {filteredProjects.map((project) => (
              <div key={project.id} className="border-b pb-8 last:border-0">
                <Link to={`/p/${username}/projects/${project.id}`}>
                  <h2 className="text-xl font-semibold hover:underline mb-2">{project.title}</h2>
                </Link>
                <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {(project.tech_stack || []).map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 border rounded-full">{t}</span>
                  ))}
                </div>
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
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold mb-1">Projects</h1>
            <p className="text-muted-foreground text-sm">{heroSubtitle}</p>
          </div>
        </section>
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-5xl">
            {/* Compact search bar */}
            <div className="relative mb-6 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            {filteredProjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">{emptyStateMessage}</p>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="border rounded-lg overflow-hidden flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    {project.image_url ? (
                      <img src={getOptimizedImageUrl(project.image_url, IMAGE_PRESETS.thumbnail)} alt={project.title} className="w-16 h-16 rounded object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded flex-shrink-0 flex items-center justify-center" style={{ background: `${brandColor}15` }}>
                        <FolderOpen className="h-6 w-6" style={{ color: brandColor }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link to={`/p/${username}/projects/${project.id}`}>
                        <h3 className="font-semibold hover:underline truncate">{project.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(project.tech_stack || []).slice(0, 4).map(t => (
                          <span key={t} className="text-xs px-1.5 py-0.5 bg-muted rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" /></a>}
                      {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer"><Github className="h-4 w-4 text-muted-foreground hover:text-foreground" /></a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  // ─── MODERN TEMPLATE (default) — IMMERSIVE ───
  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ color: brandColor }}>
              PORTFOLIO
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-title mb-4" style={{ '--gradient-color': brandColor } as React.CSSProperties}>
              My Projects
            </h1>
            <p className="text-base max-w-2xl leading-relaxed" style={{ color: '#6b7280' }}>
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="pb-8 px-4 sticky top-14 z-40 backdrop-blur-xl" style={{ backgroundColor: 'rgba(8,8,8,0.85)', borderBottom: `1px solid ${brandColor}10` }}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#4b5563' }} />
              <input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-mono outline-none transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(14,14,14,0.8)',
                  border: `1px solid rgba(255,255,255,0.06)`,
                  color: '#f0ede6',
                  caretColor: brandColor,
                }}
                onFocus={(e) => e.target.style.borderColor = `${brandColor}50`}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-300"
                style={{
                  backgroundColor: !selectedCategory ? brandColor : 'rgba(14,14,14,0.8)',
                  color: !selectedCategory ? '#fff' : '#6b7280',
                  border: `1px solid ${!selectedCategory ? brandColor : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: !selectedCategory ? `0 0 12px -4px ${brandColor}` : 'none',
                }}
              >
                ALL
              </button>
              {categories.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: selectedCategory === cat ? brandColor : 'rgba(14,14,14,0.8)',
                    color: selectedCategory === cat ? '#fff' : '#6b7280',
                    border: `1px solid ${selectedCategory === cat ? brandColor : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: selectedCategory === cat ? `0 0 12px -4px ${brandColor}` : 'none',
                  }}
                >
                  {cat} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Project Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <FolderOpen className="h-12 w-12 mx-auto mb-4" style={{ color: '#374151' }} />
              <p className="font-mono text-sm" style={{ color: '#6b7280' }}>{emptyStateMessage}</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 40, rotateY: index % 2 === 0 ? 6 : -6 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: index * 0.08 }}
                  className={index === 0 ? 'md:col-span-2' : ''}
                >
                  <Link to={`/p/${username}/projects/${project.id}`} data-cursor="VIEW">
                    <div
                      className="group rounded-xl overflow-hidden transition-all duration-500 h-full flex flex-col scan-line relative hover:scale-[1.01]"
                      style={{
                        backgroundColor: '#0e0e0e',
                        border: '1px solid rgba(255,255,255,0.06)',
                        '--scan-color': `${brandColor}12`,
                      } as React.CSSProperties}
                    >
                      {project.image_url && (
                        <div className={`relative overflow-hidden ${index === 0 ? 'h-72' : 'h-48'}`}>
                          <img
                            src={getOptimizedImageUrl(project.image_url, index === 0 ? IMAGE_PRESETS.hero : IMAGE_PRESETS.card)}
                            alt={project.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
                          {/* Overlay badges */}
                          <div className="absolute bottom-3 left-3 flex gap-2">
                            {project.live_url && (
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold"
                                style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', color: '#f0ede6' }}>
                                <ExternalLink className="h-3 w-3" /> LIVE
                              </span>
                            )}
                            {project.github_url && (
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold"
                                style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', color: '#f0ede6' }}>
                                <Github className="h-3 w-3" /> CODE
                              </span>
                            )}
                          </div>
                          {project.featured && (
                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase"
                              style={{ backgroundColor: brandColor, color: '#fff' }}>
                              FEATURED
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        {project.category && (
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: brandColor }}>
                            {project.category}
                          </span>
                        )}
                        <h3 className="font-display font-bold text-lg mb-2 group-hover:text-white transition-colors" style={{ color: '#e5e7eb' }}>{project.title}</h3>
                        <p className="text-sm line-clamp-2 mb-4 flex-1" style={{ color: '#6b7280' }}>{project.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(project.tech_stack || []).slice(0, 5).map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono transition-all duration-300"
                              style={{ backgroundColor: `${brandColor}10`, color: `${brandColor}cc`, border: `1px solid ${brandColor}20` }}>
                              {t}
                            </span>
                          ))}
                          {(project.tech_stack || []).length > 5 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ color: '#4b5563' }}>
                              +{(project.tech_stack || []).length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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
