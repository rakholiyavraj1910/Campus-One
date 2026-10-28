-- ==============================================================================
-- CampusOne Super Admin User & Role Management Upgrade Migration
-- Migration: 20261028070000_user_role_management_and_safeguards.sql
--
-- DESCRIPTION:
--   1. Ensures public.is_admin() is marked STABLE, SECURITY DEFINER, search_path = ''.
--   2. Updates prevent_role_escalation() with:
--      - Primary Super Admin demotion protection (campusonegpa@gmail.com cannot be demoted).
--      - Self-demotion lockout protection (administrators cannot strip their own privileges).
--      - Verified administrator role-management clearance (is_admin() = true).
--      - Preserved identity immutability (id, email) and academic range bounds (cgpa, semester).
--   3. Preserves RLS policies allowing administrators to manage all profiles.
--   4. Idempotent check and promotion for existing Mohini Mishra faculty account if present.
-- ==============================================================================

-- 1. Ensure public.is_admin() is STABLE, SECURITY DEFINER, search_path = ''
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

-- 2. Preserve RLS select and update policies on public.profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR is_admin() OR is_faculty());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- 3. Hardened Role & Protected-Field Trigger Function with Admin Safeguards
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
  -- B. Restricted database operator maintenance exception (SQL Editor direct session)
  ELSIF pg_catalog.session_user = 'postgres' AND auth.uid() IS NULL THEN
    v_is_authorized_admin := true;
  END IF;

  -- SAFEGUARD 1: The primary institutional administrator account cannot be demoted under any circumstance
  IF OLD.email = 'campusonegpa@gmail.com' AND NEW.role != 'admin'::public.user_role_type THEN
    RAISE EXCEPTION 'Unauthorized: The primary institutional administrator account (campusonegpa@gmail.com) cannot be demoted.';
  END IF;

  -- SAFEGUARD 2: Administrators cannot remove their own administrator privileges to prevent lockout
  IF auth.uid() IS NOT NULL AND auth.uid() = OLD.id AND OLD.role = 'admin'::public.user_role_type AND NEW.role != 'admin'::public.user_role_type THEN
    RAISE EXCEPTION 'Unauthorized: Administrators cannot remove their own administrative privileges to prevent accidental lockout.';
  END IF;

  -- Enforce strict role and admin_level protection against unauthorized callers (students, faculty, anon API callers)
  IF NOT v_is_authorized_admin THEN
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can change account roles.';
    END IF;
    IF (OLD.admin_level IS DISTINCT FROM NEW.admin_level) THEN
      RAISE EXCEPTION 'Unauthorized: Only institutional administrators can modify admin levels or approval status.';
    END IF;
  END IF;

  -- Immutable core authentication identity fields
  IF (OLD.id IS DISTINCT FROM NEW.id) THEN
    RAISE EXCEPTION 'Unauthorized: Account ID cannot be altered.';
  END IF;

  -- Email immutability for non-admins (email updates must go through Supabase Auth)
  IF NOT v_is_authorized_admin AND (OLD.email IS DISTINCT FROM NEW.email) THEN
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

-- Ensure trigger is active
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- 4. Idempotent check and promotion for existing Mohini Mishra account
DO $$
DECLARE
  v_mohini_id UUID;
  v_mohini_email TEXT;
BEGIN
  SELECT id, email INTO v_mohini_id, v_mohini_email
  FROM public.profiles
  WHERE (lower(name) LIKE '%mohini%mishra%' OR lower(email) LIKE '%mohini%')
  LIMIT 1;

  IF v_mohini_id IS NOT NULL THEN
    UPDATE public.profiles
    SET 
      role = 'faculty'::public.user_role_type,
      admin_level = NULL,
      designation = COALESCE(NULLIF(designation, ''), 'Assistant Professor'),
      department = COALESCE(NULLIF(department, ''), 'Computer Engineering'),
      cabin = COALESCE(NULLIF(cabin, ''), 'Faculty Tower, Room 302'),
      updated_at = pg_catalog.now()
    WHERE id = v_mohini_id;

    RAISE NOTICE 'SUCCESS: Mohini Mishra account (% - ID: %) confirmed and promoted to Faculty role.', v_mohini_email, v_mohini_id;
  ELSE
    RAISE NOTICE 'NOTICE: No existing Mohini Mishra account found during migration run; administrator can manage and promote via User Management UI once registered.';
  END IF;
END $$;

-- 5. Reload schema cache
NOTIFY pgrst, 'reload schema';
