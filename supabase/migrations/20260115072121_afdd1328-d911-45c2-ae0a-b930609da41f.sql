-- Create portfolio_views table for analytics tracking
CREATE TABLE public.portfolio_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_path TEXT NOT NULL DEFAULT '/',
  referrer TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.portfolio_views ENABLE ROW LEVEL SECURITY;

-- Public can insert views (anonymous tracking)
CREATE POLICY "Public can insert views"
  ON public.portfolio_views FOR INSERT
  WITH CHECK (true);

-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics"
  ON public.portfolio_views FOR SELECT
  USING (auth.uid() = user_id);

-- Users can delete their own analytics
CREATE POLICY "Users can delete their own analytics"
  ON public.portfolio_views FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_portfolio_views_user_id ON public.portfolio_views(user_id);
CREATE INDEX idx_portfolio_views_viewed_at ON public.portfolio_views(viewed_at);