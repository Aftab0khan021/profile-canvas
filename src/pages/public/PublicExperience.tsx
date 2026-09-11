import { useMemo } from 'react';
import { format } from 'date-fns';
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

  // ─── MODERN TEMPLATE (default) — IMMERSIVE ───
  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ color: brandColor }}>
              CAREER
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight gradient-title" style={{ '--gradient-color': brandColor } as React.CSSProperties}>
              Professional Experience
            </h1>
            <p className="text-base max-w-2xl leading-relaxed" style={{ color: '#6b7280' }}>
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          {sortedExperience.length === 0 ? (
            <p className="text-center font-mono text-sm py-16" style={{ color: '#6b7280' }}>No experience added yet.</p>
          ) : (
            <div className="relative">
              {/* Animated vertical connector line */}
              <motion.div
                className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px"
                style={{ backgroundColor: `${brandColor}25`, transformOrigin: 'top' }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />

              {sortedExperience.map((exp, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <motion.div
                    key={exp.id}
                    className={`relative flex items-start mb-12 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                    initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    {/* Timeline node with sonar ping */}
                    <div className="absolute left-[15px] md:left-1/2 md:-translate-x-1/2 z-10">
                      <div
                        className="w-[10px] h-[10px] rounded-full relative"
                        style={{ backgroundColor: brandColor, boxShadow: `0 0 12px ${brandColor}60` }}
                      >
                        <div className="pulse-dot absolute inset-0" style={{ background: brandColor }} />
                      </div>
                    </div>

                    {/* Card */}
                    <div className={`ml-10 md:ml-0 ${isLeft ? 'md:pr-12 md:w-1/2' : 'md:pl-12 md:w-1/2'}`}>
                      <div
                        className="rounded-xl p-6 transition-all duration-500 hover:scale-[1.01]"
                        style={{
                          backgroundColor: '#0e0e0e',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {/* Date */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-mono font-semibold" style={{ color: brandColor }}>
                            {exp.start_date && format(new Date(exp.start_date), 'MMM yyyy')}
                            {' → '}
                            {exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'Present'}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-base mb-1" style={{ color: '#f0ede6' }}>{exp.position}</h3>
                        <p className="text-sm font-semibold mb-3" style={{ color: brandColor }}>{exp.company}</p>

                        {exp.description && (
                          <p className="text-xs leading-relaxed mb-3" style={{ color: '#6b7280' }}>{exp.description}</p>
                        )}

                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {exp.technologies.map(t => (
                              <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono"
                                style={{ backgroundColor: `${brandColor}10`, color: `${brandColor}cc`, border: `1px solid ${brandColor}20` }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
