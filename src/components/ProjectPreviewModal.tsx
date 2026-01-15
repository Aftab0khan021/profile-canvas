import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Github, X } from 'lucide-react';
import { Project } from '@/hooks/usePortfolioData';

interface ProjectPreviewModalProps {
  project: Project | null;
  brandColor?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectPreviewModal({
  project,
  brandColor = '#3b82f6',
  open,
  onOpenChange,
}: ProjectPreviewModalProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Project Preview: {project.title}</DialogTitle>
        </DialogHeader>
        
        {/* Preview Container - simulating public portfolio look */}
        <div className="bg-card rounded-lg overflow-hidden">
          {/* Image */}
          {project.image_url ? (
            <div className="relative aspect-video bg-muted">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold">{project.title}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 -mr-2 -mt-2"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {project.description && (
              <p className="text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Tech Stack */}
            {project.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    style={{ borderColor: brandColor }}
                    className="border"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="flex gap-3 pt-2">
              {project.live_url && (
                <Button
                  style={{ backgroundColor: brandColor }}
                  className="text-white"
                  asChild
                >
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live
                  </a>
                </Button>
              )}
              {project.github_url && (
                <Button variant="outline" asChild>
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    Source Code
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Footer hint */}
          <div className="px-6 py-3 bg-muted/50 border-t text-xs text-muted-foreground text-center">
            This is how your project will appear on your public portfolio
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
