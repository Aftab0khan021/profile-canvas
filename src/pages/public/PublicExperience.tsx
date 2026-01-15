import { useMemo } from 'react';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { usePublicPageContent } from '@/hooks/useProfileItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  Calendar,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';

export default function PublicExperience() {
  const { profile, brandColor } = usePublicLayoutContext();
  const { experience } = usePublicPortfolioData(profile?.id);
  const { getContent } = usePublicPageContent(profile?.id);

  // Get dynamic content
  const heroSubtitle = getContent(
    'experience', 
    'hero_subtitle', 
    'My professional journey, roles, and the impact I\'ve made along the way.'
  );

  // Sort experience by start date (most recent first)
  const sortedExperience = useMemo(() => {
    return [...experience].sort((a, b) => 
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );
  }, [experience]);

  // Demo achievements - in production, these would be stored in database
  const getAchievements = (exp: typeof experience[0]) => {
    return [
      'Led cross-functional team initiatives',
      'Improved system performance by 40%',
      'Mentored junior team members',
    ];
  };

  // Demo skills used - in production, these would be stored in database
  const getSkillsUsed = (exp: typeof experience[0]) => {
    return ['Leadership', 'Problem Solving', 'Agile', 'Communication'];
  };

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Professional Experience</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {sortedExperience.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Experience Added</h3>
              <p className="text-muted-foreground">
                Check back later for professional experience details.
              </p>
            </motion.div>
          ) : (
            <div className="relative">
              {/* Central Timeline Line */}
              <div 
                className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 hidden md:block"
                style={{ 
                  background: `linear-gradient(to bottom, ${brandColor}, ${brandColor}50, ${brandColor}20)` 
                }}
              />

              {/* Mobile Timeline Line */}
              <div 
                className="absolute left-6 top-0 bottom-0 w-0.5 md:hidden"
                style={{ 
                  background: `linear-gradient(to bottom, ${brandColor}, ${brandColor}50, ${brandColor}20)` 
                }}
              />

              {/* Timeline Items */}
              <div className="space-y-12">
                {sortedExperience.map((exp, index) => {
                  const achievements = getAchievements(exp);
                  const skillsUsed = getSkillsUsed(exp);
                  const isLeft = index % 2 === 0;

                  return (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      className="relative grid md:grid-cols-2 gap-8 md:gap-12"
                    >
                      {/* Timeline Dot */}
                      <div 
                        className="absolute left-6 md:left-1/2 top-0 w-4 h-4 rounded-full border-4 border-background -translate-x-1/2 z-10"
                        style={{ backgroundColor: brandColor }}
                      />

                      {/* Card Position based on index */}
                      <div className={`pl-12 md:pl-0 ${isLeft ? 'md:pr-12' : 'md:col-start-2 md:pl-12'}`}>
                        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <CardHeader className="pb-3">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge 
                                className="text-white"
                                style={{ backgroundColor: brandColor }}
                              >
                                Full-time
                              </Badge>
                              {exp.is_current && (
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl">{exp.role}</CardTitle>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2" style={{ color: brandColor }}>
                                <Building2 className="h-4 w-4" />
                                <span className="font-semibold">{exp.company}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                {exp.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{exp.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {format(new Date(exp.start_date), 'MMM yyyy')} - {' '}
                                    {exp.is_current 
                                      ? 'Present' 
                                      : exp.end_date 
                                        ? format(new Date(exp.end_date), 'MMM yyyy')
                                        : 'Present'
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Description */}
                            {exp.description && (
                              <p className="text-muted-foreground">
                                {exp.description}
                              </p>
                            )}

                            {/* Key Achievements */}
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">Key Achievements</h4>
                              <ul className="space-y-2">
                                {achievements.map((achievement, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 
                                      className="h-4 w-4 mt-0.5 flex-shrink-0" 
                                      style={{ color: brandColor }} 
                                    />
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Skills Used */}
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">Skills Used</h4>
                              <div className="flex flex-wrap gap-1">
                                {skillsUsed.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Empty column for alternating layout */}
                      {!isLeft && <div className="hidden md:block" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
