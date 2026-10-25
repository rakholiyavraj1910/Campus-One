-- ==============================================================================
-- CampusOne Enterprise Database Schema (Supabase / PostgreSQL)
-- Complete College Campus Management, Student Information System & RLS Security
-- ==============================================================================

BEGIN;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE public.user_role_type AS ENUM ('student', 'faculty', 'admin', 'guest', 'pending');
EXCEPTION WHEN duplicate_object THEN
  BEGIN
    ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'pending';
  EXCEPTION WHEN others THEN null;
  END;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status_type AS ENUM ('present', 'absent', 'late', 'excused');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notice_category_type AS ENUM ('Academic', 'Examination', 'Placement', 'Sports', 'Events', 'General');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE material_type AS ENUM ('Notes', 'Syllabus', 'Question Paper', 'Lab Manual', 'Reference');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE feedback_status_type AS ENUM ('Pending', 'In Review', 'Resolved');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role_type NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  phone TEXT,
  department TEXT DEFAULT 'Computer Science & Engineering',
  -- Student specific
  roll_number TEXT,
  prn TEXT,
  semester INT DEFAULT 1,
  academic_year TEXT DEFAULT '2025-2026',
  division TEXT DEFAULT 'A',
  cgpa NUMERIC(4, 2) DEFAULT 8.00,
  mentor_name TEXT,
  mentor_email TEXT,
  -- Faculty specific
  designation TEXT,
  cabin TEXT,
  specialization TEXT[],
  consultation_hours TEXT,
  -- Admin specific
  admin_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  hod_name TEXT NOT NULL,
  hod_email TEXT,
  established_year INT DEFAULT 2005,
  total_students INT DEFAULT 0,
  total_faculty INT DEFAULT 0,
  description TEXT,
  vision TEXT,
  programs_offered TEXT[],
  labs TEXT[],
  banner_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  degree TEXT NOT NULL DEFAULT 'B.Tech',
  duration_years INT DEFAULT 4,
  total_credits INT DEFAULT 160,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FACULTY DIRECTORY TABLE
CREATE TABLE IF NOT EXISTS public.faculty_directory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  qualification TEXT,
  experience_years INT DEFAULT 0,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  cabin TEXT,
  consultation_hours TEXT,
  specialization TEXT[],
  subjects_taught TEXT[],
  avatar TEXT,
  research_papers_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department_code TEXT NOT NULL,
  semester INT NOT NULL,
  credits INT DEFAULT 3,
  type TEXT DEFAULT 'Lecture',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CLASS SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.class_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_code TEXT NOT NULL,
  semester INT NOT NULL,
  division TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TIMETABLES TABLE
CREATE TABLE IF NOT EXISTS public.timetables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_section_id UUID REFERENCES public.class_sections(id) ON DELETE CASCADE,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  faculty_name TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  room TEXT NOT NULL,
  type TEXT DEFAULT 'Lecture',
  color TEXT DEFAULT 'blue'
);

-- 10. ATTENDANCE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  faculty_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  slot TEXT NOT NULL,
  topic TEXT,
  semester INT NOT NULL,
  division TEXT NOT NULL,
  present_count INT DEFAULT 0,
  total_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT,
  roll_number TEXT,
  status attendance_status_type DEFAULT 'present',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. STUDENT SUBJECT ATTENDANCE (Dashboard Overview)
CREATE TABLE IF NOT EXISTS public.student_subject_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  faculty_name TEXT NOT NULL,
  attended_classes INT DEFAULT 0,
  total_classes INT DEFAULT 0,
  percentage NUMERIC(5, 1) DEFAULT 0,
  minimum_required INT DEFAULT 75,
  status TEXT DEFAULT 'Safe',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. MARKS TABLE
