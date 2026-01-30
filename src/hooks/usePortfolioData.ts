import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Types
export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  tech_stack: string[];
  key_features: string[];
  images: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  user_id: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  category: string;
  skill_name: string;
  proficiency_level: number;
  created_at: string;
}

export interface Blog {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  content: string | null;
  published_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  user_id: string;
  client_name: string;
  company: string | null;
  text: string;
  rating: number;
  created_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  sender_name: string;
  sender_email: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Education {
  id: string;
  user_id: string;
  degree: string;
  field_of_study: string;
  institution: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  gpa: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_url: string | null;
  skills_learned: string[];
  created_at: string;
  updated_at: string;
}

// Projects hooks
export function useProjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user?.id,
  });

  const createProject = useMutation({
    mutationFn: async (project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({ title: 'Project created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({ title: 'Project updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({ title: 'Project deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const reorderProjects = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      const promises = updates.map(({ id, sort_order }) =>
        supabase.from('projects').update({ sort_order }).eq('id', id)
      );
      await Promise.all(promises);
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['projects', user?.id] });
      const previousProjects = queryClient.getQueryData(['projects', user?.id]);

      queryClient.setQueryData(['projects', user?.id], (old: Project[] | undefined) => {
        if (!old) return old;
        const sorted = [...old];
        updates.forEach(({ id, sort_order }) => {
          const project = sorted.find(p => p.id === id);
          if (project) project.sort_order = sort_order;
        });
        return sorted.sort((a, b) => a.sort_order - b.sort_order);
      });

      return { previousProjects };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['projects', user?.id], context?.previousProjects);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });

  return { projects, isLoading, createProject, updateProject, deleteProject, reorderProjects };
}

// Experience hooks
export function useExperience() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: experience = [], isLoading } = useQuery({
    queryKey: ['experience', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as Experience[];
    },
    enabled: !!user?.id,
  });

  const createExperience = useMutation({
    mutationFn: async (exp: Omit<Experience, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('experience')
        .insert({ ...exp, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', user?.id] });
      toast({ title: 'Experience added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateExperience = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Experience> & { id: string }) => {
      const { data, error } = await supabase
        .from('experience')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', user?.id] });
      toast({ title: 'Experience updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteExperience = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('experience').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', user?.id] });
      toast({ title: 'Experience deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { experience, isLoading, createExperience, updateExperience, deleteExperience };
}

// Skills hooks
export function useSkills() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id)
        .order('category', { ascending: true });
      if (error) throw error;
      return data as Skill[];
    },
    enabled: !!user?.id,
  });

  const createSkill = useMutation({
    mutationFn: async (skill: Omit<Skill, 'id' | 'user_id' | 'created_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('skills')
        .insert({ ...skill, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', user?.id] });
      toast({ title: 'Skill added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSkill = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', user?.id] });
      toast({ title: 'Skill deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { skills, isLoading, createSkill, deleteSkill };
}

// Testimonials hooks
export function useTestimonials() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Testimonial[];
    },
    enabled: !!user?.id,
  });

  const createTestimonial = useMutation({
    mutationFn: async (testimonial: Omit<Testimonial, 'id' | 'user_id' | 'created_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('testimonials')
        .insert({ ...testimonial, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials', user?.id] });
      toast({ title: 'Testimonial added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateTestimonial = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Testimonial> & { id: string }) => {
      const { data, error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials', user?.id] });
      toast({ title: 'Testimonial updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTestimonial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials', user?.id] });
      toast({ title: 'Testimonial deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const bulkDeleteTestimonials = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials', user?.id] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { testimonials, isLoading, createTestimonial, updateTestimonial, deleteTestimonial, bulkDeleteTestimonials };
}

// Messages hooks
export function useMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user?.id,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', user?.id] });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', user?.id] });
      toast({ title: 'Message deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return { messages, isLoading, markAsRead, deleteMessage, unreadCount };
}

// Public portfolio data hooks
export function usePublicPortfolioData(userId: string | undefined) {
  const { data: projects = [] } = useQuery({
    queryKey: ['publicProjects', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, image_url, live_url, github_url, tech_stack, sort_order')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .limit(20); // Limit to 20 projects for performance
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!userId,
  });

  const { data: experience = [] } = useQuery({
    queryKey: ['publicExperience', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('experience')
        .select('id, company, role, location, start_date, end_date, is_current, description')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })
        .limit(15); // Limit to 15 experiences for performance
      if (error) throw error;
      return data as Experience[];
    },
    enabled: !!userId,
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['publicSkills', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('skills')
        .select('id, category, skill_name, proficiency_level')
        .eq('user_id', userId)
        .order('proficiency_level', { ascending: false })
        .limit(30); // Limit to top 30 skills for performance
      if (error) throw error;
      return data as Skill[];
    },
    enabled: !!userId,
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['publicTestimonials', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('testimonials')
        .select('id, client_name, company, text, rating, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10); // Limit to 10 testimonials for performance
      if (error) throw error;
      return data as Testimonial[];
    },
    enabled: !!userId,
  });

  const { data: education = [] } = useQuery({
    queryKey: ['publicEducation', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('education')
        .select('id, degree, field_of_study, institution, location, start_date, end_date, is_current, gpa')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })
        .limit(10); // Limit to 10 education entries for performance
      if (error) throw error;
      return data as Education[];
    },
    enabled: !!userId,
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ['publicCertifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('certifications')
        .select('id, title, issuer, issue_date, credential_url, skills_learned')
        .eq('user_id', userId)
        .order('issue_date', { ascending: false })
        .limit(15); // Limit to 15 certifications for performance
      if (error) throw error;
      return data as Certification[];
    },
    enabled: !!userId,
  });

  return { projects, experience, skills, testimonials, education, certifications };
}

// Education hooks
export function useEducation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: education = [], isLoading } = useQuery({
    queryKey: ['education', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as Education[];
    },
    enabled: !!user?.id,
  });

  const createEducation = useMutation({
    mutationFn: async (edu: Omit<Education, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('education')
        .insert({ ...edu, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', user?.id] });
      toast({ title: 'Education added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateEducation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Education> & { id: string }) => {
      const { data, error } = await supabase
        .from('education')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', user?.id] });
      toast({ title: 'Education updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteEducation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('education').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', user?.id] });
      toast({ title: 'Education deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { education, isLoading, createEducation, updateEducation, deleteEducation };
}

// Certifications hooks
export function useCertifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ['certifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });
      if (error) throw error;
      return data as Certification[];
    },
    enabled: !!user?.id,
  });

  const createCertification = useMutation({
    mutationFn: async (cert: Omit<Certification, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('certifications')
        .insert({ ...cert, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications', user?.id] });
      toast({ title: 'Certification added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateCertification = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Certification> & { id: string }) => {
      const { data, error } = await supabase
        .from('certifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications', user?.id] });
      toast({ title: 'Certification updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCertification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('certifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications', user?.id] });
      toast({ title: 'Certification deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { certifications, isLoading, createCertification, updateCertification, deleteCertification };
}
