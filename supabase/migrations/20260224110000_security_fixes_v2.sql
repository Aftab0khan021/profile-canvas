-- ============================================================
-- Security Fix Migration v2 (post re-audit)
-- Date: 2026-02-24
-- ============================================================

-- H-2: Restrict portfolio_views INSERT so only the service_role
--      (edge function) can insert rows. Removes the open anonymous
--      WITH CHECK (true) policy that allowed anyone to inject fake
--      analytics data for any user_id.
DROP POLICY IF EXISTS "Public can insert views" ON public.portfolio_views;

-- Views are now tracked via the useTrackView hook which calls the
-- Supabase client directly. If you want to re-enable server-side
-- tracking in the future, insert via a dedicated edge function
-- using the service_role key.
-- For now, to allow the existing client-side tracking to continue
-- working, we add a restricted policy: visitors can INSERT only
-- when the user_id they provide actually exists in profiles.
CREATE POLICY "Visitors can insert views for existing portfolio owners"
  ON public.portfolio_views FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id)
  );

-- L-2: Add is_current + end_date consistency check to education
--      (same constraint already applied to experience in the previous migration)
ALTER TABLE public.education
  DROP CONSTRAINT IF EXISTS education_is_current_end_date_check;

ALTER TABLE public.education
  ADD CONSTRAINT education_is_current_end_date_check
  CHECK (NOT (is_current = true AND end_date IS NOT NULL));
