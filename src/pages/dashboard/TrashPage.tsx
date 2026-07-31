import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageShell, PageLoader } from '@/components/PageShell';
import {
  Trash2,
  RotateCcw,
  Loader2,
  AlertTriangle,
  FolderOpen,
  Lightbulb,
  BookOpen,
  Briefcase,
  GraduationCap,
  Award,
  Star,
} from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

/** Returns days remaining before auto-purge (30-day window) */
function daysUntilPurge(deletedAt: string) {
  return Math.max(0, 30 - differenceInDays(new Date(), new Date(deletedAt)));
}

type TrashCategory = 'projects' | 'experience' | 'skills' | 'blogs' | 'education' | 'certifications' | 'testimonials';

const CATEGORY_CONFIG: Record<TrashCategory, { label: string; icon: React.ReactNode }> = {
  projects: { label: 'Projects', icon: <FolderOpen className="h-4 w-4" /> },
  experience: { label: 'Experience', icon: <Briefcase className="h-4 w-4" /> },
  skills: { label: 'Skills', icon: <Lightbulb className="h-4 w-4" /> },
  blogs: { label: 'Blog Posts', icon: <BookOpen className="h-4 w-4" /> },
  education: { label: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
  certifications: { label: 'Certifications', icon: <Award className="h-4 w-4" /> },
  testimonials: { label: 'Testimonials', icon: <Star className="h-4 w-4" /> },
};

interface TrashedItem {
  id: string;
  label: string;
  sublabel?: string;
  deleted_at: string;
  table: TrashCategory;
}

export default function TrashPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TrashCategory>('projects');

  // Fetch trashed items for each category
  const { data: trashData = {}, isLoading } = useQuery({
    queryKey: ['trash', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      const tables: TrashCategory[] = ['projects', 'experience', 'skills', 'blogs', 'education', 'certifications', 'testimonials'];
      const results: Record<string, TrashedItem[]> = {};

      await Promise.all(
        tables.map(async (table) => {
          const { data } = await supabase
            .from(table)
            .select('*')
            .eq('user_id', user.id)
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false });

          results[table] = (data || []).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            deleted_at: row.deleted_at as string,
            table,
            label:
              (row.title as string) ||
              (row.skill_name as string) ||
              (row.role as string) ||
              (row.degree as string) ||
              (row.client_name as string) ||
              'Untitled',
            sublabel:
              (row.company as string) ||
              (row.issuer as string) ||
              (row.institution as string) ||
              (row.category as string) ||
              undefined,
          }));
        })
      );

      return results;
    },
    enabled: !!user?.id,
  });

  const restoreItem = useMutation({
    mutationFn: async ({ table, id }: { table: TrashCategory; id: string }) => {
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: null })
        .eq('id', id)
        .eq('user_id', user?.id ?? '');
      if (error) throw error;
    },
    onSuccess: (_, { table }) => {
      queryClient.invalidateQueries({ queryKey: ['trash', user?.id] });
      queryClient.invalidateQueries({ queryKey: [table, user?.id] });
      toast({ title: 'Item restored', description: 'The item has been moved back to your portfolio.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    },
  });

  const permanentlyDelete = useMutation({
    mutationFn: async ({ table, id }: { table: TrashCategory; id: string }) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id ?? '');
      if (error) throw error;
    },
    onSuccess: (_, { table }) => {
      queryClient.invalidateQueries({ queryKey: ['trash', user?.id] });
      queryClient.invalidateQueries({ queryKey: [table, user?.id] });
      toast({ title: 'Permanently deleted', description: 'The item has been removed forever.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    },
  });

  const totalTrashed = Object.values(trashData).reduce((sum, items) => sum + items.length, 0);
  const activeItems: TrashedItem[] = (trashData[activeTab] as TrashedItem[]) || [];

  if (isLoading) return <PageLoader />;

  return (
    <PageShell
      title="Trash"
      description={totalTrashed === 0 ? 'Your trash is empty.' : `${totalTrashed} item${totalTrashed !== 1 ? 's' : ''} in trash — automatically purged after 30 days.`}
      maxWidth="xl"
    >

      {totalTrashed > 0 && (
        <div className="bento-card border-amber-200/30 bg-amber-950/20 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-200">
            Items in the Trash are hidden from your public portfolio. They will be
            <strong> permanently deleted 30 days</strong> after being moved to Trash.
            You can restore them anytime before that.
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TrashCategory)}>
        <TabsList className="flex flex-wrap gap-1 h-auto">
          {(Object.entries(CATEGORY_CONFIG) as [TrashCategory, typeof CATEGORY_CONFIG[TrashCategory]][]).map(([key, cfg]) => {
            const count = (trashData[key] as TrashedItem[] | undefined)?.length ?? 0;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1.5">
                {cfg.icon}
                {cfg.label}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(CATEGORY_CONFIG) as TrashCategory[]).map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-4">
            {(activeItems.length === 0 && cat === activeTab) ? (
              <div className="bento-card flex flex-col items-center py-10 text-center">
                <Trash2 className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No {CATEGORY_CONFIG[cat].label.toLowerCase()} in trash.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeItems.map((item) => {
                  const remaining = daysUntilPurge(item.deleted_at);
                  return (
                    <div key={item.id} className="bento-card border-dashed">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div>
                          <p className="text-sm font-semibold line-through text-muted-foreground">{item.label}</p>
                          {item.sublabel && (
                            <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${remaining <= 3 ? 'bg-red-500/10 text-red-400' : remaining <= 7 ? 'bg-amber-500/10 text-amber-400' : 'bg-muted text-muted-foreground'}`}>
                            {remaining}d left
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Trashed {formatDistanceToNow(new Date(item.deleted_at), { addSuffix: true })}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-green-800/30 text-green-500 hover:bg-green-950"
                          onClick={() => restoreItem.mutate({ table: item.table, id: item.id })}
                          disabled={restoreItem.isPending || permanentlyDelete.isPending}
                        >
                          {restoreItem.isPending ? (
                            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3 w-3 mr-1.5" />
                          )}
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs"
                          onClick={() => permanentlyDelete.mutate({ table: item.table, id: item.id })}
                          disabled={restoreItem.isPending || permanentlyDelete.isPending}
                        >
                          {permanentlyDelete.isPending ? (
                            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3 mr-1.5" />
                          )}
                          Delete Forever
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </PageShell>
  );
}
