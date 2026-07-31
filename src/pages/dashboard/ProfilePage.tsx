import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, User, Link2, Phone, Mail } from 'lucide-react';
import { PageShell, Section, FieldRow, FieldGrid } from '@/components/PageShell';

export default function ProfilePage() {
  const { profile, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    title: profile?.title || '',
    bio: profile?.bio || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    linkedin_url: profile?.linkedin_url || '',
    github_url: profile?.github_url || '',
    avatar_url: profile?.avatar_url || '',
    resume_url: profile?.resume_url || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <PageShell
      title="Profile"
      description="Manage your public profile information."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <Section
          title="Basic Information"
          description="Displayed on your public portfolio."
        >
          <div className="space-y-4">
            <FieldGrid>
              <FieldRow>
                <Label htmlFor="full_name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Full Name</Label>
                <Input id="full_name" value={formData.full_name} onChange={(e) => handleChange('full_name', e.target.value)} placeholder="John Doe" className="h-10 rounded-lg" />
              </FieldRow>
              <FieldRow>
                <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Title</Label>
                <Input id="title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Full Stack Developer" className="h-10 rounded-lg" />
              </FieldRow>
            </FieldGrid>
            <FieldRow>
              <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Bio</Label>
              <Textarea id="bio" value={formData.bio} onChange={(e) => handleChange('bio', e.target.value)} placeholder="Tell visitors about yourself..." rows={4} className="rounded-lg resize-none" />
            </FieldRow>
            <FieldGrid>
              <FieldRow>
                <Label htmlFor="avatar_url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Avatar URL</Label>
                <Input id="avatar_url" value={formData.avatar_url} onChange={(e) => handleChange('avatar_url', e.target.value)} placeholder="https://..." className="h-10 rounded-lg" />
              </FieldRow>
              <FieldRow>
                <Label htmlFor="resume_url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Resume URL</Label>
                <Input id="resume_url" value={formData.resume_url} onChange={(e) => handleChange('resume_url', e.target.value)} placeholder="https://..." className="h-10 rounded-lg" />
              </FieldRow>
            </FieldGrid>
          </div>
        </Section>

        {/* Contact */}
        <Section
          title="Contact Information"
          description="How visitors can reach you."
        >
          <div className="space-y-4">
            <FieldGrid>
              <FieldRow>
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="h-10 rounded-lg" />
              </FieldRow>
              <FieldRow>
                <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="h-10 rounded-lg" />
              </FieldRow>
            </FieldGrid>
            <FieldGrid>
              <FieldRow>
                <Label htmlFor="linkedin_url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">LinkedIn URL</Label>
                <Input id="linkedin_url" value={formData.linkedin_url} onChange={(e) => handleChange('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." className="h-10 rounded-lg" />
              </FieldRow>
              <FieldRow>
                <Label htmlFor="github_url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">GitHub URL</Label>
                <Input id="github_url" value={formData.github_url} onChange={(e) => handleChange('github_url', e.target.value)} placeholder="https://github.com/..." className="h-10 rounded-lg" />
              </FieldRow>
            </FieldGrid>
          </div>
        </Section>

        {/* Save */}
        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending} className="btn-gradient h-10 rounded-lg px-6 text-sm font-semibold">
            {updateProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
