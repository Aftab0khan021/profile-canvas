-- Security Migration: 2026-02-24
-- Fixes: H-4 (messages open INSERT policy), M-4 (is_current constraint), L-6 (full_name null fix)

-- ============================================================
-- H-4: Remove the open anonymous INSERT policy on messages.
-- The contact form Edge Function (send-contact-email) uses the
-- service_role key which bypasses RLS entirely, so no INSERT
-- policy is needed for public visitors.
-- Direct PostgREST calls with the anon key will now be blocked.
-- ============================================================
DROP POLICY IF EXISTS "Public can send messages" ON public.messages;

-- ============================================================
-- M-4: Add a CHECK constraint so that is_current = true and
-- a non-null end_date cannot coexist on the same row.
-- ============================================================
ALTER TABLE public.experience
  ADD CONSTRAINT chk_current_no_end_date
  CHECK (NOT (is_current = true AND end_date IS NOT NULL));

-- ============================================================
-- L-6: Fix handle_new_user trigger: store NULL instead of ''
-- for full_name when the metadata field is missing.
-- An empty string was causing the profile completion check to
-- treat the field as populated.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email)
  VALUES (
    NEW.id,
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || LEFT(NEW.id::text, 8)), ' ', '_')),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')), ''), -- L-6: NULL not ''
    NEW.email
  );
  RETURN NEW;
END;
$$;
