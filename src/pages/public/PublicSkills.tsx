import { useMemo } from 'react';
import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Code, Brain, Sparkles } from 'lucide-react';

export default function PublicSkills() {
  const { profile, brandColor } = usePublicLayoutContext();
  const { skills, experience } = usePublicPortfolioData(profile?.id);

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

  // Calculate years of experience
  const yearsOfExperience = useMemo(() => {
    if (experience.length === 0) return 0;
    const earliestDate = experience.reduce((earliest, exp) => {
      const startDate = new Date(exp.start_date);
      return startDate < earliest ? startDate : earliest;
    }, new Date());
    return Math.floor((Date.now() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
  }, [experience]);

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Skills & Expertise</h1>
            <p className="text-muted-foreground text-lg">
              Technologies I work with and skills I've developed over the years.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold" style={{ color: brandColor }}>
                    {skills.length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Total Skills</p>
                </CardContent>
              </Card>
            </motion.div>
            {yearsOfExperience > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold" style={{ color: brandColor }}>
                      {yearsOfExperience}+
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Years Experience</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold" style={{ color: brandColor }}>
                    {Object.keys(technicalSkills).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Categories</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technical Skills with Progress Bars */}
      {Object.keys(technicalSkills).length > 0 && (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Code className="h-6 w-6" style={{ color: brandColor }} />
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
        <section className="pb-20 px-4 border-t pt-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Brain className="h-6 w-6" style={{ color: brandColor }} />
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
