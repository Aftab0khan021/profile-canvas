-- Create rate_limits table for tracking contact form submissions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL DEFAULT 'contact_form',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Index for fast lookups
  CONSTRAINT rate_limits_ip_endpoint_key UNIQUE (ip_address, endpoint, created_at)
);

-- Create index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_created 
  ON public.rate_limits (ip_address, created_at DESC);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage rate limits
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to clean up old rate limit entries (older than 5 minutes)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < (now() - interval '5 minutes');
END;
$$;

-- Comment on table
COMMENT ON TABLE public.rate_limits IS 'Tracks rate limiting for contact form and other endpoints to prevent spam';
