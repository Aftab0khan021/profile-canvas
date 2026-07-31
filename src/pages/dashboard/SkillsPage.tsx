import { useSkills, type Skill } from '@/hooks/usePortfolioData';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Plus, Trash2, Lightbulb, Loader2, Pencil } from 'lucide-react';
import { PageShell, EmptyState, PageLoader } from '@/components/PageShell';
import { useState } from 'react';

const skillSchema = z.object({
  skill_name: z.string().min(1, 'Skill name is required'),
  category: z.string().min(1, 'Category is required'),
  proficiency_level: z.number().min(0).max(100).default(50),
});

type SkillFormValues = z.infer<typeof skillSchema>;

const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Design', 'Other'];

export default function SkillsPage() {
  const { skills, isLoading, createSkill, updateSkill, deleteSkill, trashSkill } = useSkills();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skill_name: '',
      category: 'Frontend',
      proficiency_level: 50,
    },
  });

  const openCreateDialog = () => {
    setEditingId(null);
    form.reset({ skill_name: '', category: 'Frontend', proficiency_level: 50 });
    setDialogOpen(true);
  };

  const openEditDialog = (skill: Skill) => {
    setEditingId(skill.id);
    form.reset({
      skill_name: skill.skill_name,
      category: skill.category,
      proficiency_level: skill.proficiency_level,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: SkillFormValues) => {
    if (editingId) {
      await updateSkill.mutateAsync({ id: editingId, ...values });
    } else {
      await createSkill.mutateAsync({
        skill_name: values.skill_name,
        category: values.category,
        proficiency_level: values.proficiency_level,
      });
    }
    form.reset();
    setDialogOpen(false);
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (isLoading) return <PageLoader />;

  return (
    <PageShell
      title="Skills"
      description="Showcase your technical abilities, grouped by category."
      maxWidth="xl"
      action={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="btn-gradient h-9 rounded-lg px-4 text-sm font-semibold">
              <Plus className="h-4 w-4 mr-1.5" />Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">{editingId ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update skill name, category, or proficiency.' : 'Add a new skill to your portfolio.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="skill_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Name</FormLabel>
                      <FormControl>
                        <Input placeholder="React, Node.js, Figma..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proficiency_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proficiency Level: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={5}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createSkill.isPending || updateSkill.isPending}>
                    {(createSkill.isPending || updateSkill.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingId ? 'Update Skill' : 'Add Skill'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      }
    >

      {skills.length === 0 ? (
        <div className="bento-card">
          <EmptyState
            icon={Lightbulb}
            title="No skills added yet"
            body="Add your technical skills to showcase your expertise."
            action={
              <Button onClick={openCreateDialog} className="btn-gradient h-9 rounded-lg px-4 text-sm font-semibold">
                <Plus className="h-4 w-4 mr-1.5" />Add Skill
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div key={category} className="bento-card overflow-hidden p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                <span className="font-display font-semibold text-sm">{category}</span>
                <span className="font-mono text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">{categorySkills.length}</span>
              </div>
              <div className="p-4 space-y-4">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="group space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{skill.skill_name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-muted-foreground font-mono">{skill.proficiency_level}%</span>
                        <button onClick={() => openEditDialog(skill)} className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button onClick={() => setDeleteTarget(skill)} className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                        style={{ width: `${skill.proficiency_level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        itemLabel={deleteTarget?.skill_name ?? ''}
        onSoftDelete={async () => {
          if (deleteTarget) await trashSkill.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onHardDelete={async () => {
          if (deleteTarget) await deleteSkill.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </PageShell>
  );
}
