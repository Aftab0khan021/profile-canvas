import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useProfile } from '@/hooks/useProfile';
import { useProjects, useExperience, useSkills, useEducation, useCertifications } from '@/hooks/usePortfolioData';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Eye, Briefcase, Lightbulb, FolderOpen } from 'lucide-react';
import { PageShell, Section, PageLoader } from '@/components/PageShell';

export default function ResumePage() {
  const componentRef = useRef<HTMLDivElement>(null);
  const { profile, isLoading: profileLoading } = useProfile();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { experience, isLoading: experienceLoading } = useExperience();
  const { skills, isLoading: skillsLoading } = useSkills();
  const { education, isLoading: educationLoading } = useEducation();
  const { certifications, isLoading: certificationsLoading } = useCertifications();

  const isLoading = profileLoading || projectsLoading || experienceLoading || skillsLoading || educationLoading || certificationsLoading;

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${profile?.full_name || 'Resume'} - Resume`,
  });

  if (isLoading) return <PageLoader />;

  const resumeProfile = {
    full_name: profile?.full_name || null,
    title: profile?.title || null,
    bio: profile?.bio || null,
    email: profile?.email || null,
    phone: profile?.phone || null,
    linkedin_url: profile?.linkedin_url || null,
    github_url: profile?.github_url || null,
  };

  const stats = [
    { label: 'Experience', value: experience.length, sub: 'positions', icon: Briefcase },
    { label: 'Skills', value: skills.length, sub: 'skills', icon: Lightbulb },
    { label: 'Projects', value: projects.length, sub: 'projects', icon: FolderOpen },
  ];

  return (
    <PageShell
      title="Resume Builder"
      description="Generate a professional PDF resume from your portfolio data."
      maxWidth="full"
      action={
        <Button onClick={() => handlePrint()} className="btn-gradient h-9 rounded-lg px-4 text-sm font-semibold">
          <Download className="h-4 w-4 mr-1.5" />Download PDF
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
              <s.icon className="h-4.5 w-4.5 text-violet-500" />
            </div>
            <div>
              <div className="font-display text-xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground font-mono">{s.sub} listed</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <Section title="Tips for a great resume" description="Maximize your resume's impact.">
        <ul className="grid sm:grid-cols-2 gap-2">
          {[
            'Keep your bio concise (2-3 sentences max)',
            'Use bullet points in experience descriptions',
            'List your most relevant skills first',
            'Feature your best 3 projects',
          ].map(tip => (
            <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0 mt-2" />
              {tip}
            </li>
          ))}
        </ul>
      </Section>

      {/* Preview */}
      <Section
        title="Resume Preview"
        description="This is how your resume will look when downloaded."
        action={
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Eye className="h-3 w-3" />Live preview
          </span>
        }
        noPad
      >
        <div className="overflow-auto bg-muted/40 p-4 print:p-0 print:bg-white rounded-b-xl">
          <div className="shadow-lg print:shadow-none">
            <ResumePreview
              ref={componentRef}
              profile={resumeProfile}
              experience={experience}
              education={education}
              skills={skills}
              projects={projects}
              certifications={certifications}
              brandColor={profile?.brand_color || '#6B21E8'}
            />
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
