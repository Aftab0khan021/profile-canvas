import { forwardRef } from 'react';
import { Mail, Phone, Linkedin, Github, MapPin, Calendar, ExternalLink } from 'lucide-react';
import type { Project, Experience, Skill, Education, Certification } from '@/hooks/usePortfolioData';

interface ResumePreviewProps {
  profile: {
    full_name: string | null;
    title: string | null;
    bio: string | null;
    email: string | null;
    phone: string | null;
    linkedin_url: string | null;
    github_url: string | null;
  };
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  brandColor?: string;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ profile, experience, education, skills, projects, certifications, brandColor = '#3b82f6' }, ref) => {
    // Group skills by category
    const skillsByCategory = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
      <div
        ref={ref}
        className="bg-white text-black w-[210mm] min-h-[297mm] mx-auto p-8 print:p-6"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Header */}
        <header className="border-b-2 pb-4 mb-6" style={{ borderColor: brandColor }}>
          <h1 className="text-3xl font-bold mb-1" style={{ color: brandColor }}>
            {profile.full_name || 'Your Name'}
          </h1>
          <p className="text-lg text-gray-600 mb-3">{profile.title || 'Professional Title'}</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {profile.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {profile.email}
              </span>
            )}
            {profile.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {profile.phone}
              </span>
            )}
            {profile.linkedin_url && (
              <span className="flex items-center gap-1">
                <Linkedin className="h-3 w-3" /> LinkedIn
              </span>
            )}
            {profile.github_url && (
              <span className="flex items-center gap-1">
                <Github className="h-3 w-3" /> GitHub
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-2 space-y-5">
            {/* Summary */}
            {profile.bio && (
              <section>
                <h2 className="text-lg font-semibold mb-2 uppercase tracking-wide" style={{ color: brandColor }}>
                  Professional Summary
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
              </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: brandColor }}>
                  Experience
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{exp.role}</h3>
                          <p className="text-gray-600 text-sm">{exp.company}{exp.location && ` • ${exp.location}`}</p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : ''}
                        </span>
                      </div>
                      {exp.description && (
                        <ul className="mt-1 text-sm text-gray-700 list-disc list-inside">
                          {exp.description.split('\n').filter(Boolean).map((line, i) => (
                            <li key={i}>{line.replace(/^[-•]\s*/, '')}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: brandColor }}>
                  Featured Projects
                </h2>
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id}>
                      <h3 className="font-semibold text-sm">{project.title}</h3>
                      {project.description && (
                        <p className="text-xs text-gray-600 mt-0.5">{project.description}</p>
                      )}
                      {(project.tech_stack || []).length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tech: {(project.tech_stack || []).join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-5">
            {/* Skills */}
            {skills.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: brandColor }}>
                  Skills
                </h2>
                <div className="space-y-3">
                  {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                    <div key={category}>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">{category}</h3>
                      <div className="flex flex-wrap gap-1">
                        {categorySkills.map((skill) => (
                          <span
                            key={skill.id}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                          >
                            {skill.skill_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: brandColor }}>
                  Education
                </h2>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-semibold text-sm">{edu.degree}</h3>
                      <p className="text-xs text-gray-600">{edu.field_of_study}</p>
                      <p className="text-xs text-gray-500">{edu.institution}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(edu.start_date).getFullYear()} - {edu.is_current ? 'Present' : edu.end_date ? new Date(edu.end_date).getFullYear() : ''}
                      </p>
                      {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: brandColor }}>
                  Certifications
                </h2>
                <div className="space-y-2">
                  {certifications.map((cert) => (
                    <div key={cert.id}>
                      <h3 className="font-semibold text-sm">{cert.title}</h3>
                      <p className="text-xs text-gray-500">{cert.issuer} • {new Date(cert.issue_date).getFullYear()}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
