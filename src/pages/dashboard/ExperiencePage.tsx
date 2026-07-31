import { useState } from 'react';
import { useExperience, type Experience } from '@/hooks/usePortfolioData';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Briefcase, MapPin, Calendar, Loader2 } from 'lucide-react';
import { PageShell, EmptyState, PageLoader } from '@/components/PageShell';

const experienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  location: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
  description: z.string().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export default function ExperiencePage() {
  const { experience, isLoading, createExperience, updateExperience, deleteExperience } = useExperience();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: '',
      role: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
    },
  });

  const openCreateDialog = () => {
    setEditingId(null);
    form.reset({
      company: '',
      role: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (exp: Experience) => {
    setEditingId(exp.id);
    form.reset({
      company: exp.company,
      role: exp.role,
      location: exp.location || '',
      start_date: exp.start_date,
      end_date: exp.end_date || '',
      is_current: exp.is_current || false,
      description: exp.description || '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: ExperienceFormValues) => {
    const data = {
      company: values.company,
      role: values.role,
      start_date: values.start_date,
      is_current: values.is_current,
      location: values.location || null,
      end_date: values.is_current ? null : values.end_date || null,
      description: values.description || null,
    };

    if (editingId) {
      await updateExperience.mutateAsync({ id: editingId, ...data });
    } else {
      await createExperience.mutateAsync(data);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this experience?')) {
      await deleteExperience.mutateAsync(id);
    }
  };

  const isCurrent = form.watch('is_current');

  if (isLoading) return <PageLoader />;

  return (
    <PageShell
      title="Experience"
      description="Manage your work history and professional timeline."
      maxWidth="xl"
      action={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="btn-gradient h-9 rounded-lg px-4 text-sm font-semibold">
              <Plus className="h-4 w-4 mr-1.5" />Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">{editingId ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update your work experience details.' : 'Add a new position to your work history.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isCurrent} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="is_current"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">I currently work here</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your responsibilities and achievements..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createExperience.isPending || updateExperience.isPending}>
                    {(createExperience.isPending || updateExperience.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingId ? 'Update' : 'Add'} Experience
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      }
    >

      {experience.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon={Briefcase}
            title="No experience added yet"
            body="Start building your professional timeline by adding your first role."
            action={
              <Button onClick={openCreateDialog} className="btn-gradient h-9 rounded-lg px-4 text-sm font-semibold">
                <Plus className="h-4 w-4 mr-1.5" />Add Experience
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {experience.map((exp) => (
            <div key={exp.id} className="group flex gap-4 p-5 rounded-xl border border-border bg-card hover:border-border/80 transition-colors duration-150">
              {/* Timeline dot */}
              <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                <div className="h-2.5 w-2.5 rounded-full bg-violet-500 ring-4 ring-violet-500/10" />
                <div className="w-px flex-1 bg-border/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <h3 className="font-display font-semibold text-[15px] leading-snug">{exp.role}</h3>
                    <p className="text-sm font-medium text-violet-600 dark:text-violet-400">{exp.company}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                    <button onClick={() => openEditDialog(exp)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(exp.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1.5 mb-2 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                  </span>
                  {exp.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{exp.location}</span>}
                  {exp.is_current && <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold">Current</span>}
                </div>
                {exp.description && <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
