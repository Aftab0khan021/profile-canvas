-- 1. Table for "Values" and "Highlights" cards
CREATE TABLE public.profile_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('value', 'highlight')),
  title text NOT NULL,
  description text,
  icon_name text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Table for Page Subtitles, CTA Text, and SEO
CREATE TABLE public.page_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  page_slug text NOT NULL,
  section_key text NOT NULL,
  content_value text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, page_slug, section_key)
);

-- 3. Add 'roles' and 'availability_status' to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'Available for Opportunities';

-- 4. Enable Row Level Security
ALTER TABLE public.profile_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for profile_items
CREATE POLICY "Public can view profile items" ON public.profile_items
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile items" ON public.profile_items
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile items" ON public.profile_items
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile items" ON public.profile_items
FOR DELETE USING (auth.uid() = user_id);

-- 6. RLS Policies for page_content
CREATE POLICY "Public can view page content" ON public.page_content
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own page content" ON public.page_content
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own page content" ON public.page_content
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own page content" ON public.page_content
FOR DELETE USING (auth.uid() = user_id);

-- 7. Add updated_at trigger for page_content
CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();