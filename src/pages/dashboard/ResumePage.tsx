import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useProfile } from '@/hooks/useProfile';
import { useProjects, useExperience, useSkills, useEducation, useCertifications } from '@/hooks/usePortfolioData';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Eye, RefreshCw } from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const resumeProfile = {
    full_name: profile?.full_name || null,
    title: profile?.title || null,
    bio: profile?.bio || null,
    email: profile?.email || null,
    phone: profile?.phone || null,
    linkedin_url: profile?.linkedin_url || null,
    github_url: profile?.github_url || null,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resume Builder</h1>
          <p className="text-muted-foreground">Generate a professional PDF resume from your portfolio data</p>
        </div>
        <Button onClick={() => handlePrint()} size="lg" className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experience.length}</div>
            <p className="text-xs text-muted-foreground">positions listed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skills.length}</div>
            <p className="text-xs text-muted-foreground">skills showcased</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">projects featured</p>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Resume Preview
          </CardTitle>
          <CardDescription>
            This is how your resume will look when downloaded. The data is pulled automatically from your profile, experience, education, skills, and projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-2">💡 <strong>Tips for a great resume:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Keep your bio concise (2-3 sentences max)</li>
            <li>Use bullet points in experience descriptions</li>
            <li>List your most relevant skills first</li>
            <li>Feature your best 3 projects</li>
          </ul>
        </CardContent>
      </Card>

      {/* Resume Preview */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-auto bg-gray-100 p-4 print:p-0 print:bg-white">
            <div className="shadow-lg print:shadow-none">
              <ResumePreview
                ref={componentRef}
                profile={resumeProfile}
                experience={experience}
                education={education}
                skills={skills}
                projects={projects}
                certifications={certifications}
                brandColor={profile?.brand_color || '#3b82f6'}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
