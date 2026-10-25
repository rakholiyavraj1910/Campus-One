-- ==============================================================================
-- CampusOne Forward Migration: 20261026010000_fix_user_role_type_and_signup.sql
-- Fix: type "user_role_type" does not exist (SQLSTATE 42704) during signup
-- Ensures search_path = public, pg_temp on security definer auth triggers and functions
-- Safe, minimal, idempotent, and preserves all existing tables and data
-- ==============================================================================

-- 1. Ensure user_role_type enum exists in public schema and includes all valid application roles
DO $$ BEGIN
  CREATE TYPE public.user_role_type AS ENUM ('student', 'faculty', 'admin', 'guest', 'pending');
EXCEPTION WHEN duplicate_object THEN
  BEGIN
    ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'pending';
  EXCEPTION WHEN others THEN null;
  END;
END $$;

-- 2. Ensure default on profiles.role column is properly schema-qualified
ALTER TABLE IF EXISTS public.profiles 
  ALTER COLUMN role SET DEFAULT 'student'::public.user_role_type;

-- 3. Replace handle_new_user() with explicit search_path and schema-qualified public.user_role_type
-- This resolves SQLSTATE 42704 when GoTrue invokes the trigger in auth context
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  assigned_role public.user_role_type := 'student'::public.user_role_type;
  initial_admin_email TEXT := 'admin@campusone.edu';
  candidate_role TEXT;
BEGIN
  candidate_role := NEW.raw_user_meta_data->>'role';

  -- Rule 1: Explicit institutional root administrator check
  IF NEW.email = initial_admin_email THEN
    assigned_role := 'admin'::public.user_role_type;
  -- Rule 2: Institutional faculty domain check (only elevated if specifically approved or institutional faculty)
  ELSIF candidate_role = 'faculty' AND (NEW.email LIKE '%@faculty.campusone.edu' OR NEW.email LIKE '%@campusone.edu') THEN
    assigned_role := 'faculty'::public.user_role_type;
  -- Rule 3: Default public registrations are strictly assigned 'student'
  ELSE
    assigned_role := 'student';
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
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'department', 'Architecture'),
    COALESCE(NEW.raw_user_meta_data->>'roll_number', 'CS-' || FLOOR(RANDOM() * 9000 + 1000)::TEXT),
    COALESCE(NEW.raw_user_meta_data->>'prn', '2025' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0')),
    COALESCE((NEW.raw_user_meta_data->>'semester')::INT, 1),
    COALESCE(NEW.raw_user_meta_data->>'division', 'A'),
    NEW.raw_user_meta_data->>'designation',
    NEW.raw_user_meta_data->>'cabin',
    NEW.raw_user_meta_data->>'admin_level',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    department = COALESCE(EXCLUDED.department, profiles.department),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- 4. Rebind trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Harden is_admin() with search_path and schema-qualified enum comparison
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'::public.user_role_type
  );
END;
$$;

-- 6. Harden is_faculty() with search_path and schema-qualified enum comparison
CREATE OR REPLACE FUNCTION public.is_faculty() 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('faculty'::public.user_role_type, 'admin'::public.user_role_type)
  );
END;
$$;

-- 7. Harden current_user_role() with search_path
CREATE OR REPLACE FUNCTION public.current_user_role() 
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'guest');
END;
$$;

-- 8. Harden prevent_role_escalation() with search_path
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only institutional administrators can change account roles.';
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- 9. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