CREATE TABLE IF NOT EXISTS public.marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  internal1 NUMERIC(5, 2) DEFAULT 0,
  internal2 NUMERIC(5, 2) DEFAULT 0,
  quiz_avg NUMERIC(5, 2) DEFAULT 0,
  lab_assignment NUMERIC(5, 2) DEFAULT 0,
  attendance_marks NUMERIC(5, 2) DEFAULT 0,
  total_marks NUMERIC(5, 2) DEFAULT 0,
  grade TEXT DEFAULT 'A',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  faculty_name TEXT,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  assigned_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  max_score INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ASSIGNMENT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT,
  submitted_file TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  score TEXT DEFAULT 'Under Review',
  feedback TEXT,
  status TEXT DEFAULT 'Submitted'
);

-- 16. NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category notice_category_type DEFAULT 'General',
  department TEXT DEFAULT 'All',
  semester TEXT DEFAULT 'All',
  date DATE DEFAULT CURRENT_DATE,
  time TEXT DEFAULT TO_CHAR(NOW(), 'HH:MI AM'),
  author TEXT NOT NULL,
  author_role TEXT DEFAULT 'Admin',
  is_urgent BOOLEAN DEFAULT FALSE,
  content TEXT NOT NULL,
  attachment_name TEXT,
  attachment_size TEXT,
  attachment_url TEXT,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  end_date DATE,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  organizer TEXT NOT NULL,
  description TEXT NOT NULL,
  banner_image TEXT NOT NULL,
  registered_count INT DEFAULT 0,
  max_capacity INT DEFAULT 300,
  registration_open BOOLEAN DEFAULT TRUE,
  registration_deadline DATE,
  tags TEXT[],
  contact_person TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. EVENT REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  pass_code TEXT UNIQUE NOT NULL
);

