import { useMemo } from 'react';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Award, Calendar, MapPin, ExternalLink, 
  Lightbulb, Target, Users, Zap, Briefcase, Code, Brain, Sparkles 
} from 'lucide-react';

const values = [
  { icon: Lightbulb, title: 'Continuous Learning', description: 'Always exploring new technologies and methodologies to stay at the cutting edge.' },
  { icon: Target, title: 'Quality First', description: 'Delivering clean, maintainable, and well-tested code that stands the test of time.' },
  { icon: Users, title: 'Collaboration', description: 'Working effectively with teams to achieve shared goals and deliver exceptional results.' },
  { icon: Zap, title: 'Innovation', description: 'Finding creative solutions to complex problems and pushing boundaries.' },
];

export default function PublicAbout() {
  const { profile, brandColor } = usePublicLayoutContext();
  const { education, certifications, experience, skills } = usePublicPortfolioData(profile?.id);

  // Separate technical and soft skills
  const { technicalSkills, softSkills } = useMemo(() => {
    const softSkillCategories = ['soft skills', 'soft skill', 'interpersonal', 'communication', 'leadership'];
    const technical: Record<string, typeof skills> = {};
    const soft: typeof skills = [];

    skills.forEach((skill) => {
      const categoryLower = skill.category.toLowerCase();
      if (softSkillCategories.some((sc) => categoryLower.includes(sc))) {
        soft.push(skill);
      } else {
        if (!technical[skill.category]) technical[skill.category] = [];
        technical[skill.category].push(skill);
      }
    });

    return { technicalSkills: technical, softSkills: soft };
  }, [skills]);

  return (
    <>
      {/* Hero Section - Bio */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8 items-center"
          >
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || ''}
                className="w-48 h-48 rounded-2xl object-cover shadow-xl flex-shrink-0"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold mb-4">About Me</h1>
              <p className="text-xl mb-2" style={{ color: brandColor }}>
                {profile?.title || 'Creative Professional'}
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {profile?.bio || 'No bio available.'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 border-t">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">What I Stand For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div
                      className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${brandColor}15` }}
                    >
                      <value.icon className="h-7 w-7" style={{ color: brandColor }} />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      {experience.length > 0 && (
        <section className="py-16 px-4 border-t">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Experience</h2>
            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-6 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: `${brandColor}30` }}
              />

              <div className="space-y-8">
                {experience.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative pl-16"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-4 w-5 h-5 rounded-full border-4 bg-background"
                      style={{ borderColor: brandColor }}
                    />

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Briefcase className="h-5 w-5" style={{ color: brandColor }} />
                              <h3 className="font-semibold text-lg">{exp.role}</h3>
                            </div>
                            <p style={{ color: brandColor }} className="font-medium">
                              {exp.company}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(exp.start_date).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })}{' '}
                              -{' '}
                              {exp.is_current
                                ? 'Present'
                                : exp.end_date
                                ? new Date(exp.end_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : ''}
                            </div>
                            {exp.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {exp.location}
                              </div>
                            )}
                          </div>
                        </div>
                        {exp.description && (
                          <div className="text-muted-foreground text-sm whitespace-pre-line">
                            {exp.description}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Education Timeline */}
      {education.length > 0 && (
        <section className="py-16 px-4 border-t">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Education</h2>
            <div className="space-y-6">
              {education.map((edu, index) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: brandColor }}
                    />
                    <CardContent className="pt-6 pl-8">
                      <div className="flex items-start gap-4">
                        <div
                          className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${brandColor}15` }}
                        >
                          <GraduationCap className="h-6 w-6" style={{ color: brandColor }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {edu.degree} in {edu.field_of_study}
                              </h3>
                              <p style={{ color: brandColor }}>{edu.institution}</p>
                            </div>
                            <div className="text-sm text-muted-foreground text-right">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(edu.start_date).getFullYear()} -{' '}
                                {edu.is_current
                                  ? 'Present'
                                  : edu.end_date
                                  ? new Date(edu.end_date).getFullYear()
                                  : ''}
                              </div>
                              {edu.location && (
                                <div className="flex items-center gap-1 justify-end mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {edu.location}
                                </div>
                              )}
                            </div>
                          </div>
                          {edu.gpa && (
                            <p className="text-sm font-medium mb-2">GPA: {edu.gpa}</p>
                          )}
                          {edu.description && (
                            <p className="text-muted-foreground text-sm">{edu.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications Grid */}
      {certifications.length > 0 && (
        <section className="py-16 px-4 border-t">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Certifications</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${brandColor}15` }}
                      >
                        <Award className="h-6 w-6" style={{ color: brandColor }} />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{cert.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{cert.issuer}</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {new Date(cert.issue_date).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      {(cert.skills_learned || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(cert.skills_learned || []).slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {cert.credential_url && (
                        <Button size="sm" variant="outline" className="w-full" asChild>
                          <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Verify Credential
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Technical Skills with Progress Bars */}
      {Object.keys(technicalSkills).length > 0 && (
        <section className="py-16 px-4 border-t">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <Code className="h-8 w-8" style={{ color: brandColor }} />
              Technical Skills
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(technicalSkills).map(([category, categorySkills], catIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5" style={{ color: brandColor }} />
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categorySkills.map((skill, skillIndex) => (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: catIndex * 0.1 + skillIndex * 0.05 }}
                        >
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{skill.skill_name}</span>
                            <span className="text-muted-foreground">{skill.proficiency_level}%</span>
                          </div>
                          <Progress
                            value={skill.proficiency_level}
                            className="h-2"
                          />
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Soft Skills Grid */}
      {softSkills.length > 0 && (
        <section className="py-16 px-4 border-t">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <Brain className="h-8 w-8" style={{ color: brandColor }} />
              Soft Skills
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {softSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className="text-center hover:shadow-md transition-shadow h-full">
                    <CardContent className="pt-6 pb-6">
                      <div
                        className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: `${brandColor}15` }}
                      >
                        <Brain className="h-7 w-7" style={{ color: brandColor }} />
                      </div>
                      <p className="font-medium">{skill.skill_name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
