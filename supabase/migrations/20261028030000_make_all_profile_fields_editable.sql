-- ==============================================================================
-- CampusOne Profile Management: Make All Student Profile Fields Editable
-- Migration: 20261028030000_make_all_profile_fields_editable.sql
-- Description:
--   Permits students to edit all their personal and academic profile fields:
--   (Name, Phone, Department, Roll Number, PRN, Semester, Division, Academic Year,
--   CGPA, Mentor Name, Mentor Email).
--
--   Security & Privilege Separation:
--   - Role level security strictly prevents students from altering another student's record (auth.uid() = id).
--   - Core authentication identity (id, email) remains immutable.
--   - Role and administrative privilege escalation remains strictly forbidden (only admins can modify role and admin_level).
--   - CGPA and Semester numeric range validations are enforced at the database level.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Strict Privilege Separation: Non-admins cannot alter authentication identity, account role, or admin privileges
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    -- Immutable core authentication identity fields
    IF (OLD.id IS DISTINCT FROM NEW.id) THEN
      RAISE EXCEPTION 'Unauthorized: Account ID cannot be altered.';
    END IF;
    IF (OLD.email IS DISTINCT FROM NEW.email) THEN
      RAISE EXCEPTION 'Unauthorized: Account email cannot be altered directly via profile update.';
    END IF;

    -- Privilege-defining security fields: only institutional administrators can change roles or admin levels
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

-- Ensure profiles update policy allows self-profile edits and admin updates
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
