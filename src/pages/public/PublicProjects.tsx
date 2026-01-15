import { useState, useMemo } from 'react';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Filter, X } from 'lucide-react';

export default function PublicProjects() {
  const { profile, brandColor } = usePublicLayoutContext();
  const { projects } = usePublicPortfolioData(profile?.id);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  // Get unique tech stack items for filtering
  const allTechStack = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach((project) => {
      (project.tech_stack || []).forEach((tech) => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }, [projects]);

  // Filter projects by selected tech
  const filteredProjects = useMemo(() => {
    if (!selectedTech) return projects;
    return projects.filter((project) =>
      (project.tech_stack || []).includes(selectedTech)
    );
  }, [projects, selectedTech]);

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Projects</h1>
            <p className="text-muted-foreground text-lg">
              A collection of my work, side projects, and experiments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Filters */}
      {allTechStack.length > 0 && (
        <section className="pb-8 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">Filter by:</span>
              {selectedTech && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTech(null)}
                  className="gap-1"
                >
                  <X className="h-3 w-3" /> Clear
                </Button>
              )}
              {allTechStack.slice(0, 10).map((tech) => (
                <Badge
                  key={tech}
                  variant={selectedTech === tech ? 'default' : 'secondary'}
                  className="cursor-pointer transition-colors"
                  style={selectedTech === tech ? { backgroundColor: brandColor } : undefined}
                  onClick={() => setSelectedTech(selectedTech === tech ? null : tech)}
                >
                  {tech}
                </Badge>
              ))}
              {allTechStack.length > 10 && (
                <Badge variant="outline">+{allTechStack.length - 10} more</Badge>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Projects Grid */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {selectedTech
                  ? `No projects found with ${selectedTech}.`
                  : 'No projects to display yet.'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                    {project.image_url && (
                      <div className="relative overflow-hidden">
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-48 object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end">
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(project.tech_stack || []).map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setSelectedTech(t)}
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
                    </CardContent>
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
