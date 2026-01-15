import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Calendar, MapPin, ExternalLink, Lightbulb, Target, Users, Zap } from 'lucide-react';

const values = [
  { icon: Lightbulb, title: 'Continuous Learning', description: 'Always exploring new technologies and methodologies to stay at the cutting edge.' },
  { icon: Target, title: 'Quality First', description: 'Delivering clean, maintainable, and well-tested code that stands the test of time.' },
  { icon: Users, title: 'Collaboration', description: 'Working effectively with teams to achieve shared goals and deliver exceptional results.' },
  { icon: Zap, title: 'Innovation', description: 'Finding creative solutions to complex problems and pushing boundaries.' },
];

export default function PublicAbout() {
  const { profile, brandColor } = usePublicLayoutContext();
  const { education, certifications } = usePublicPortfolioData(profile?.id);

  return (
    <>
      {/* Hero Section */}
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
    </>
  );
}
