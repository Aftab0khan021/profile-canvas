import { usePublicLayoutContext } from '@/layouts/PublicLayout';
import { usePublicPortfolioData } from '@/hooks/usePortfolioData';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin } from 'lucide-react';

export default function PublicExperience() {
  const { profile, brandColor } = usePublicLayoutContext();
  const { experience } = usePublicPortfolioData(profile?.id);

  return (
    <>
      {/* Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Experience</h1>
            <p className="text-muted-foreground text-lg">
              My professional journey and the roles I've held.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          {experience.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No experience to display yet.</p>
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </>
  );
}
