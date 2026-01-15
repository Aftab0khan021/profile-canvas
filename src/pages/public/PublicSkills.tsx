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
  const { profile, brandColor } = usePublicLayoutContext();
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

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Technical Skills</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Technical Expertise */}
      <section className="pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-8 flex items-center gap-2"
          >
            <Code className="h-6 w-6" style={{ color: brandColor }} />
            Technical Expertise
          </motion.h2>

          {Object.keys(skillsByCategory).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Zap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Skills Added Yet</h3>
              <p className="text-muted-foreground">
                Check back later for technical skills.
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Card className="h-full overflow-hidden">
                      <CardHeader 
                        className="text-white"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` 
                        }}
                      >
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          {category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-4">
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
                              <span className="text-xs text-muted-foreground">
                                {animatedProgress[skill.id] || 0}%
                              </span>
                            </div>
                            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{ 
                                  background: `linear-gradient(90deg, ${colors.from}, ${colors.to})` 
                                }}
                                initial={{ width: '0%' }}
                                animate={{ width: `${animatedProgress[skill.id] || 0}%` }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
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
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-8 flex items-center gap-2"
          >
            <Brain className="h-6 w-6" style={{ color: brandColor }} />
            Soft Skills
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {defaultSoftSkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="pt-6 pb-4">
                    <div 
                      className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ 
                        background: `linear-gradient(135deg, ${brandColor}20, ${brandColor}05)` 
                      }}
                    >
                      <DynamicIcon 
                        name={skill.icon} 
                        className="h-7 w-7 brand-fill" 
                      />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{skill.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {skill.description}
                    </p>
                  </CardContent>
                </Card>
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
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div 
                    className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ 
                      background: `linear-gradient(135deg, ${brandColor}20, ${brandColor}05)` 
                    }}
                  >
                    <Code className="h-8 w-8" style={{ color: brandColor }} />
                  </div>
                  <p className="text-4xl font-bold mb-1" style={{ color: brandColor }}>
                    {stats.totalTechnical}+
                  </p>
                  <p className="text-muted-foreground">Technical Skills</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div 
                    className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ 
                      background: `linear-gradient(135deg, ${brandColor}20, ${brandColor}05)` 
                    }}
                  >
                    <Brain className="h-8 w-8" style={{ color: brandColor }} />
                  </div>
                  <p className="text-4xl font-bold mb-1" style={{ color: brandColor }}>
                    {stats.totalSoftSkills}+
                  </p>
                  <p className="text-muted-foreground">Soft Skills</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div 
                    className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ 
                      background: `linear-gradient(135deg, ${brandColor}20, ${brandColor}05)` 
                    }}
                  >
                    <Clock className="h-8 w-8" style={{ color: brandColor }} />
                  </div>
                  <p className="text-4xl font-bold mb-1" style={{ color: brandColor }}>
                    {stats.yearsExperience}+
                  </p>
                  <p className="text-muted-foreground">Years Experience</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