-- 19. STUDY MATERIALS TABLE
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  department TEXT NOT NULL,
  semester INT NOT NULL,
  type material_type DEFAULT 'Notes',
  year TEXT,
  uploaded_by TEXT NOT NULL,
  upload_date DATE DEFAULT CURRENT_DATE,
  file_size TEXT NOT NULL,
  file_format TEXT NOT NULL,
  downloads_count INT DEFAULT 0,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. CAMPUS FACILITIES TABLE
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  block TEXT NOT NULL,
  timings TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[],
  image TEXT NOT NULL,
  in_charge TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. FEEDBACK & GRIEVANCES TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  message TEXT NOT NULL,
  status feedback_status_type DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_notices_date ON public.notices(date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_category ON public.notices(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_study_materials_dept_sem ON public.study_materials(department, semester);
CREATE INDEX IF NOT EXISTS idx_marks_student_id ON public.marks(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assign ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON public.assignment_submissions(student_id);

-- ==============================================================================
-- AUTHORIZATION & ROLE HELPER FUNCTIONS
-- ==============================================================================

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

-- ==============================================================================
-- SECURE USER PROVISIONING TRIGGER
-- Ensures public registration CANNOT escalate role to admin
-- ==============================================================================

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
  -- Rule 2: Institutional faculty domain check
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
    COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science & Engineering'),
    COALESCE(NEW.raw_user_meta_data->>'roll_number', 'CS-' || FLOOR(RANDOM() * 9000 + 1000)::TEXT),
    COALESCE(NEW.raw_user_meta_data->>'prn', '2025' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0')),
    COALESCE((NEW.raw_user_meta_data->>'semester')::INT, 6),
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to prevent self-role escalation on profile updates
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Least Privilege Security Model
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subject_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR is_faculty());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- 2. PUBLIC READ-ONLY TABLES (Departments, Programs, Facilities, Subjects, Timetables)
DROP POLICY IF EXISTS "departments_read_policy" ON public.departments;
CREATE POLICY "departments_read_policy" ON public.departments FOR SELECT USING (true);
DROP POLICY IF EXISTS "departments_write_policy" ON public.departments;
CREATE POLICY "departments_write_policy" ON public.departments FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "programs_read_policy" ON public.programs;
CREATE POLICY "programs_read_policy" ON public.programs FOR SELECT USING (true);
DROP POLICY IF EXISTS "programs_write_policy" ON public.programs;
CREATE POLICY "programs_write_policy" ON public.programs FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "faculty_dir_read_policy" ON public.faculty_directory;
CREATE POLICY "faculty_dir_read_policy" ON public.faculty_directory FOR SELECT USING (true);
DROP POLICY IF EXISTS "faculty_dir_write_policy" ON public.faculty_directory;
CREATE POLICY "faculty_dir_write_policy" ON public.faculty_directory FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "facilities_read_policy" ON public.facilities;
CREATE POLICY "facilities_read_policy" ON public.facilities FOR SELECT USING (true);
DROP POLICY IF EXISTS "facilities_write_policy" ON public.facilities;
CREATE POLICY "facilities_write_policy" ON public.facilities FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "subjects_read_policy" ON public.subjects;
CREATE POLICY "subjects_read_policy" ON public.subjects FOR SELECT USING (true);
DROP POLICY IF EXISTS "subjects_write_policy" ON public.subjects;
CREATE POLICY "subjects_write_policy" ON public.subjects FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "timetables_read_policy" ON public.timetables;
CREATE POLICY "timetables_read_policy" ON public.timetables FOR SELECT USING (true);
DROP POLICY IF EXISTS "timetables_write_policy" ON public.timetables;
CREATE POLICY "timetables_write_policy" ON public.timetables FOR ALL USING (is_faculty());

-- 3. NOTICES POLICIES
DROP POLICY IF EXISTS "notices_select_policy" ON public.notices;
CREATE POLICY "notices_select_policy" ON public.notices FOR SELECT USING (true);
DROP POLICY IF EXISTS "notices_insert_policy" ON public.notices;
CREATE POLICY "notices_insert_policy" ON public.notices FOR INSERT WITH CHECK (is_faculty());
DROP POLICY IF EXISTS "notices_update_policy" ON public.notices;
CREATE POLICY "notices_update_policy" ON public.notices FOR UPDATE USING (is_faculty());
DROP POLICY IF EXISTS "notices_delete_policy" ON public.notices;
CREATE POLICY "notices_delete_policy" ON public.notices FOR DELETE USING (is_admin());

-- 4. EVENTS & REGISTRATIONS POLICIES
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
CREATE POLICY "events_select_policy" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
CREATE POLICY "events_insert_policy" ON public.events FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS "events_update_policy" ON public.events;
CREATE POLICY "events_update_policy" ON public.events FOR UPDATE USING (is_admin());
DROP POLICY IF EXISTS "events_delete_policy" ON public.events;
CREATE POLICY "events_delete_policy" ON public.events FOR DELETE USING (is_admin());

DROP POLICY IF EXISTS "event_reg_select_policy" ON public.event_registrations;
CREATE POLICY "event_reg_select_policy" ON public.event_registrations FOR SELECT
  USING (user_id = auth.uid() OR is_faculty());
DROP POLICY IF EXISTS "event_reg_insert_policy" ON public.event_registrations;
CREATE POLICY "event_reg_insert_policy" ON public.event_registrations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 5. STUDY MATERIALS POLICIES
DROP POLICY IF EXISTS "materials_select_policy" ON public.study_materials;
CREATE POLICY "materials_select_policy" ON public.study_materials FOR SELECT USING (true);
DROP POLICY IF EXISTS "materials_insert_policy" ON public.study_materials;
CREATE POLICY "materials_insert_policy" ON public.study_materials FOR INSERT WITH CHECK (is_faculty());
DROP POLICY IF EXISTS "materials_delete_policy" ON public.study_materials;
CREATE POLICY "materials_delete_policy" ON public.study_materials FOR DELETE USING (is_faculty());

-- 6. MARKS POLICIES
DROP POLICY IF EXISTS "marks_select_policy" ON public.marks;
CREATE POLICY "marks_select_policy" ON public.marks FOR SELECT
  USING (student_id = auth.uid() OR is_faculty());
DROP POLICY IF EXISTS "marks_manage_policy" ON public.marks;
CREATE POLICY "marks_manage_policy" ON public.marks FOR ALL
  USING (is_faculty());

-- 7. ATTENDANCE POLICIES
DROP POLICY IF EXISTS "attendance_sessions_select" ON public.attendance_sessions;
CREATE POLICY "attendance_sessions_select" ON public.attendance_sessions FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "attendance_sessions_manage" ON public.attendance_sessions;
CREATE POLICY "attendance_sessions_manage" ON public.attendance_sessions FOR ALL
  USING (is_faculty());

DROP POLICY IF EXISTS "attendance_records_select" ON public.attendance_records;
CREATE POLICY "attendance_records_select" ON public.attendance_records FOR SELECT
  USING (student_id = auth.uid() OR is_faculty());
DROP POLICY IF EXISTS "attendance_records_manage" ON public.attendance_records;
CREATE POLICY "attendance_records_manage" ON public.attendance_records FOR ALL
  USING (is_faculty());

DROP POLICY IF EXISTS "student_sub_attend_select" ON public.student_subject_attendance;
CREATE POLICY "student_sub_attend_select" ON public.student_subject_attendance FOR SELECT
  USING (student_id = auth.uid() OR is_faculty());

-- 8. ASSIGNMENTS & SUBMISSIONS POLICIES
DROP POLICY IF EXISTS "assignments_select_policy" ON public.assignments;
CREATE POLICY "assignments_select_policy" ON public.assignments FOR SELECT USING (true);
DROP POLICY IF EXISTS "assignments_manage_policy" ON public.assignments;
CREATE POLICY "assignments_manage_policy" ON public.assignments FOR ALL USING (is_faculty());

DROP POLICY IF EXISTS "submissions_select_policy" ON public.assignment_submissions;
CREATE POLICY "submissions_select_policy" ON public.assignment_submissions FOR SELECT
  USING (student_id = auth.uid() OR is_faculty());
DROP POLICY IF EXISTS "submissions_insert_policy" ON public.assignment_submissions;
CREATE POLICY "submissions_insert_policy" ON public.assignment_submissions FOR INSERT
  WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "submissions_update_policy" ON public.assignment_submissions;
CREATE POLICY "submissions_update_policy" ON public.assignment_submissions FOR UPDATE
  USING (is_faculty());

-- 9. FEEDBACK & AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "feedback_insert_policy" ON public.feedback;
CREATE POLICY "feedback_insert_policy" ON public.feedback FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "feedback_select_policy" ON public.feedback;
CREATE POLICY "feedback_select_policy" ON public.feedback FOR SELECT
  USING (user_id = auth.uid() OR is_faculty());
DROP POLICY IF EXISTS "feedback_update_policy" ON public.feedback;
CREATE POLICY "feedback_update_policy" ON public.feedback FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs FOR SELECT
  USING (is_admin());
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKETS CONFIGURATION (Supabase Storage)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('study_materials', 'study_materials', true),
  ('notice_attachments', 'notice_attachments', true),
  ('assignment_submissions', 'assignment_submissions', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_user_upload" ON storage.objects;
CREATE POLICY "avatars_user_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "study_materials_public_read" ON storage.objects;
CREATE POLICY "study_materials_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'study_materials');

DROP POLICY IF EXISTS "study_materials_faculty_insert" ON storage.objects;
CREATE POLICY "study_materials_faculty_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'study_materials' AND is_faculty());

DROP POLICY IF EXISTS "notices_public_read" ON storage.objects;
CREATE POLICY "notices_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'notice_attachments');

DROP POLICY IF EXISTS "notices_faculty_insert" ON storage.objects;
CREATE POLICY "notices_faculty_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'notice_attachments' AND is_faculty());

DROP POLICY IF EXISTS "submissions_select" ON storage.objects;
CREATE POLICY "submissions_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'assignment_submissions' AND (auth.uid()::text = (storage.foldername(name))[1] OR is_faculty()));

DROP POLICY IF EXISTS "submissions_insert" ON storage.objects;
CREATE POLICY "submissions_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assignment_submissions' AND auth.uid() IS NOT NULL);

-- Refresh PostgREST schema cache immediately on commit
NOTIFY pgrst, 'reload schema';

COMMIT;
