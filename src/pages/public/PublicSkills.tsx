import { useMemo, useState, useEffect } from 'react';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { usePublicPageContent, usePublicProfileItems } from '@/hooks/useProfileItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { ConstellationGraph } from '@/components/ConstellationGraph';
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
    const avgProficiency = skills.length > 0
      ? Math.round(skills.reduce((sum, s) => sum + (s.proficiency_level || 80), 0) / skills.length)
      : 0;

    return {
      totalTechnical,
      totalSkills: totalTechnical,
      totalCategories,
      totalSoftSkills: defaultSoftSkills.length,
      yearsExperience: yearsOfExperience,
      averageProficiency: avgProficiency,
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

  // ───── MODERN TEMPLATE (default) — IMMERSIVE ─────

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ color: brandColor }}>
              EXPERTISE
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight gradient-title" style={{ '--gradient-color': brandColor } as React.CSSProperties}>
              Technical Skills
            </h1>
            <p className="text-base max-w-2xl leading-relaxed" style={{ color: '#6b7280' }}>
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats row */}
      <section className="px-4 pb-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Skills', value: stats.totalSkills },
              { label: 'Categories', value: stats.totalCategories },
              { label: 'Avg Proficiency', value: `${stats.averageProficiency}%` },
              { label: 'Years Experience', value: `${stats.yearsExperience}+` },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="rounded-xl p-5 text-center"
                style={{ backgroundColor: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="text-2xl font-bold font-mono mb-1" style={{ color: brandColor }}>{stat.value}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#6b7280' }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Constellation Graph */}
      {skills.length > 0 && (
        <section className="px-4 pb-12">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-xl p-6"
              style={{ backgroundColor: 'rgba(14,14,14,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <ConstellationGraph skills={skills} brandColor={brandColor} filterCategory={activeCategory} />
            </motion.div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <button
                onClick={() => setActiveCategory(null)}
                className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-300"
                style={{
                  backgroundColor: !activeCategory ? brandColor : 'rgba(14,14,14,0.8)',
                  color: !activeCategory ? '#fff' : '#6b7280',
                  border: `1px solid ${!activeCategory ? brandColor : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: !activeCategory ? `0 0 12px -4px ${brandColor}` : 'none',
                }}
              >
                ALL
              </button>
              {Object.keys(skillsByCategory).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: activeCategory === cat ? brandColor : 'rgba(14,14,14,0.8)',
                    color: activeCategory === cat ? '#fff' : '#6b7280',
                    border: `1px solid ${activeCategory === cat ? brandColor : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: activeCategory === cat ? `0 0 12px -4px ${brandColor}` : 'none',
                  }}
                >
                  {cat} ({skillsByCategory[cat].length})
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills by category — detailed cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(skillsByCategory).map(([category, categorySkills], catIdx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: catIdx * 0.1 }}
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${brandColor}15` }}>
                  <span className="text-xs font-mono font-semibold uppercase tracking-widest" style={{ color: brandColor }}>{category}</span>
                  <span className="text-[10px] font-mono" style={{ color: '#4b5563' }}>{categorySkills.length} skills</span>
                </div>
                <div className="p-5 space-y-4">
                  {categorySkills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>{skill.skill_name}</span>
                        <span className="text-[10px] font-mono font-bold" style={{ color: brandColor }}>{skill.proficiency_level}%</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.proficiency_level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          style={{ backgroundColor: brandColor, boxShadow: `0 0 8px ${brandColor}60` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Soft skills */}
      <section className="py-12 px-4" style={{ borderTop: `1px solid ${brandColor}10` }}>
        <div className="container mx-auto max-w-6xl">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] mb-8 block" style={{ color: brandColor }}>
            SOFT SKILLS
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {defaultSoftSkills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-xl p-5"
                style={{ backgroundColor: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <DynamicIcon name={skill.icon} className="h-5 w-5 mb-3" style={{ color: brandColor }} />
                <h3 className="font-semibold text-sm mb-1" style={{ color: '#f0ede6' }}>{skill.name}</h3>
                <p className="text-xs" style={{ color: '#6b7280' }}>{skill.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
