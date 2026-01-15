import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  Link as LinkIcon,
  FolderOpen
} from 'lucide-react';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { profile, brandColor, username } = usePublicLayoutContext();
  const { projects } = usePublicPortfolioData(profile?.id);
  
  const project = useMemo(() => 
    projects.find(p => p.id === projectId), 
    [projects, projectId]
  );
  
  // For demo purposes, create multiple images from the single image
  const images = useMemo(() => {
    if (!project?.image_url) return [];
    // In a real app, you'd have multiple images stored
    return [project.image_url];
  }, [project]);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Demo key features - in production, these would be stored in the database
  const keyFeatures = useMemo(() => {
    if (!project) return [];
    return [
      'Responsive design for all devices',
      'Modern UI/UX with smooth animations',
      'Optimized for performance',
      'Clean and maintainable codebase',
      'Accessible and SEO-friendly',
    ];
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <FolderOpen className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Project not found.</p>
        <Button asChild variant="outline">
          <Link to={`/p/${username}/projects`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Back Navigation */}
      <section className="pt-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button variant="ghost" asChild>
              <Link to={`/p/${username}/projects`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Project Header */}
      <section className="pt-8 pb-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <Badge 
                className="text-white"
                style={{ backgroundColor: '#10b981' }}
              >
                Completed
              </Badge>
              {(project.tech_stack || [])[0] && (
                <Badge variant="outline">
                  {project.tech_stack[0]}
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold">{project.title}</h1>
            
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {project.description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>2-3 months</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 pt-4">
              {project.live_url && (
                <Button 
                  size="lg" 
                  className="text-white"
                  style={{ backgroundColor: brandColor }}
                  asChild
                >
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    View Live Demo
                  </a>
                </Button>
              )}
              {project.github_url && (
                <Button size="lg" variant="outline" asChild>
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5 mr-2" />
                    Source Code
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Main Image Stage */}
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video mb-4">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={`${project.title} screenshot ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </>
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${brandColor}20, ${brandColor}05)` }}
                >
                  <FolderOpen className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all ${
                      index === currentImageIndex 
                        ? 'ring-2 ring-offset-2 ring-primary' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Details Grid */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Key Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" style={{ color: brandColor }} />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {keyFeatures.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 
                          className="h-5 w-5 mt-0.5 flex-shrink-0" 
                          style={{ color: brandColor }} 
                        />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Technologies Used */}
              <Card>
                <CardHeader>
                  <CardTitle>Technologies Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(project.tech_stack || []).map((tech, index) => (
                      <motion.div
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      >
                        <Badge 
                          variant="secondary" 
                          className="text-sm py-1.5 px-3"
                        >
                          {tech}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" style={{ color: brandColor }} />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: `${brandColor}10` }}
                    >
                      <p className="text-sm text-muted-foreground mb-1">Started</p>
                      <p className="font-semibold">
                        {new Date(project.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div 
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: `${brandColor}10` }}
                    >
                      <p className="text-sm text-muted-foreground mb-1">Completed</p>
                      <p className="font-semibold">
                        {new Date(project.updated_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" style={{ color: brandColor }} />
                    Project Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${brandColor}20` }}
                        >
                          <ExternalLink className="h-5 w-5" style={{ color: brandColor }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Live Demo</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {project.live_url}
                          </p>
                        </div>
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${brandColor}20` }}
                        >
                          <Github className="h-5 w-5" style={{ color: brandColor }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Source Code</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {project.github_url}
                          </p>
                        </div>
                      </a>
                    )}
                    {!project.live_url && !project.github_url && (
                      <p className="text-muted-foreground text-center py-4">
                        No external links available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
