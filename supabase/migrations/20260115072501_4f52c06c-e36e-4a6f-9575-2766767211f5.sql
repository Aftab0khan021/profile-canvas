-- Create education table
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT NOT NULL,
  institution TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  gpa TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on education
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- Education RLS policies
CREATE POLICY "Public can view all education"
  ON public.education FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own education"
  ON public.education FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education"
  ON public.education FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education"
  ON public.education FOR DELETE
  USING (auth.uid() = user_id);

-- Create certifications table
CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  credential_url TEXT,
  skills_learned TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on certifications
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- Certifications RLS policies
CREATE POLICY "Public can view all certifications"
  ON public.certifications FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own certifications"
  ON public.certifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certifications"
  ON public.certifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certifications"
  ON public.certifications FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_education_user_id ON public.education(user_id);
CREATE INDEX idx_certifications_user_id ON public.certifications(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_education_updated_at
  BEFORE UPDATE ON public.education
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();