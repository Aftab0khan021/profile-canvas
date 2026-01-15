import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ProfileItem {
  id: string;
  user_id: string;
  type: 'value' | 'highlight';
  title: string;
  description: string | null;
  icon_name: string | null;
  sort_order: number;
  created_at: string;
}

export interface PageContent {
  id: string;
  user_id: string;
  page_slug: string;
  section_key: string;
  content_value: string | null;
  created_at: string;
  updated_at: string;
}

// Profile Items (Values & Highlights) hooks
export function useProfileItems() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['profileItems', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('profile_items')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as ProfileItem[];
    },
    enabled: !!user?.id,
  });

  const highlights = items.filter(item => item.type === 'highlight');
  const values = items.filter(item => item.type === 'value');

  const createItem = useMutation({
    mutationFn: async (item: Omit<ProfileItem, 'id' | 'user_id' | 'created_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('profile_items')
        .insert({ ...item, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileItems', user?.id] });
      toast({ title: 'Item created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProfileItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('profile_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileItems', user?.id] });
      toast({ title: 'Item updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profile_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileItems', user?.id] });
      toast({ title: 'Item deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { items, highlights, values, isLoading, createItem, updateItem, deleteItem };
}

// Page Content hooks
export function usePageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: content = [], isLoading } = useQuery({
    queryKey: ['pageContent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as PageContent[];
    },
    enabled: !!user?.id,
  });

  const getContent = (pageSlug: string, sectionKey: string): string => {
    const item = content.find(c => c.page_slug === pageSlug && c.section_key === sectionKey);
    return item?.content_value || '';
  };

  const upsertContent = useMutation({
    mutationFn: async ({ page_slug, section_key, content_value }: { page_slug: string; section_key: string; content_value: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('page_content')
        .upsert(
          { user_id: user.id, page_slug, section_key, content_value },
          { onConflict: 'user_id,page_slug,section_key' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContent', user?.id] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const saveAllContent = useMutation({
    mutationFn: async (updates: { page_slug: string; section_key: string; content_value: string }[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      const promises = updates.map(({ page_slug, section_key, content_value }) =>
        supabase
          .from('page_content')
          .upsert(
            { user_id: user.id, page_slug, section_key, content_value },
            { onConflict: 'user_id,page_slug,section_key' }
          )
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContent', user?.id] });
      toast({ title: 'Content saved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { content, isLoading, getContent, upsertContent, saveAllContent };
}

// Public data hooks for fetching profile items and page content
export function usePublicProfileItems(userId: string | undefined) {
  const { data: items = [] } = useQuery({
    queryKey: ['publicProfileItems', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('profile_items')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as ProfileItem[];
    },
    enabled: !!userId,
  });

  const highlights = items.filter(item => item.type === 'highlight');
  const values = items.filter(item => item.type === 'value');

  return { items, highlights, values };
}

export function usePublicPageContent(userId: string | undefined) {
  const { data: content = [] } = useQuery({
    queryKey: ['publicPageContent', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data as PageContent[];
    },
    enabled: !!userId,
  });

  const getContent = (pageSlug: string, sectionKey: string, fallback: string = ''): string => {
    const item = content.find(c => c.page_slug === pageSlug && c.section_key === sectionKey);
    return item?.content_value || fallback;
  };

  return { content, getContent };
}
