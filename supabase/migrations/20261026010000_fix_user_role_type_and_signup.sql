-- ==============================================================================
-- CampusOne Minimal Forward Migration: 20261026010000_fix_user_role_type_and_signup.sql
-- Fix: type "user_role_type" does not exist (SQLSTATE 42704) during /auth/v1/signup
-- Minimal, forward-only, idempotent, and non-destructive.
-- ==============================================================================

-- 1. Replace handle_new_user() with SET search_path = '' and schema-qualified public.user_role_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
    COALESCE(NEW.raw_user_meta_data->>'name', pg_catalog.split_part(NEW.email, '@', 1)),
    assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'department', 'Architecture'),
    COALESCE(NEW.raw_user_meta_data->>'roll_number', 'CS-' || pg_catalog.floor(pg_catalog.random() * 9000 + 1000)::TEXT),
    COALESCE(NEW.raw_user_meta_data->>'prn', '2025' || pg_catalog.lpad(pg_catalog.floor(pg_catalog.random() * 100000000)::TEXT, 8, '0')),
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
    pg_catalog.now(),
    pg_catalog.now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
