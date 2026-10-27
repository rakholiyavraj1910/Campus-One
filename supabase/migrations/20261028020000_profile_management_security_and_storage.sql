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
-- Enforces that students and faculty can update permitted personal information,
-- but CANNOT modify institution-controlled or privilege-defining fields.
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Strict Privilege Separation: Non-admins cannot alter role or system flags
  IF NOT public.is_admin() THEN
    -- Immutable core identity fields
    IF (OLD.id IS DISTINCT FROM NEW.id) THEN
      RAISE EXCEPTION 'Unauthorized: Account ID cannot be altered.';
    END IF;
    IF (OLD.email IS DISTINCT FROM NEW.email) THEN
      RAISE EXCEPTION 'Unauthorized: Account email cannot be altered directly.';
    END IF;
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can change account roles.';
    END IF;
    IF (OLD.admin_level IS DISTINCT FROM NEW.admin_level) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can modify admin levels or approval status.';
    END IF;

    -- Student Protected Academic Fields
    IF (OLD.role = 'student'::public.user_role_type) THEN
      IF (OLD.cgpa IS DISTINCT FROM NEW.cgpa) THEN
        RAISE EXCEPTION 'Unauthorized: Student CGPA is institutionally verified and cannot be self-edited.';
      END IF;
      IF (OLD.roll_number IS DISTINCT FROM NEW.roll_number) THEN
        RAISE EXCEPTION 'Unauthorized: Student Roll Number is institutionally assigned and cannot be self-edited.';
      END IF;
      IF (OLD.prn IS DISTINCT FROM NEW.prn) THEN
        RAISE EXCEPTION 'Unauthorized: Student PRN is institutionally assigned and cannot be self-edited.';
      END IF;
      IF (OLD.department IS DISTINCT FROM NEW.department) THEN
        RAISE EXCEPTION 'Unauthorized: Academic Department assignment requires administrative registrar approval.';
      END IF;
      IF (OLD.semester IS DISTINCT FROM NEW.semester) THEN
        RAISE EXCEPTION 'Unauthorized: Semester progression is controlled through official academic promotion.';
      END IF;
      IF (OLD.division IS DISTINCT FROM NEW.division) THEN
        RAISE EXCEPTION 'Unauthorized: Division allocation is managed by the department academic coordinator.';
      END IF;
      IF (OLD.academic_year IS DISTINCT FROM NEW.academic_year) THEN
        RAISE EXCEPTION 'Unauthorized: Academic year cannot be self-edited.';
      END IF;
    END IF;

    -- Faculty Protected Administrative Fields
    IF (OLD.role = 'faculty'::public.user_role_type) THEN
      IF (OLD.department IS DISTINCT FROM NEW.department) THEN
        RAISE EXCEPTION 'Unauthorized: Faculty department transfers must be processed by the administration.';
      END IF;
      IF (OLD.designation IS DISTINCT FROM NEW.designation) THEN
        RAISE EXCEPTION 'Unauthorized: Academic designation is governed by institutional appointment.';
      END IF;
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
