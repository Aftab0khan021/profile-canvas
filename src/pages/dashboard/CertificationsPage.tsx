import { useState } from 'react';
import { useCertifications, Certification } from '@/hooks/usePortfolioData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, Award, ExternalLink, Calendar } from 'lucide-react';
import { PageShell, EmptyState } from '@/components/PageShell';

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
    // M-3: Validate credential_url must start with https:// to prevent javascript: or http:// links
    if (formData.credential_url && !formData.credential_url.startsWith('https://')) {
      alert('Credential URL must start with https://');
      return;
    }
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
    <PageShell
      title="Certifications"
      description="Showcase your professional certifications and achievements."
      maxWidth="xl"
      action={
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-gradient h-9 rounded-lg px-4 text-sm font-semibold"><Plus className="h-4 w-4 mr-1.5" />Add Certification</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">{editingCert ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
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
      }
    >

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" /></div>
      ) : certifications.length === 0 ? (
        <div className="bento-card">
          <EmptyState icon={Award} title="No certifications yet" body="Add your professional certifications to build credibility." />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {certifications.map((cert) => (
            <div key={cert.id} className="group flex gap-3 p-4 bento-card">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-[14px] leading-snug">{cert.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{cert.issuer}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(cert)} className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => deleteCertification.mutate(cert.id)} className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono mt-1">
                  <Calendar className="h-3 w-3" />{new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                {cert.skills_learned.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cert.skills_learned.map((skill) => (
                      <span key={skill} className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground">{skill}</span>
                    ))}
                  </div>
                )}
                {cert.credential_url && cert.credential_url.startsWith('https://') && (
                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-violet-500 hover:text-violet-600 font-mono mt-2">
                    <ExternalLink className="h-3 w-3" />Verify credential
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
