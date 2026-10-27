-- ==============================================================================
-- CampusOne Administrator Account Provisioning Migration
-- Migration: 20261028010000_provision_campusone_admin.sql
-- Description:
--   Configures institutional administrator role governance for
--   username: vibhusuvaliyacampusone (email: vibhusuvaliyacampusone@gpahmedabad.ac.in)
--   
--   SECURITY NOTICE:
--   - Passwords and auth credentials MUST NEVER be stored in migrations or version control.
--   - Direct manual INSERTs into auth.users and auth.identities are omitted to prevent
--     GoTrue identity corruption and schema divergence across Supabase versions.
--   - Administrator authentication accounts must be registered via the Supabase Dashboard
--     (Authentication > Users > "Add user" with Auto Confirm enabled) or via the Supabase
--     Auth Admin API using a trusted server environment.
-- ==============================================================================

-- 1. Ensure prevent_role_escalation permits database-level migrations (auth.uid() IS NULL)
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Strict Privilege Separation: Non-admins cannot alter their role, approval status, CGPA, ID, or email
  -- When auth.uid() IS NULL, the operation is an internal migration or postgres superuser command
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can change account roles.';
    END IF;
    IF (OLD.admin_level IS DISTINCT FROM NEW.admin_level) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can modify admin levels or approval status.';
    END IF;
    IF (OLD.cgpa IS DISTINCT FROM NEW.cgpa) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional academic officers can modify student CGPA.';
    END IF;
    IF (OLD.id IS DISTINCT FROM NEW.id) THEN
      RAISE EXCEPTION 'Unauthorized: Account ID cannot be altered.';
    END IF;
    IF (OLD.email IS DISTINCT FROM NEW.email) THEN
      RAISE EXCEPTION 'Unauthorized: Account email cannot be altered directly.';
    END IF;

    -- Student Protected Academic Fields
    IF (OLD.role = 'student'::public.user_role_type) THEN
      IF (OLD.roll_number IS DISTINCT FROM NEW.roll_number) THEN
        RAISE EXCEPTION 'Unauthorized: Student Roll Number is institutionally assigned.';
      END IF;
      IF (OLD.prn IS DISTINCT FROM NEW.prn) THEN
        RAISE EXCEPTION 'Unauthorized: Student PRN is institutionally assigned.';
      END IF;
      IF (OLD.department IS DISTINCT FROM NEW.department) THEN
        RAISE EXCEPTION 'Unauthorized: Academic Department assignment requires administrative approval.';
      END IF;
      IF (OLD.semester IS DISTINCT FROM NEW.semester) THEN
        RAISE EXCEPTION 'Unauthorized: Semester progression is controlled through official academic promotion.';
      END IF;
      IF (OLD.division IS DISTINCT FROM NEW.division) THEN
        RAISE EXCEPTION 'Unauthorized: Division allocation is managed by the department coordinator.';
      END IF;
      IF (OLD.academic_year IS DISTINCT FROM NEW.academic_year) THEN
        RAISE EXCEPTION 'Unauthorized: Academic year cannot be self-edited.';
      END IF;
    END IF;

    -- Faculty Protected Administrative Fields
    IF (OLD.role = 'faculty'::public.user_role_type) THEN
      IF (OLD.department IS DISTINCT FROM NEW.department) THEN
        RAISE EXCEPTION 'Unauthorized: Faculty department transfers must be processed by administration.';
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

-- 2. Update handle_new_user() to automatically assign admin clearance to the official admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  assigned_role public.user_role_type;
  assigned_admin_level TEXT;
  assigned_name TEXT;
  assigned_department TEXT;
  assigned_designation TEXT;
BEGIN
  -- Designate canonical institutional admin if registered via Supabase Auth
  IF lower(NEW.email) = 'vibhusuvaliyacampusone@gpahmedabad.ac.in' THEN
    assigned_role := 'admin'::public.user_role_type;
    assigned_admin_level := 'Super Administrator';
    assigned_name := COALESCE(NEW.raw_user_meta_data->>'name', 'Vibhu Suvaliya');
    assigned_department := 'Central Administration';
    assigned_designation := 'Chief Administrative Officer';
  ELSE
    -- Default security policy: Every other public signup receives ONLY the student role
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
  END IF;

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
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    admin_level = EXCLUDED.admin_level,
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    department = COALESCE(public.profiles.department, EXCLUDED.department),
    designation = COALESCE(public.profiles.designation, EXCLUDED.designation),
    updated_at = pg_catalog.now()
  WHERE lower(public.profiles.email) = 'vibhusuvaliyacampusone@gpahmedabad.ac.in';

  RETURN NEW;
END;
$$;

-- 3. Idempotently promote the admin account if already present in auth.users
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE lower(email) = 'vibhusuvaliyacampusone@gpahmedabad.ac.in'
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
      'vibhusuvaliyacampusone@gpahmedabad.ac.in',
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
