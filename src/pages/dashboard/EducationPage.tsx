import { useState } from 'react';
import { useEducation, Education } from '@/hooks/usePortfolioData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, GraduationCap, MapPin, Calendar } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Education</h1>
          <p className="text-muted-foreground">Showcase your academic background.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Education</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEducation ? 'Edit Education' : 'Add Education'}</DialogTitle>
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
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : education.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            No education entries yet. Add your academic background.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <Card key={edu.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{edu.degree} in {edu.field_of_study}</CardTitle>
                      <CardDescription className="text-base">{edu.institution}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(edu)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteEducation.mutate(edu.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                    {edu.is_current ? 'Present' : edu.end_date 
                      ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
                      : ''}
                  </div>
                  {edu.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {edu.location}
                    </div>
                  )}
                  {edu.gpa && (
                    <div className="font-medium">GPA: {edu.gpa}</div>
                  )}
                </div>
                {edu.description && (
                  <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
