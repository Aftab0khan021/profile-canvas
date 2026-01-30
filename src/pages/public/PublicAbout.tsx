import { useMemo, useState, useEffect } from 'react';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { usePublicProfileItems, usePublicPageContent } from '@/hooks/useProfileItems';
import { DynamicIcon } from '@/components/IconPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  GraduationCap, Award, Calendar, MapPin, ExternalLink, Phone, Mail, Download,
  Lightbulb, Target, Users, Zap, Briefcase, Code, Brain, Sparkles, Heart,
  CheckCircle2
} from 'lucide-react';
import { getOptimizedImageUrl, IMAGE_PRESETS } from '@/lib/imageOptimization';

// Default values if user hasn't created any
const defaultHighlights = [
  { icon: Target, title: 'Problem Solver', description: 'I thrive on breaking down complex challenges into elegant, efficient solutions.', color: '#3b82f6' },
  { icon: Users, title: 'Team Collaborator', description: 'I believe the best results come from diverse perspectives working together.', color: '#10b981' },
  { icon: Lightbulb, title: 'Continuous Learner', description: 'Technology evolves fast, and I make it a priority to stay ahead of the curve.', color: '#f59e0b' },
  { icon: Heart, title: 'User-Centric', description: 'Every line of code I write is focused on creating great user experiences.', color: '#ef4444' },
];

const defaultValues = [
  { icon: Sparkles, title: 'Quality First', description: 'Never compromising on code quality and best practices.' },
  { icon: Zap, title: 'Continuous Learning', description: 'Always exploring new technologies and methodologies.' },
  { icon: Users, title: 'Collaboration', description: 'Working effectively with diverse teams and stakeholders.' },
  { icon: Target, title: 'Results Driven', description: 'Focused on delivering measurable impact and value.' },
];

interface AnimatedProgressProps {
  value: number;
  brandColor: string;
}

