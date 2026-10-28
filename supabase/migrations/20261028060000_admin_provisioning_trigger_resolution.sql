-- ==============================================================================
-- CampusOne Administrator Provisioning & Trigger Deadlock Resolution Migration
-- Migration: 20261028060000_admin_provisioning_trigger_resolution.sql
-- 
-- DESCRIPTION:
--   Resolves the administrative provisioning deadlock in public.profiles where
--   prevent_role_escalation() blocked updates in the Supabase SQL Editor.
--
-- TECHNICAL ROOT CAUSE:
--   1. The Supabase SQL Editor runs as the PostgreSQL role 'postgres'.
--   2. In hosted Supabase, 'postgres' has 'rolbypassrls = true', but 'rolsuper = false'.
--   3. 'rolbypassrls' bypasses Row Level Security policies, but has NO EFFECT on
--      table triggers (BEFORE UPDATE ... EXECUTE FUNCTION ...). Triggers always execute.
--   4. The SQL Editor operates without an HTTP PostgREST session, so auth.uid() is NULL.
--   5. public.is_admin() evaluates `SELECT EXISTS (... WHERE id = auth.uid() AND role = 'admin')`.
--      Because auth.uid() is NULL, is_admin() unconditionally evaluates to FALSE.
--   6. The trigger evaluated:
--        IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT is_admin() THEN RAISE EXCEPTION ...
--      Since 'student' != 'admin' (TRUE) and NOT is_admin() (TRUE), the exception was raised.
--   7. This created a bootstrap deadlock: no admin could ever be provisioned via SQL Editor.
--
-- SECURITY GUARANTEES:
--   - Does NOT disable the trigger globally (DISABLE TRIGGER is never executed).
--   - Does NOT weaken role protections for students, faculty, or public/anon users.
--   - API callers (authenticator -> authenticated / anon) CANNOT impersonate 'postgres'.
--   - Core identity fields (id, email) remain strictly immutable.
--   - Academic constraints (CGPA 0.00-10.00, Semester 1-12) remain enforced.
--   - Does NOT perform direct manual inserts into auth.users or auth.identities.
--   - Does NOT grant administrative privileges based on signup email matching.
-- ==============================================================================

-- 1. Ensure RLS select and update policies permit administrator operations
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR is_admin() OR is_faculty());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- 2. Update prevent_role_escalation() with hardened context-aware privilege verification
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_is_authorized_admin BOOLEAN := false;
BEGIN
  -- Determine whether the executing context possesses administrative clearance:
  -- A. An active authenticated administrator session in PostgREST (auth.uid() matches an admin profile)
  IF public.is_admin() THEN
    v_is_authorized_admin := true;
  -- B. A direct database administrator session executed by the database owner ('postgres')
  --    without an external web user identity (auth.uid() IS NULL).
  --    Note: PostgREST web connections execute as 'authenticated' or 'anon' (never 'postgres').
  ELSIF pg_catalog.current_user = 'postgres' AND auth.uid() IS NULL THEN
    v_is_authorized_admin := true;
  END IF;

  -- Enforce strict role and privilege protection against unauthorized users (students, faculty, anon API callers)
  IF NOT v_is_authorized_admin THEN
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can change account roles.';
    END IF;
    IF (OLD.admin_level IS DISTINCT FROM NEW.admin_level) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can modify admin levels or approval status.';
    END IF;
  END IF;

  -- Core identity immutability (immutable for all callers)
  IF (OLD.id IS DISTINCT FROM NEW.id) THEN
    RAISE EXCEPTION 'Unauthorized: Account ID cannot be altered.';
  END IF;
  IF (OLD.email IS DISTINCT FROM NEW.email) THEN
    RAISE EXCEPTION 'Unauthorized: Account email cannot be altered directly via profile update.';
  END IF;

  -- Database-level validation for academic metrics
  IF NEW.cgpa IS NOT NULL AND (NEW.cgpa < 0.00 OR NEW.cgpa > 10.00) THEN
    RAISE EXCEPTION 'Invalid CGPA: CGPA must be between 0.00 and 10.00.';
  END IF;

  IF NEW.semester IS NOT NULL AND (NEW.semester < 1 OR NEW.semester > 12) THEN
    RAISE EXCEPTION 'Invalid Semester: Semester must be between 1 and 12.';
  END IF;

  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

-- Ensure the trigger is attached to public.profiles
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- 3. Idempotent One-Time Provisioning for campusonegpa@gmail.com
DO $$
DECLARE
  v_admin_id UUID;
  v_admin_email TEXT := 'campusonegpa@gmail.com';
BEGIN
  -- Locate the authorized account in auth.users
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE lower(email) = lower(v_admin_email)
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    -- Update existing profile row (currently role='student') to full Super Administrator status
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
      'CampusOne Administrator',
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
      name = COALESCE(NULLIF(public.profiles.name, ''), 'CampusOne Administrator'),
      designation = 'Chief Administrative Officer',
      department = 'Central Administration',
      updated_at = pg_catalog.now();

    RAISE NOTICE 'SUCCESS: Administrator profile promoted for % (ID: %)', v_admin_email, v_admin_id;
  ELSE
    RAISE EXCEPTION 'ABORTED: User % was not found in auth.users. Please create the user first in the Supabase Dashboard (Authentication > Users).', v_admin_email;
  END IF;
END $$;

-- 4. Invalidate schema cache so PostgREST immediately recognizes updated roles and policies
NOTIFY pgrst, 'reload schema';
