-- ==============================================================================
-- CampusOne Minimal Forward Migration: 20261026010000_fix_user_role_type_and_signup.sql
-- Fix: type "user_role_type" does not exist (SQLSTATE 42704) during /auth/v1/signup
-- Safe, forward-only, idempotent, and non-destructive to existing data.
-- ==============================================================================

-- 1. Ensure public.user_role_type enum exists (preserves existing production enum)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_namespace n ON n.oid = t.typnamespace 
    WHERE n.nspname = 'public' AND t.typname = 'user_role_type'
  ) THEN
    CREATE TYPE public.user_role_type AS ENUM ('student', 'faculty', 'admin', 'guest');
  END IF;
END $$;

-- 2. Ensure default on public.profiles.role is schema-qualified
ALTER TABLE IF EXISTS public.profiles 
  ALTER COLUMN role SET DEFAULT 'student'::public.user_role_type;

-- 3. Replace handle_new_user() with explicit search_path and schema-qualified public.user_role_type
-- Security rules enforced:
-- - ALL public signups receive exclusively 'student'::public.user_role_type.
-- - No automatic admin assignment by email address or domain.
-- - Faculty access requests store admin_level = 'pending_faculty' and stay pending.
-- - ON CONFLICT (id) DO NOTHING prevents overwriting existing roles or profile data.
-- - SET search_path = public, pg_temp resolves SQLSTATE 42704 in GoTrue's auth connection.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  assigned_role public.user_role_type := 'student'::public.user_role_type;
BEGIN
  -- Strict security: Every public signup receives ONLY the student role.
  -- Faculty requests remain student with admin_level = 'pending_faculty' until approved.
  assigned_role := 'student'::public.user_role_type;

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
    CASE 
      WHEN NEW.raw_user_meta_data->>'admin_level' = 'pending_faculty' 
        OR NEW.raw_user_meta_data->>'requested_role' = 'faculty'
      THEN 'pending_faculty'
      ELSE NULL 
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

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

-- 8. Harden prevent_role_escalation() with search_path and schema-qualified is_admin()
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
