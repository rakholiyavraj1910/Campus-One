-- ==============================================================================
-- CampusOne Security Hardening & Vulnerability Remediation Migration
-- Migration: 20261026030000_security_audit_remediation_and_hardening.sql
-- ==============================================================================

-- 1. Hardened Helper Functions with search_path = ''
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN
LANGUAGE plpgsql
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

CREATE OR REPLACE FUNCTION public.is_faculty() 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (auth.uid()) 
      AND role IN ('faculty'::public.user_role_type, 'admin'::public.user_role_type)
      AND COALESCE(admin_level, '') NOT IN ('pending_faculty', 'rejected')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_role() 
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_role FROM public.profiles WHERE id = (auth.uid());
  RETURN COALESCE(v_role, 'guest');
END;
$$;

-- 2. Hardened Role & Field Protection Trigger (Prevents privilege escalation and CGPA/admin_level tampering)
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Strict Privilege Separation: Non-admins cannot alter their role, approval status, CGPA, ID, or email
  IF NOT public.is_admin() THEN
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
  END IF;

  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- 3. Remediate Missing RLS Policies on class_sections and student_subject_attendance
ALTER TABLE public.class_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "class_sections_read_policy" ON public.class_sections;
CREATE POLICY "class_sections_read_policy" ON public.class_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "class_sections_write_policy" ON public.class_sections;
CREATE POLICY "class_sections_write_policy" ON public.class_sections FOR ALL USING (public.is_admin());

ALTER TABLE public.student_subject_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_sub_attend_manage" ON public.student_subject_attendance;
CREATE POLICY "student_sub_attend_manage" ON public.student_subject_attendance FOR ALL USING (public.is_faculty());

-- 4. Harden Audit Logs (Deny unauthenticated forgery)
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Harden Event Registration (Prevent user_id spoofing)
DROP POLICY IF EXISTS "event_reg_insert_policy" ON public.event_registrations;
CREATE POLICY "event_reg_insert_policy" ON public.event_registrations FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );

-- 6. Harden Storage Assignment Submissions (Prevent folder injection)
DROP POLICY IF EXISTS "submissions_insert" ON storage.objects;
CREATE POLICY "submissions_insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignment_submissions' 
    AND auth.uid() IS NOT NULL 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 7. Secure Notice View Increment RPC
CREATE OR REPLACE FUNCTION public.increment_notice_views(notice_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.notices
  SET views = COALESCE(views, 0) + 1
  WHERE id = notice_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_notice_views(UUID) TO anon, authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
