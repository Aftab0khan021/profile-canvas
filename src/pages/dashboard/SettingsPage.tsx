import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ImageUpload';
import { ColorPicker } from '@/components/ColorPicker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Layout, Minimize2, Briefcase, Sparkles } from 'lucide-react';

const settingsSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  avatar_url: z.string().nullable().optional(),
  resume_url: z.string().nullable().optional(),
  brand_color: z.string().optional(),
  template: z.string().optional(),
  roles_text: z.string().optional(),
  availability_status: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { profile, isLoading, updateProfile } = useProfile();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      full_name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      linkedin_url: '',
      github_url: '',
      avatar_url: null,
      resume_url: null,
      brand_color: '#3b82f6',
      template: 'modern',
      roles_text: '',
      availability_status: 'Available for Opportunities',
    },
  });

  useEffect(() => {
    if (profile) {
      const profileAny = profile as any;
      form.reset({
        full_name: profile.full_name || '',
        title: profile.title || '',
        bio: profile.bio || '',
        email: profile.email || '',
        phone: profile.phone || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        avatar_url: profile.avatar_url,
        resume_url: profile.resume_url,
        brand_color: profile.brand_color || '#3b82f6',
        template: profileAny.template || 'modern',
        roles_text: (profileAny.roles || []).join(', '),
        availability_status: profileAny.availability_status || 'Available for Opportunities',
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: SettingsFormValues) => {
    // Convert comma-separated roles to array
    const rolesArray = values.roles_text
      ? values.roles_text.split(',').map(r => r.trim()).filter(Boolean)
      : [];

    await updateProfile.mutateAsync({
      full_name: values.full_name || null,
      title: values.title || null,
      bio: values.bio || null,
      email: values.email || null,
      phone: values.phone || null,
      linkedin_url: values.linkedin_url || null,
      github_url: values.github_url || null,
      avatar_url: values.avatar_url,
      resume_url: values.resume_url,
      brand_color: values.brand_color || '#3b82f6',
      template: values.template || 'modern',
      roles: rolesArray,
      availability_status: values.availability_status || 'Available for Opportunities',
    } as any);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and branding</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture & Resume</CardTitle>
              <CardDescription>Upload your avatar and resume PDF</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-6">
              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        variant="avatar"
                        accept="image/*"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="resume_url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Resume (PDF)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        variant="file"
                        accept=".pdf"
                        maxSize={10}
                      />
                    </FormControl>
                    <FormDescription>Upload your resume for visitors to download</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic information displayed on your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Stack Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell visitors about yourself..." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Hero Customization
              </CardTitle>
              <CardDescription>Customize the animated hero section on your home page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="roles_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Animated Roles</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer, Problem Solver, Creative Thinker" {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of roles that will animate in your hero section (e.g., "Software Engineer, Full Stack Developer, Tech Lead")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availability_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Status</FormLabel>
                    <FormControl>
                      <Input placeholder="Available for Opportunities" {...field} />
                    </FormControl>
                    <FormDescription>
                      Status badge shown on your portfolio (e.g., "Available for Work", "Open to Projects", "Currently Employed")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How visitors can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="github_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize the look of your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="brand_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Color</FormLabel>
                    <FormControl>
                      <ColorPicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>This color will be used for buttons and accents on your public portfolio</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio Template</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
                      >
                        <Label
                          htmlFor="modern"
                          className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                            field.value === 'modern' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value="modern" id="modern" className="sr-only" />
                          <Layout className="h-8 w-8 mb-2" />
                          <span className="font-medium">Modern</span>
                          <span className="text-xs text-muted-foreground text-center mt-1">Clean centered layout</span>
                        </Label>
                        <Label
                          htmlFor="minimal"
                          className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                            field.value === 'minimal' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value="minimal" id="minimal" className="sr-only" />
                          <Minimize2 className="h-8 w-8 mb-2" />
                          <span className="font-medium">Minimal</span>
                          <span className="text-xs text-muted-foreground text-center mt-1">Large typography, simple</span>
                        </Label>
                        <Label
                          htmlFor="professional"
                          className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                            field.value === 'professional' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value="professional" id="professional" className="sr-only" />
                          <Briefcase className="h-8 w-8 mb-2" />
                          <span className="font-medium">Professional</span>
                          <span className="text-xs text-muted-foreground text-center mt-1">Sidebar navigation</span>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>Choose how your public portfolio is displayed</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={updateProfile.isPending} className="w-full sm:w-auto">
            {updateProfile.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Settings
          </Button>
        </form>
      </Form>
    </div>
  );
}
