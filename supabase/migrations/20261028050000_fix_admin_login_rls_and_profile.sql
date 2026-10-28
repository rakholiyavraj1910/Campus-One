-- ==============================================================================
-- CampusOne Admin Login Fix Migration
-- Migration: 20261028050000_fix_admin_login_rls_and_profile.sql
-- Description:
--   Fixes the admin logout-after-login bug by:
--   1. Adding is_admin() to profiles_select_policy so admins can read profiles
--   2. Adding an admin-specific profile read policy for all profiles (for dashboard data)
--   3. Ensuring the admin profile row promotion handles the campusonegpa@gmail.com account
--
-- ROOT CAUSE SUMMARY:
--   The profiles_select_policy only allowed: auth.uid() = id OR is_faculty()
--   Admins could read their own row (auth.uid() = id) but is_admin() was NOT
--   in the policy. When AdminAuthPage verified the session role, if the
--   profile row was missing (not provisioned), profile = null triggered signOut().
--   Additionally, onAuthStateChange set role='pending' when no row was found,
--   causing App.tsx to render <AccountPendingApproval/>.
--
-- SECURITY GUARANTEE: These fixes do NOT weaken RLS. The admin can already read
-- their own row via auth.uid() = id. Adding is_admin() enables admins to read
-- ALL profiles (needed for the admin dashboard). Students still can only read
-- their own row. Role escalation protections remain unchanged.
-- ==============================================================================

-- 1. Fix profiles_select_policy to include is_admin()
--    Admins need to read all profiles for the admin dashboard (ManageStudents, ManageFaculty, etc.)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR is_admin() OR is_faculty());

-- 2. Ensure profiles_update_policy is correct (unchanged, but included for completeness)
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- 3. Ensure prevent_role_escalation remains secure (re-apply from previous migration)
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
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

-- 4. Promote campusonegpa@gmail.com to admin (idempotent — runs only if account exists in auth.users)
DO $$
DECLARE
  v_admin_id UUID;
  v_admin_email TEXT := 'campusonegpa@gmail.com';
BEGIN
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE lower(email) = lower(v_admin_email)
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.profiles (
      id, email, name, role, department, designation, admin_level, created_at, updated_at
    ) VALUES (
      v_admin_id, v_admin_email, 'CampusOne Administrator',
      'admin'::public.user_role_type, 'Central Administration',
      'Chief Administrative Officer', 'Super Administrator',
      pg_catalog.now(), pg_catalog.now()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin'::public.user_role_type,
      admin_level = 'Super Administrator',
      name = COALESCE(NULLIF(public.profiles.name, ''), 'CampusOne Administrator'),
      designation = 'Chief Administrative Officer',
      department = 'Central Administration',
      updated_at = pg_catalog.now();

    RAISE NOTICE 'Administrator profile promoted for % (ID: %)', v_admin_email, v_admin_id;
  ELSE
    RAISE NOTICE 'User % not found in auth.users — create the account in Supabase Dashboard first, then re-run this migration.', v_admin_email;
  END IF;
END $$;

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
