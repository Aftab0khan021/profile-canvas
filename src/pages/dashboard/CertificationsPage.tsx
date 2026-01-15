import { useState } from 'react';
import { useCertifications, Certification } from '@/hooks/usePortfolioData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Award, ExternalLink, Calendar } from 'lucide-react';

export default function CertificationsPage() {
  const { certifications, isLoading, createCertification, updateCertification, deleteCertification } = useCertifications();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    credential_url: '',
    skills_learned: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      issuer: '',
      issue_date: '',
      credential_url: '',
      skills_learned: '',
    });
    setEditingCert(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      credential_url: formData.credential_url || null,
      skills_learned: formData.skills_learned.split(',').map(s => s.trim()).filter(Boolean),
    };
    if (editingCert) {
      updateCertification.mutate({ id: editingCert.id, ...data });
    } else {
      createCertification.mutate(data);
    }
    setIsOpen(false);
    resetForm();
  };

  const openEdit = (cert: Certification) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title,
      issuer: cert.issuer,
      issue_date: cert.issue_date,
      credential_url: cert.credential_url || '',
      skills_learned: cert.skills_learned.join(', '),
    });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Certifications</h1>
          <p className="text-muted-foreground">Showcase your professional certifications.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Certification</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCert ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="AWS Solutions Architect"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Issuer *</Label>
                <Input
                  value={formData.issuer}
                  onChange={(e) => setFormData(p => ({ ...p, issuer: e.target.value }))}
                  placeholder="Amazon Web Services"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Issue Date *</Label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData(p => ({ ...p, issue_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Credential URL</Label>
                <Input
                  value={formData.credential_url}
                  onChange={(e) => setFormData(p => ({ ...p, credential_url: e.target.value }))}
                  placeholder="https://verify.example.com/..."
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label>Skills Learned (comma separated)</Label>
                <Input
                  value={formData.skills_learned}
                  onChange={(e) => setFormData(p => ({ ...p, skills_learned: e.target.value }))}
                  placeholder="Cloud Architecture, EC2, S3"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createCertification.isPending || updateCertification.isPending}>
                {(createCertification.isPending || updateCertification.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingCert ? 'Update Certification' : 'Add Certification'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : certifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            No certifications yet. Add your professional certifications.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certifications.map((cert) => (
            <Card key={cert.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{cert.title}</CardTitle>
                      <CardDescription>{cert.issuer}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(cert)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteCertification.mutate(cert.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                {cert.skills_learned.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {cert.skills_learned.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                )}
                {cert.credential_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Verify
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