function AnimatedProgress({ value, brandColor }: AnimatedProgressProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%`, backgroundColor: brandColor }}
      />
    </div>
  );
}

export default function PublicAbout() {
  const { profile, brandColor } = usePublicLayoutContext();
  const { education, certifications, experience, skills } = usePublicPortfolioData(profile?.id);
  const { highlights: dynamicHighlights, values: dynamicValues } = usePublicProfileItems(profile?.id);
  const { getContent } = usePublicPageContent(profile?.id);

  // Get dynamic content
  const pageSubtitle = getContent('about', 'page_subtitle', '');

  // Use dynamic highlights/values if available, otherwise use defaults
  const highlights = dynamicHighlights.length > 0 ? dynamicHighlights : null;
  const values = dynamicValues.length > 0 ? dynamicValues : null;

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

  // Get top 6 skills for the overview section
  const topSkills = skills.slice(0, 6);

  return (
    <>
      {/* Hero Section - Bio */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row gap-12 items-start"
          >
            {/* Left: Image */}
            {profile?.avatar_url && (
              <div className="flex-shrink-0">
                <img
                  src={getOptimizedImageUrl(profile.avatar_url, IMAGE_PRESETS.avatar)}
                  alt={profile.full_name || ''}
                  loading="lazy"
                  className="w-64 h-64 rounded-2xl object-cover shadow-xl"
                  style={{ boxShadow: `0 20px 40px -10px ${brandColor}30` }}
                />
              </div>
            )}

            {/* Right: Content */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About Me</h1>
              <p className="text-xl mb-2" style={{ color: brandColor }}>
                {profile?.title || 'Creative Professional'}
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {profile?.bio || 'No bio available.'}
              </p>
              {pageSubtitle && (
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {pageSubtitle}
                </p>
              )}

              {/* Quick Contact */}
              <div className="flex flex-wrap gap-4 mb-6">
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="h-4 w-4" style={{ color: brandColor }} />
                    <span className="text-sm">{profile.phone}</span>
                  </a>
                )}
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="h-4 w-4" style={{ color: brandColor }} />
                    <span className="text-sm">{profile.email}</span>
                  </a>
                )}
              </div>

              {profile?.resume_url && (
                <Button style={{ backgroundColor: brandColor }} className="text-white gap-2" asChild>
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" /> Download Resume
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Defines Me - 4 Column Grid (Dynamic or Default) */}
      <section className="py-16 px-4 border-t">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">What Defines Me</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights ? (
              // Dynamic highlights from database
              highlights.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="text-center h-full transition-shadow hover:shadow-xl">
                    <CardContent className="pt-8 pb-6">
                      <div
                        className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                        style={{ background: `linear-gradient(135deg, ${brandColor}30, ${brandColor}10)` }}
                      >
                        <DynamicIcon
                          name={item.icon_name}
                          className="h-8 w-8"
                          fallback={<Sparkles className="h-8 w-8" style={{ color: brandColor }} />}
                        />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              // Default highlights
              defaultHighlights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="text-center h-full transition-shadow hover:shadow-xl">
                    <CardContent className="pt-8 pb-6">
                      <div
                        className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                        style={{ background: `linear-gradient(135deg, ${item.color}30, ${item.color}10)` }}
                      >
                        <item.icon className="h-8 w-8" style={{ color: item.color }} />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Skills Overview - Top 6 with Progress Bars */}
      {topSkills.length > 0 && (
        <section className="py-16 px-4 border-t">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Skills Overview</h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              {topSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{skill.skill_name}</span>
                    <span className="text-muted-foreground">{skill.proficiency_level}%</span>
                  </div>
                  <AnimatedProgress value={skill.proficiency_level || 0} brandColor={brandColor} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education & Certifications Split */}
      {(education.length > 0 || certifications.length > 0) && (
        <section className="py-16 px-4 border-t">
          <div className="container mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Education */}
              {education.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <GraduationCap className="h-7 w-7" style={{ color: brandColor }} />
                    Education
                  </h2>
                  <div className="space-y-6">
                    {education.map((edu, index) => (
                      <motion.div
                        key={edu.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <Card className="transition-shadow hover:shadow-lg">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <div>
                                <h3 className="font-bold text-lg">{edu.degree}</h3>
                                <p className="text-muted-foreground">{edu.field_of_study}</p>
                              </div>
                              {edu.gpa && (
                                <Badge style={{ backgroundColor: brandColor }} className="text-white">
                                  GPA: {edu.gpa}
                                </Badge>
                              )}
                            </div>
                            <p style={{ color: brandColor }} className="font-medium mb-2">{edu.institution}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(edu.start_date).getFullYear()} - {edu.is_current ? 'Present' : edu.end_date ? new Date(edu.end_date).getFullYear() : ''}
                              </span>
                              {edu.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {edu.location}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {certifications.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <Award className="h-7 w-7" style={{ color: brandColor }} />
                    Certifications
                  </h2>
                  <div className="space-y-4">
                    {certifications.map((cert, index) => (
                      <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ x: -5 }}
                      >
                        <Card className="transition-shadow hover:shadow-lg">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div
                                className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${brandColor}15` }}
                              >
                                <Award className="h-6 w-6" style={{ color: brandColor }} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold">{cert.title}</h3>
                                <p className="text-muted-foreground text-sm">{cert.issuer}</p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </Badge>
                                {cert.credential_url && (
                                  <Button size="sm" variant="link" className="mt-2 p-0 h-auto" asChild>
                                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Verify
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Experience Timeline */}
      {experience.length > 0 && (
        <section className="py-16 px-4 border-t">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <Briefcase className="h-8 w-8" style={{ color: brandColor }} />
              Professional Experience
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-border to-transparent"
              />

              <div className="space-y-8">
                {experience.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="relative pl-16"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-4 w-5 h-5 rounded-full border-4 bg-background"
                      style={{ borderColor: brandColor }}
                    />

                    <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{exp.role}</h3>
                              {exp.is_current && (
                                <Badge style={{ backgroundColor: brandColor }} className="text-white text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p style={{ color: brandColor }} className="font-semibold">
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
                            {exp.description.split('\n').map((line, i) => (
                              line.startsWith('-') || line.startsWith('•') ? (
                                <div key={i} className="flex items-start gap-2 mb-1">
                                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: brandColor }} />
                                  <span>{line.replace(/^[-•]\s*/, '')}</span>
                                </div>
                              ) : (
                                <p key={i} className="mb-2">{line}</p>
                              )
                            ))}
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

      {/* Technical Skills with Progress Bars */}
      {Object.keys(technicalSkills).length > 0 && (
        <section className="py-16 px-4 border-t">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <Code className="h-8 w-8" style={{ color: brandColor }} />
              Technical Expertise
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(technicalSkills).map(([category, categorySkills], catIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5" style={{ color: brandColor }} />
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categorySkills.map((skill) => (
                        <div key={skill.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{skill.skill_name}</span>
                            <span className="text-muted-foreground">{skill.proficiency_level}%</span>
                          </div>
                          <AnimatedProgress value={skill.proficiency_level || 0} brandColor={brandColor} />
                        </div>
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
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="text-center h-full">
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

      {/* My Values (Dynamic or Default) */}
      <section className="py-16 px-4 border-t">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">My Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values ? (
              // Dynamic values from database
              values.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card
                    className="h-full transition-all hover:shadow-lg"
                    style={{ borderLeft: `4px solid ${brandColor}` }}
                  >
                    <CardContent className="pt-6 flex items-start gap-4">
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${brandColor}15` }}
                      >
                        <DynamicIcon
                          name={item.icon_name}
                          className="h-6 w-6"
                          fallback={<Heart className="h-6 w-6" style={{ color: brandColor }} />}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              // Default values
              defaultValues.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card
                    className="h-full transition-all hover:shadow-lg"
                    style={{ borderLeft: `4px solid ${brandColor}` }}
                  >
                    <CardContent className="pt-6 flex items-start gap-4">
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${brandColor}15` }}
                      >
                        <item.icon className="h-6 w-6" style={{ color: brandColor }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
