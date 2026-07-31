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
  const { profile, brandColor, template } = usePublicLayoutContext();
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

  // ─── MINIMAL TEMPLATE ───
  if (template === 'minimal') {
    return (
      <>
        <section className="py-20 px-4 text-center border-b">
          <div className="container mx-auto max-w-2xl">
            <h1 className="text-4xl font-bold mb-3">Experience</h1>
            <p className="text-muted-foreground">{heroSubtitle}</p>
          </div>
        </section>
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl space-y-10">
            {sortedExperience.length === 0 && <p className="text-center text-muted-foreground">No experience added yet.</p>}
            {sortedExperience.map((exp) => (
              <div key={exp.id} className="border-b pb-8 last:border-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h2 className="text-lg font-semibold">{exp.role}</h2>
                  <span className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                    {format(new Date(exp.start_date), 'MMM yyyy')} – {exp.is_current ? 'Present' : exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'Present'}
                  </span>
                </div>
                <p className="text-sm" style={{ color: brandColor }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                {exp.description && <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  // ─── PROFESSIONAL TEMPLATE ───
  if (template === 'professional') {
    return (
      <>
        <section className="py-10 px-4 border-b bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold mb-1">Professional Experience</h1>
            <p className="text-muted-foreground text-sm">{heroSubtitle}</p>
          </div>
        </section>
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-5xl space-y-4">
            {sortedExperience.length === 0 && <p className="text-center text-muted-foreground py-12">No experience added yet.</p>}
            {sortedExperience.map((exp) => (
              <div key={exp.id} className="border rounded-lg p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      {exp.is_current && <Badge className="text-xs text-green-700 bg-green-100 border-green-200">Current</Badge>}
                      <span className="font-bold text-lg">{exp.role}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: brandColor }}>
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="font-medium">{exp.company}</span>
                      {exp.location && <><MapPin className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">{exp.location}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(exp.start_date), 'MMM yyyy')} – {exp.is_current ? 'Present' : exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'Present'}
                  </div>
                </div>
                {exp.description && <p className="text-sm text-muted-foreground">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  // ─── MODERN TEMPLATE (default) ───
  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-3">Career</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">Professional Experience</h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
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
                        <div className="bento-card hover:-translate-y-1 transition-transform duration-300">
                          <div className="mb-3">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: brandColor }}>Full-time</span>
                              {exp.is_current && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-600 bg-emerald-500/10">Current</span>
                              )}
                            </div>
                            <h3 className="font-display font-bold text-xl mb-1">{exp.role}</h3>
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
                                    {format(new Date(exp.start_date), 'MMM yyyy')} -{' '}
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
                          </div>
                          <div className="space-y-4">
                            {exp.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                            )}
                            <div>
                              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Achievements</h4>
                              <ul className="space-y-1.5">
                                {achievements.map((achievement, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: brandColor }} />
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills Used</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {skillsUsed.map((skill) => (
                                  <span key={skill} className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-muted text-muted-foreground">{skill}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
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
