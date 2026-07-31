import { useState } from 'react';
import { useEducation, Education } from '@/hooks/usePortfolioData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, GraduationCap, MapPin, Calendar } from 'lucide-react';
import { PageShell, EmptyState, PageLoader } from '@/components/PageShell';

export default function EducationPage() {
  const { education, isLoading, createEducation, updateEducation, deleteEducation } = useEducation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [formData, setFormData] = useState({
    degree: '',
    field_of_study: '',
    institution: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    gpa: '',
    description: '',
  });

  const resetForm = () => {
    setFormData({
      degree: '',
      field_of_study: '',
      institution: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      gpa: '',
      description: '',
    });
    setEditingEducation(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      location: formData.location || null,
      end_date: formData.is_current ? null : formData.end_date || null,
      gpa: formData.gpa || null,
      description: formData.description || null,
    };
    if (editingEducation) {
      updateEducation.mutate({ id: editingEducation.id, ...data });
    } else {
      createEducation.mutate(data);
    }
    setIsOpen(false);
    resetForm();
  };

  const openEdit = (edu: Education) => {
    setEditingEducation(edu);
    setFormData({
      degree: edu.degree,
      field_of_study: edu.field_of_study,
      institution: edu.institution,
      location: edu.location || '',
      start_date: edu.start_date,
      end_date: edu.end_date || '',
      is_current: edu.is_current,
      gpa: edu.gpa || '',
      description: edu.description || '',
    });
    setIsOpen(true);
  };

  return (
    <PageShell
      title="Education"
      description="Showcase your academic background and qualifications."
      maxWidth="xl"
      action={
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-gradient h-9 rounded-lg px-4 text-sm font-semibold"><Plus className="h-4 w-4 mr-1.5" />Add Education</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">{editingEducation ? 'Edit Education' : 'Add Education'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Degree *</Label>
                <Input
                  value={formData.degree}
                  onChange={(e) => setFormData(p => ({ ...p, degree: e.target.value }))}
                  placeholder="Bachelor of Science"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Field of Study *</Label>
                <Input
                  value={formData.field_of_study}
                  onChange={(e) => setFormData(p => ({ ...p, field_of_study: e.target.value }))}
                  placeholder="Computer Science"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Institution *</Label>
                <Input
                  value={formData.institution}
                  onChange={(e) => setFormData(p => ({ ...p, institution: e.target.value }))}
                  placeholder="Stanford University"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                  placeholder="Stanford, CA"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))}
                    disabled={formData.is_current}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_current"
                  checked={formData.is_current}
                  onCheckedChange={(checked) => setFormData(p => ({ ...p, is_current: checked }))}
                />
                <Label htmlFor="is_current">Currently enrolled</Label>
              </div>
              <div className="space-y-2">
                <Label>GPA (optional)</Label>
                <Input
                  value={formData.gpa}
                  onChange={(e) => setFormData(p => ({ ...p, gpa: e.target.value }))}
                  placeholder="3.8/4.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Relevant coursework, achievements, activities..."
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createEducation.isPending || updateEducation.isPending}>
                {(createEducation.isPending || updateEducation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingEducation ? 'Update Education' : 'Add Education'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
        </div>
      ) : education.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon={GraduationCap}
            title="No education added yet"
            body="Add your academic background to showcase your qualifications."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((edu) => (
            <div key={edu.id} className="group flex gap-4 p-5 rounded-xl border border-border bg-card hover:border-border/80 transition-colors duration-150">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <h3 className="font-display font-semibold text-[15px] leading-snug">{edu.degree} in {edu.field_of_study}</h3>
                    <p className="text-sm font-medium text-violet-600 dark:text-violet-400">{edu.institution}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(edu)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deleteEducation.mutate(edu.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-mono mb-2">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — {edu.is_current ? 'Present' : edu.end_date ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}</span>
                  {edu.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{edu.location}</span>}
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                </div>
                {edu.description && <p className="text-sm text-muted-foreground leading-relaxed">{edu.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
