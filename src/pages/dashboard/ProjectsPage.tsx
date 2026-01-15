import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useProjects, Project } from '@/hooks/usePortfolioData';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, ExternalLink, Github, Loader2, GripVertical, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ImageUpload';
import { ProjectPreviewModal } from '@/components/ProjectPreviewModal';

export default function ProjectsPage() {
  const { projects, isLoading, createProject, updateProject, deleteProject, reorderProjects } = useProjects();
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    image_url: '', 
    live_url: '', 
    github_url: '', 
    tech_stack: '', 
    sort_order: 0 
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', image_url: '', live_url: '', github_url: '', tech_stack: '', sort_order: 0 });
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, tech_stack: formData.tech_stack.split(',').map(s => s.trim()).filter(Boolean) };
    if (editingProject) {
      updateProject.mutate({ id: editingProject.id, ...data });
    } else {
      createProject.mutate(data);
    }
    setIsOpen(false);
    resetForm();
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ 
      title: project.title, 
      description: project.description || '', 
      image_url: project.image_url || '', 
      live_url: project.live_url || '', 
      github_url: project.github_url || '', 
      tech_stack: project.tech_stack.join(', '), 
      sort_order: project.sort_order 
    });
    setIsOpen(true);
  };

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;

    const reorderedProjects = Array.from(projects);
    const [removed] = reorderedProjects.splice(sourceIndex, 1);
    reorderedProjects.splice(destinationIndex, 0, removed);

    const updates = reorderedProjects.map((project, index) => ({
      id: project.id,
      sort_order: index,
    }));

    reorderProjects.mutate(updates);
  }, [projects, reorderProjects]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Showcase your best work. Drag to reorder.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Project Image</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData(p => ({ ...p, image_url: url }))}
                  variant="image"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Live URL</Label>
                  <Input value={formData.live_url} onChange={(e) => setFormData(p => ({ ...p, live_url: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>GitHub URL</Label>
                  <Input value={formData.github_url} onChange={(e) => setFormData(p => ({ ...p, github_url: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tech Stack (comma separated)</Label>
                <Input value={formData.tech_stack} onChange={(e) => setFormData(p => ({ ...p, tech_stack: e.target.value }))} placeholder="React, TypeScript, Tailwind" />
              </div>
              <Button type="submit" className="w-full" disabled={createProject.isPending || updateProject.isPending}>
                {(createProject.isPending || updateProject.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingProject ? 'Update Project' : 'Create Project'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">No projects yet. Add your first project to get started.</CardContent></Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="grid gap-4 md:grid-cols-2"
              >
                {projects.map((project, index) => (
                  <Draggable key={project.id} draggableId={project.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? 'opacity-90' : ''}
                      >
                        <Card className="h-full">
                          {project.image_url && (
                            <img 
                              src={project.image_url} 
                              alt={project.title} 
                              className="w-full h-40 object-cover rounded-t-lg" 
                            />
                          )}
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="truncate">{project.title}</span>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => setPreviewProject(project)}
                                  title="Preview"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openEdit(project)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteProject.mutate(project.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardTitle>
                            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.tech_stack.map((tech) => (
                                <Badge key={tech} variant="secondary">{tech}</Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              {project.live_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={project.live_url} target="_blank" rel="noopener">
                                    <ExternalLink className="h-3 w-3 mr-1" />Live
                                  </a>
                                </Button>
                              )}
                              {project.github_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={project.github_url} target="_blank" rel="noopener">
                                    <Github className="h-3 w-3 mr-1" />Code
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Project Preview Modal */}
      <ProjectPreviewModal
        project={previewProject}
        brandColor={profile?.brand_color || '#3b82f6'}
        open={!!previewProject}
        onOpenChange={(open) => !open && setPreviewProject(null)}
      />
    </div>
  );
}
