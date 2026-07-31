import { useMemo, useState, useEffect } from 'react';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { usePublicPageContent, usePublicProfileItems } from '@/hooks/useProfileItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { DynamicIcon } from '@/components/IconPicker';
import { 
  Code, 
  Brain,
  Zap,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';

// Category color mapping
const categoryColors: Record<string, { from: string; to: string }> = {
  'Frontend': { from: '#3b82f6', to: '#8b5cf6' },
  'Backend': { from: '#10b981', to: '#3b82f6' },
  'Database': { from: '#f97316', to: '#ef4444' },
  'DevOps': { from: '#8b5cf6', to: '#ec4899' },
  'Mobile': { from: '#06b6d4', to: '#3b82f6' },
  'Tools': { from: '#6b7280', to: '#374151' },
  'Languages': { from: '#eab308', to: '#f97316' },
  'Cloud': { from: '#0ea5e9', to: '#6366f1' },
};

// Default soft skills
const defaultSoftSkills = [
  { name: 'Leadership', icon: 'Users', description: 'Guiding teams to success' },
  { name: 'Communication', icon: 'MessageSquare', description: 'Clear and effective dialogue' },
  { name: 'Problem Solving', icon: 'Lightbulb', description: 'Creative solutions to challenges' },
  { name: 'Teamwork', icon: 'Heart', description: 'Collaborative mindset' },
  { name: 'Adaptability', icon: 'Zap', description: 'Thriving in change' },
  { name: 'Time Management', icon: 'Clock', description: 'Efficient prioritization' },
];

export default function PublicSkills() {
  const { profile, brandColor, template } = usePublicLayoutContext();
  const { skills, experience } = usePublicPortfolioData(profile?.id);
  const { getContent } = usePublicPageContent(profile?.id);
  const { items: profileItems } = usePublicProfileItems(profile?.id);
  const [animatedProgress, setAnimatedProgress] = useState<Record<string, number>>({});

  // Get dynamic content
  const heroSubtitle = getContent(
    'skills', 
    'hero_subtitle', 
    'A comprehensive overview of my technical expertise and professional competencies.'
  );

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, typeof skills> = {};
    skills.forEach((skill) => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    return grouped;
  }, [skills]);

  // Animate progress bars on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const progressMap: Record<string, number> = {};
      skills.forEach((skill) => {
        progressMap[skill.id] = skill.proficiency_level || 80;
      });
      setAnimatedProgress(progressMap);
    }, 300);
    return () => clearTimeout(timer);
  }, [skills]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalTechnical = skills.length;
    const totalCategories = Object.keys(skillsByCategory).length;
    const yearsOfExperience = experience.length > 0 
      ? Math.ceil((Date.now() - new Date(experience[experience.length - 1]?.start_date || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 365))
      : 0;
    
    return {
      totalTechnical,
      totalSoftSkills: defaultSoftSkills.length,
      yearsExperience: yearsOfExperience,
    };
  }, [skills, skillsByCategory, experience]);

  // Additional competencies (from tech stack)
  const additionalCompetencies = useMemo(() => {
    return ['Git', 'CI/CD', 'Agile', 'REST APIs', 'GraphQL', 'Testing', 'Documentation', 'Code Review'];
  }, []);

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || { from: brandColor, to: `${brandColor}80` };
  };

  // ───── MINIMAL TEMPLATE ─────
  if (template === 'minimal') {
    return (
      <>
        <section className="py-20 px-4 text-center border-b">
          <div className="container mx-auto max-w-2xl">
            <h1 className="text-4xl font-bold mb-3">Skills</h1>
            <p className="text-muted-foreground">{heroSubtitle}</p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl space-y-10">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category}>
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{category}</h2>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm">
                      <span>{skill.skill_name}</span>
                      <span className="text-xs text-muted-foreground">{skill.proficiency_level}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(skillsByCategory).length === 0 && (
              <p className="text-center text-muted-foreground py-12">No skills added yet.</p>
            )}
          </div>
        </section>
      </>
    );
  }

  // ───── PROFESSIONAL TEMPLATE ─────
  if (template === 'professional') {
    return (
      <>
        <section className="py-10 px-4 border-b bg-muted/20">
          <div className="container mx-auto max-w-5xl flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Technical Skills</h1>
              <p className="text-muted-foreground text-sm">{heroSubtitle}</p>
            </div>
            <div className="hidden md:flex gap-6 text-center">
              <div><p className="text-2xl font-bold" style={{ color: brandColor }}>{stats.totalTechnical}+</p><p className="text-xs text-muted-foreground">Skills</p></div>
              <div><p className="text-2xl font-bold" style={{ color: brandColor }}>{Object.keys(skillsByCategory).length}</p><p className="text-xs text-muted-foreground">Categories</p></div>
              <div><p className="text-2xl font-bold" style={{ color: brandColor }}>{stats.yearsExperience}+</p><p className="text-xs text-muted-foreground">Years Exp.</p></div>
            </div>
          </div>
        </section>

        <section className="py-10 px-4">
          <div className="container mx-auto max-w-5xl">
            {Object.keys(skillsByCategory).length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No skills added yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category} className="border rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
                      <Code className="h-4 w-4" style={{ color: brandColor }} />
                      <span className="font-semibold text-sm">{category}</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {categorySkills.map((skill) => (
                        <div key={skill.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{skill.skill_name}</span>
                            <span className="text-muted-foreground">{animatedProgress[skill.id] || 0}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${animatedProgress[skill.id] || 0}%`, backgroundColor: brandColor }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-8 px-4 border-t">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Additional Competencies</h2>
            <div className="flex flex-wrap gap-2">
              {additionalCompetencies.map((comp) => (
                <span key={comp} className="px-3 py-1 border rounded text-sm">{comp}</span>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  // ───── MODERN TEMPLATE (default) ─────

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-3">Competencies</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">Technical Skills</h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Technical Expertise */}
      <section className="pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-8">
            <Code className="h-5 w-5" style={{ color: brandColor }} />
            <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-muted-foreground">Technical Expertise</h2>
          </div>

          {Object.keys(skillsByCategory).length === 0 ? (
            <div className="bento-card text-center py-12">
              <Zap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No Skills Added Yet</h3>
              <p className="text-muted-foreground">Check back later for technical skills.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(skillsByCategory).map(([category, categorySkills], catIndex) => {
                const colors = getCategoryColor(category);

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                  >
                    <div className="bento-card h-full overflow-hidden p-0">
                      <div
                        className="px-5 py-3 flex items-center gap-2"
                        style={{ background: `linear-gradient(135deg, ${colors.from}18, ${colors.to}0c)` }}
                      >
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.from }} />
                        <span className="font-semibold text-sm">{category}</span>
                      </div>
                      <div className="p-5 space-y-3">
                        {categorySkills.map((skill, index) => (
                          <motion.div
                            key={skill.id}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{skill.skill_name}</span>
                              <span className="text-xs text-muted-foreground">{animatedProgress[skill.id] || 0}%</span>
                            </div>
                            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{ background: `linear-gradient(90deg, ${colors.from}, ${colors.to})` }}
                                initial={{ width: '0%' }}
                                animate={{ width: `${animatedProgress[skill.id] || 0}%` }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Soft Skills */}
      <section className="pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-8">
            <Brain className="h-5 w-5" style={{ color: brandColor }} />
            <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-muted-foreground">Soft Skills</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {defaultSoftSkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="bento-card h-full text-center hover:-translate-y-1 transition-transform duration-300">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${brandColor}18` }}
                  >
                    <DynamicIcon name={skill.icon} className="h-6 w-6" style={{ color: brandColor }} />
                  </div>
                  <h3 className="font-semibold text-sm mb-0.5">{skill.name}</h3>
                  <p className="text-xs text-muted-foreground leading-snug">{skill.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Competencies */}
      <section className="pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-8 flex items-center gap-2"
          >
            <Zap className="h-6 w-6" style={{ color: brandColor }} />
            Additional Competencies
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-3"
          >
            {additionalCompetencies.map((comp, index) => (
              <motion.div
                key={comp}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Badge 
                  variant="outline" 
                  className="text-sm py-2 px-4 hover:bg-muted transition-colors"
                >
                  {comp}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Code, label: 'Technical Skills', value: `${stats.totalTechnical}+` },
              { icon: Brain, label: 'Soft Skills', value: `${stats.totalSoftSkills}+` },
              { icon: Clock, label: 'Years Experience', value: `${stats.yearsExperience}+` },
            ].map(({ icon: Icon, label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="bento-card text-center">
                  <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${brandColor}18` }}
                  >
                    <Icon className="h-7 w-7" style={{ color: brandColor }} />
                  </div>
                  <p className="font-display text-4xl font-bold mb-1" style={{ color: brandColor }}>{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
