-- ==============================================================================
-- CampusOne Administrator Account Provisioning Migration
-- Migration: 20261028010000_provision_campusone_admin.sql
-- Description:
--   Configures institutional administrator role governance for
--   username: vibhusuvaliyacampusone (email: vibhusuvaliya@gmail.com)
--   
--   SECURITY & PRIVILEGE SEPARATION NOTICE:
--   - Passwords and auth credentials MUST NEVER be stored in migrations or version control.
--   - Direct manual INSERTs into auth.users and auth.identities are omitted to prevent
--     GoTrue identity corruption and schema divergence across Supabase versions.
--   - Email confirmation must remain enabled; do not fabricate synthetic email domains.
--   - Public signups are strictly restricted to the 'student' role. Under NO circumstances
--     does handle_new_user() automatically grant 'admin' role simply based on email address.
--   - Administrator role promotion requires an independently authorized provisioning action
--     executed in the Supabase SQL Editor by a trusted database operator.
-- ==============================================================================

-- 1. Ensure prevent_role_escalation permits database-level migrations (auth.uid() IS NULL)
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

-- 2. Strict handle_new_user() Trigger: Public signups receive ONLY the student role
-- No automatic admin elevation is performed on signup by email matching.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  assigned_role public.user_role_type := 'student'::public.user_role_type;
  assigned_admin_level TEXT;
  assigned_name TEXT;
  assigned_department TEXT;
  assigned_designation TEXT;
BEGIN
  -- Strict security guarantee:
  -- Every public registration via GoTrue receives exclusively student role.
  -- Faculty requests are flagged with pending_faculty for admin review.
  assigned_role := 'student'::public.user_role_type;
  assigned_admin_level := CASE 
    WHEN NEW.raw_user_meta_data->>'admin_level' = 'pending_faculty' 
      OR NEW.raw_user_meta_data->>'requested_role' = 'faculty'
    THEN 'pending_faculty'
    ELSE NULL 
  END;
  assigned_name := COALESCE(NEW.raw_user_meta_data->>'name', pg_catalog.split_part(NEW.email, '@', 1));
  assigned_department := COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science & Engineering');
  assigned_designation := NEW.raw_user_meta_data->>'designation';

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    department,
    roll_number,
    prn,
    semester,
    division,
    designation,
    cabin,
    admin_level,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    assigned_name,
    assigned_role,
    assigned_department,
    CASE WHEN assigned_role = 'student'::public.user_role_type THEN COALESCE(NEW.raw_user_meta_data->>'roll_number', 'CS-' || pg_catalog.floor(pg_catalog.random() * 9000 + 1000)::TEXT) ELSE NULL END,
    CASE WHEN assigned_role = 'student'::public.user_role_type THEN COALESCE(NEW.raw_user_meta_data->>'prn', '2025' || pg_catalog.lpad(pg_catalog.floor(pg_catalog.random() * 100000000)::TEXT, 8, '0')) ELSE NULL END,
    CASE WHEN assigned_role = 'student'::public.user_role_type THEN COALESCE((NEW.raw_user_meta_data->>'semester')::INT, 1) ELSE NULL END,
    CASE WHEN assigned_role = 'student'::public.user_role_type THEN COALESCE(NEW.raw_user_meta_data->>'division', 'A') ELSE NULL END,
    assigned_designation,
    NEW.raw_user_meta_data->>'cabin',
    assigned_admin_level,
    pg_catalog.now(),
    pg_catalog.now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Independent Administrator Account Role Promotion
-- This block is executed independently by the database administrator in the Supabase SQL editor.
-- It links the confirmed administrator auth user to full administrative clearance in public.profiles.
DO $$
DECLARE
  v_admin_id UUID;
  v_admin_email TEXT := 'vibhusuvaliya@gmail.com';
BEGIN
  -- Locate the authorized admin account in auth.users
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE lower(email) = lower(v_admin_email)
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
      email,
      name,
      role,
      department,
      designation,
      admin_level,
      created_at,
      updated_at
    ) VALUES (
      v_admin_id,
      v_admin_email,
      'Vibhu Suvaliya',
      'admin'::public.user_role_type,
      'Central Administration',
      'Chief Administrative Officer',
      'Super Administrator',
      pg_catalog.now(),
      pg_catalog.now()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin'::public.user_role_type,
      admin_level = 'Super Administrator',
      name = 'Vibhu Suvaliya',
      designation = 'Chief Administrative Officer',
      department = 'Central Administration',
      updated_at = pg_catalog.now();
  END IF;
END $$;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
