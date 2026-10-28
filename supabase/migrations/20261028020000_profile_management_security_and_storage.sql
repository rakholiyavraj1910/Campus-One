-- ==============================================================================
-- CampusOne Profile Management & Storage Security Hardening Migration
-- Migration: 20261028020000_profile_management_security_and_storage.sql
-- ==============================================================================

-- 1. Ensure avatars storage bucket exists and is public for reading
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for avatars bucket (Self-ownership & Least Privilege)
-- Permitted users can read avatars (needed for campus directory & navbar)
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload/insert only into their own user folder (e.g. avatars/{uid}/...)
DROP POLICY IF EXISTS "avatars_user_upload" ON storage.objects;
CREATE POLICY "avatars_user_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.uid()::text = split_part(name, '/', 1)
      OR public.is_admin()
    )
  );

-- Users can update/replace only their own avatars
DROP POLICY IF EXISTS "avatars_user_update" ON storage.objects;
CREATE POLICY "avatars_user_update" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.uid()::text = split_part(name, '/', 1)
      OR public.is_admin()
    )
  );

-- Users can delete only their own avatars
DROP POLICY IF EXISTS "avatars_user_delete" ON storage.objects;
CREATE POLICY "avatars_user_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.uid()::text = split_part(name, '/', 1)
      OR public.is_admin()
    )
  );

-- 3. Hardened Role & Profile Field Protection Trigger
-- Enforces that students and faculty can update personal and academic information,
-- while strictly preventing privilege escalation or mutation of core auth identifiers.
-- Permits database-level migrations and administrative commands when auth.uid() IS NULL.
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Strict Privilege Separation: Non-admins cannot alter authentication identity, account role, or admin privileges
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    IF (OLD.id IS DISTINCT FROM NEW.id) THEN
      RAISE EXCEPTION 'Unauthorized: Account ID cannot be altered.';
    END IF;
    IF (OLD.email IS DISTINCT FROM NEW.email) THEN
      RAISE EXCEPTION 'Unauthorized: Account email cannot be altered directly via profile update.';
    END IF;
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can change account roles.';
    END IF;
    IF (OLD.admin_level IS DISTINCT FROM NEW.admin_level) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can modify admin levels or approval status.';
    END IF;

    -- Database-level validation for academic metrics
    IF NEW.cgpa IS NOT NULL AND (NEW.cgpa < 0.00 OR NEW.cgpa > 10.00) THEN
      RAISE EXCEPTION 'Invalid CGPA: CGPA must be between 0.00 and 10.00.';
    END IF;

    IF NEW.semester IS NOT NULL AND (NEW.semester < 1 OR NEW.semester > 12) THEN
      RAISE EXCEPTION 'Invalid Semester: Semester must be between 1 and 12.';
    END IF;
  END IF;

  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
