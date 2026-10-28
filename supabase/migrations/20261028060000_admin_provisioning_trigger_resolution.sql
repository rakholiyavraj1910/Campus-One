-- ==============================================================================
-- CampusOne Administrator Provisioning & Trigger Hardening Migration
-- Migration: 20261028060000_admin_provisioning_trigger_resolution.sql
--
-- DESCRIPTION:
--   1. Ensures public.is_admin() is marked STABLE and safe against recursive RLS evaluation.
--   2. Preserves existing RLS policies on public.profiles:
--        - profiles_select_policy: auth.uid() = id OR is_admin() OR is_faculty()
--        - profiles_update_policy: auth.uid() = id OR is_admin()
--   3. Hardens prevent_role_escalation() by preserving all field protections (id, email,
--      role, admin_level, cgpa, semester) while restricting privileged maintenance to an
--      explicit, transaction-scoped session token (campusone.admin_provisioning_in_progress = 'true')
--      restricted specifically to database owner 'postgres' and the authorized admin email.
--   4. Performs an auditable, atomic promotion of campusonegpa@gmail.com to Super Administrator.
--
-- SECURITY & COMPLIANCE VERIFICATION:
--   - Does NOT disable the trigger globally (DISABLE TRIGGER is never executed).
--   - Does NOT insert directly into auth.users or auth.identities.
--   - Does NOT allow public signup or email matching to escalate privileges.
--   - Prevents arbitrary SQL as postgres from becoming an undocumented permanent authorization bypass.
-- ==============================================================================

-- ==============================================================================
-- PART 1: PERMANENT DATABASE ARCHITECTURE (Helper Functions, RLS Policies, Trigger)
-- ==============================================================================

-- 1. Ensure public.is_admin() is STABLE, SECURITY DEFINER, search_path = '', and immune to RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (auth.uid()) AND role = 'admin'::public.user_role_type
  );
END;
$$;

-- 2. Preserve and reinforce Row Level Security (RLS) policies on public.profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR is_admin() OR is_faculty());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- 3. Hardened Role & Protected-Field Trigger Function
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_is_authorized_admin BOOLEAN := false;
BEGIN
  -- A. Verified institutional administrator session in PostgREST
  IF public.is_admin() THEN
    v_is_authorized_admin := true;
  -- B. Restricted database operator maintenance exception:
  --    Must satisfy ALL of the following conditions simultaneously:
  --    1. Explicit transaction-local configuration parameter set to 'true'
  --    2. Current PostgreSQL session role is 'postgres' (PostgREST connections run as 'authenticated' or 'anon')
  --    3. No external web JWT present (auth.uid() IS NULL)
  --    4. Target email matches the authorized institutional administrator email
  --    5. Target role is 'admin'::public.user_role_type
  ELSIF pg_catalog.current_setting('campusone.admin_provisioning_in_progress', true) = 'true'
        AND pg_catalog.current_user = 'postgres'
        AND auth.uid() IS NULL
        AND NEW.email = 'campusonegpa@gmail.com'
        AND NEW.role = 'admin'::public.user_role_type THEN
    v_is_authorized_admin := true;
  END IF;

  -- Enforce strict role and admin_level protection against unauthorized callers
  IF NOT v_is_authorized_admin THEN
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can change account roles.';
    END IF;
    IF (OLD.admin_level IS DISTINCT FROM NEW.admin_level) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can modify admin levels or approval status.';
    END IF;
  END IF;

  -- Immutable core authentication identity fields (enforced for ALL operations)
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

-- Ensure the trigger is active on public.profiles
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();


-- ==============================================================================
-- PART 2: AUDITABLE ONE-TIME ADMIN PROVISIONING OPERATION
-- ==============================================================================

DO $$
DECLARE
  v_admin_id UUID;
  v_admin_email TEXT := 'campusonegpa@gmail.com';
  v_existing_role public.user_role_type;
BEGIN
  -- 1. Verify target user exists in auth.users
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE lower(email) = lower(v_admin_email)
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Provisioning Aborted: Account % does not exist in auth.users.', v_admin_email;
  END IF;

  -- 2. Verify target profile exists in public.profiles
  SELECT role INTO v_existing_role
  FROM public.profiles
  WHERE id = v_admin_id;

  IF v_existing_role IS NULL THEN
    RAISE EXCEPTION 'Provisioning Aborted: Profile row for % (ID: %) was not found in public.profiles.', v_admin_email, v_admin_id;
  END IF;

  -- 3. Set transaction-scoped authorization token (automatically expires at end of transaction)
  PERFORM set_config('campusone.admin_provisioning_in_progress', 'true', true);

  -- 4. Atomic role promotion
  UPDATE public.profiles
  SET
    role = 'admin'::public.user_role_type,
    admin_level = 'Super Administrator',
    designation = 'Chief Administrative Officer',
    department = 'Central Administration',
    name = COALESCE(NULLIF(public.profiles.name, ''), 'CampusOne Administrator'),
    updated_at = pg_catalog.now()
  WHERE id = v_admin_id;

  RAISE NOTICE 'SUCCESS: Administrator profile promoted for % (ID: %). Role changed from % to admin.', 
    v_admin_email, v_admin_id, v_existing_role;
END $$;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
