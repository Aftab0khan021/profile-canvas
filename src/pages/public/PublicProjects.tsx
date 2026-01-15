import { useState, useMemo } from 'react';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { usePublicPageContent } from '@/hooks/useProfileItems';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Search, X, LayoutGrid, List, FolderOpen } from 'lucide-react';

type ViewMode = 'grid' | 'list';

export default function PublicProjects() {
  const { profile, brandColor } = usePublicLayoutContext();
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

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">My Projects</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Toolbar: Search, Categories, View Toggle */}
      <section className="pb-8 px-4 sticky top-14 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
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

            {/* Category Tabs */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Button
                variant={!selectedCategory ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                style={!selectedCategory ? { backgroundColor: brandColor } : undefined}
                className={!selectedCategory ? 'text-white' : ''}
              >
                All
                <Badge variant="secondary" className="ml-2 text-xs">
                  {projects.length}
                </Badge>
              </Button>
              {categories.map(([category, count]) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  style={selectedCategory === category ? { backgroundColor: brandColor } : undefined}
                  className={selectedCategory === category ? 'text-white' : ''}
                >
                  {category}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Display */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory
                  ? 'Try adjusting your search or filters.'
                  : emptyStateMessage}
              </p>
              {(searchQuery || selectedCategory) && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid md:grid-cols-2 gap-8">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group h-full flex flex-col">
                    {/* Image with Overlay */}
                    <div className="relative overflow-hidden h-56">
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${brandColor}20, ${brandColor}05)` }}
                        >
                          <FolderOpen className="h-16 w-16 text-muted-foreground/50" />
                        </div>
                      )}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        {project.live_url && (
                          <Button 
                            size="sm" 
                            className="text-white"
                            style={{ backgroundColor: brandColor }}
                            asChild
                          >
                            <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </a>
                          </Button>
                        )}
                        {project.github_url && (
                          <Button size="sm" variant="secondary" asChild>
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-2" />
                              Code
                            </a>
                          </Button>
                        )}
                        {!project.live_url && !project.github_url && (
                          <p className="text-white/70 text-sm">No links available</p>
                        )}
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end">
                      <div className="flex flex-wrap gap-1">
                        {(project.tech_stack || []).map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80"
                            onClick={() => setSelectedCategory(t)}
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="relative overflow-hidden w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${brandColor}20, ${brandColor}05)` }}
                          >
                            <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 p-6">
                        <h3 className="font-bold text-xl mb-2">{project.title}</h3>
                        <p className="text-muted-foreground mb-4">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {(project.tech_stack || []).map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="cursor-pointer hover:bg-secondary/80"
                              onClick={() => setSelectedCategory(t)}
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {project.live_url && (
                            <Button
                              size="sm"
                              style={{ backgroundColor: brandColor }}
                              className="text-white"
                              asChild
                            >
                              <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Live Demo
                              </a>
                            </Button>
                          )}
                          {project.github_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                <Github className="h-3 w-3 mr-1" />
                                Source Code
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
