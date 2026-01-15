import { useState, useEffect } from 'react';
import { usePageContent } from '@/hooks/useProfileItems';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Home, User, FolderOpen, FileText, Mail, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PageConfig {
  slug: string;
  label: string;
  icon: React.ElementType;
  fields: { key: string; label: string; placeholder: string; multiline?: boolean }[];
}

const PAGE_CONFIGS: PageConfig[] = [
  {
    slug: 'home',
    label: 'Home',
    icon: Home,
    fields: [
      { key: 'hero_subtitle', label: 'Hero Subtitle', placeholder: 'A brief tagline under your name...' },
      { key: 'cta_title', label: 'CTA Section Title', placeholder: "Let's Build Something Amazing" },
      { key: 'cta_description', label: 'CTA Section Description', placeholder: 'Have a project in mind? Let\'s discuss how we can work together...', multiline: true },
    ],
  },
  {
    slug: 'about',
    label: 'About',
    icon: User,
    fields: [
      { key: 'page_subtitle', label: 'Page Subtitle', placeholder: 'A rich narrative about your professional journey...' },
      { key: 'bio_intro', label: 'Bio Introduction', placeholder: 'An extended bio intro text...', multiline: true },
    ],
  },
  {
    slug: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    fields: [
      { key: 'hero_subtitle', label: 'Page Subtitle', placeholder: 'A showcase of my work, experiments, and contributions...' },
      { key: 'empty_state', label: 'Empty State Message', placeholder: 'No projects to display yet.' },
    ],
  },
  {
    slug: 'experience',
    label: 'Experience',
    icon: Briefcase,
    fields: [
      { key: 'hero_subtitle', label: 'Page Subtitle', placeholder: 'My professional journey and career highlights...' },
    ],
  },
  {
    slug: 'blog',
    label: 'Blog',
    icon: FileText,
    fields: [
      { key: 'hero_subtitle', label: 'Page Subtitle', placeholder: 'Thoughts, tutorials, and insights on development and technology...' },
      { key: 'empty_state', label: 'Empty State Message', placeholder: 'No articles published yet.' },
    ],
  },
  {
    slug: 'contact',
    label: 'Contact',
    icon: Mail,
    fields: [
      { key: 'hero_subtitle', label: 'Page Subtitle', placeholder: 'Have a project in mind or just want to say hello?...' },
      { key: 'form_success', label: 'Form Success Message', placeholder: 'Thanks for reaching out. I\'ll get back to you soon.' },
      { key: 'availability_text', label: 'Availability Text', placeholder: 'Available for new projects' },
    ],
  },
];

export default function SiteContentPage() {
  const { content, isLoading, getContent, saveAllContent } = usePageContent();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data from fetched content
  useEffect(() => {
    if (content.length > 0 || !isLoading) {
      const initial: Record<string, Record<string, string>> = {};
      PAGE_CONFIGS.forEach((page) => {
        initial[page.slug] = {};
        page.fields.forEach((field) => {
          initial[page.slug][field.key] = getContent(page.slug, field.key);
        });
      });
      setFormData(initial);
    }
  }, [content, isLoading]);

  const handleChange = (pageSlug: string, fieldKey: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [pageSlug]: {
        ...prev[pageSlug],
        [fieldKey]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const updates: { page_slug: string; section_key: string; content_value: string }[] = [];
    
    Object.entries(formData).forEach(([pageSlug, fields]) => {
      Object.entries(fields).forEach(([sectionKey, contentValue]) => {
        updates.push({ page_slug: pageSlug, section_key: sectionKey, content_value: contentValue });
      });
    });

    await saveAllContent.mutateAsync(updates);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Site Content</h1>
          <p className="text-muted-foreground">Customize all text content on your public portfolio pages</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || saveAllContent.isPending}>
          {saveAllContent.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Changes
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full mb-6">
              {PAGE_CONFIGS.map((page) => (
                <TabsTrigger key={page.slug} value={page.slug} className="flex items-center gap-2">
                  <page.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{page.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {PAGE_CONFIGS.map((page) => (
              <TabsContent key={page.slug} value={page.slug} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
                    <page.icon className="h-5 w-5" />
                    {page.label} Page Content
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Customize the text displayed on your {page.label.toLowerCase()} page
                  </p>
                </div>

                <div className="space-y-4">
                  {page.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`${page.slug}-${field.key}`}>{field.label}</Label>
                      {field.multiline ? (
                        <Textarea
                          id={`${page.slug}-${field.key}`}
                          placeholder={field.placeholder}
                          value={formData[page.slug]?.[field.key] || ''}
                          onChange={(e) => handleChange(page.slug, field.key, e.target.value)}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={`${page.slug}-${field.key}`}
                          placeholder={field.placeholder}
                          value={formData[page.slug]?.[field.key] || ''}
                          onChange={(e) => handleChange(page.slug, field.key, e.target.value)}
                        />
                      )}
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use default: "{field.placeholder}"
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
