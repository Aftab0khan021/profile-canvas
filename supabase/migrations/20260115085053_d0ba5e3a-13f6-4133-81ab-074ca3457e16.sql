-- Add key_features and images array columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS key_features text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';