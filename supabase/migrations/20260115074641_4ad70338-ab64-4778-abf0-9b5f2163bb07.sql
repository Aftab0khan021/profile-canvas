-- Add template column to profiles for theme selection
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS template TEXT DEFAULT 'modern';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.template IS 'Portfolio theme template: modern, minimal, or professional';