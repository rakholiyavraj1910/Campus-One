-- ==============================================================================
-- CampusOne Migration: Faculty Portal Permissions, Content Ownership & Storage
-- File: supabase/migrations/20261028080000_faculty_portal_permissions_and_storage.sql
-- ==============================================================================

BEGIN;

-- 1. Extend notices table with creator identity, status, and audience targeting
ALTER TABLE public.notices 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published',
  ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'All';

-- 2. Extend study_materials table with creator identity, description, and storage path
ALTER TABLE public.study_materials
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- 3. Extend events table with creator identity, department, and audience targeting
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'All',
  ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'All';

-- ==============================================================================
-- 4. RLS POLICIES FOR NOTICES
-- ==============================================================================
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notices_select_policy" ON public.notices;
CREATE POLICY "notices_select_policy" 
  ON public.notices FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "notices_insert_policy" ON public.notices;
CREATE POLICY "notices_insert_policy" 
  ON public.notices FOR INSERT 
  WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "notices_update_policy" ON public.notices;
CREATE POLICY "notices_update_policy" 
  ON public.notices FOR UPDATE 
  USING (
    public.is_admin() OR 
    (public.is_faculty() AND (
      created_by = auth.uid() OR 
      created_by IS NULL OR 
      author = (SELECT name FROM public.profiles WHERE id = auth.uid())
    ))
  );

DROP POLICY IF EXISTS "notices_delete_policy" ON public.notices;
CREATE POLICY "notices_delete_policy" 
  ON public.notices FOR DELETE 
  USING (
    public.is_admin() OR 
    (public.is_faculty() AND (
      created_by = auth.uid() OR 
      author = (SELECT name FROM public.profiles WHERE id = auth.uid())
    ))
  );

-- ==============================================================================
-- 5. RLS POLICIES FOR STUDY MATERIALS
-- ==============================================================================
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "materials_select_policy" ON public.study_materials;
CREATE POLICY "materials_select_policy" 
  ON public.study_materials FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "materials_insert_policy" ON public.study_materials;
CREATE POLICY "materials_insert_policy" 
  ON public.study_materials FOR INSERT 
  WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "materials_update_policy" ON public.study_materials;
CREATE POLICY "materials_update_policy" 
  ON public.study_materials FOR UPDATE 
  USING (
    public.is_admin() OR 
    (public.is_faculty() AND (
      created_by = auth.uid() OR 
      created_by IS NULL OR 
      uploaded_by = (SELECT name FROM public.profiles WHERE id = auth.uid())
    ))
  );

DROP POLICY IF EXISTS "materials_delete_policy" ON public.study_materials;
CREATE POLICY "materials_delete_policy" 
  ON public.study_materials FOR DELETE 
  USING (
    public.is_admin() OR 
    (public.is_faculty() AND (
      created_by = auth.uid() OR 
      uploaded_by = (SELECT name FROM public.profiles WHERE id = auth.uid())
    ))
  );

-- ==============================================================================
-- 6. RLS POLICIES FOR EVENTS
-- ==============================================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_policy" ON public.events;
CREATE POLICY "events_select_policy" 
  ON public.events FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
CREATE POLICY "events_insert_policy" 
  ON public.events FOR INSERT 
  WITH CHECK (public.is_faculty());

DROP POLICY IF EXISTS "events_update_policy" ON public.events;
CREATE POLICY "events_update_policy" 
  ON public.events FOR UPDATE 
  USING (
    public.is_admin() OR 
    (public.is_faculty() AND (
      created_by = auth.uid() OR 
      created_by IS NULL OR 
      organizer ILIKE '%' || (SELECT name FROM public.profiles WHERE id = auth.uid()) || '%'
    ))
  );

DROP POLICY IF EXISTS "events_delete_policy" ON public.events;
CREATE POLICY "events_delete_policy" 
  ON public.events FOR DELETE 
  USING (
    public.is_admin() OR 
    (public.is_faculty() AND (
      created_by = auth.uid() OR 
      organizer ILIKE '%' || (SELECT name FROM public.profiles WHERE id = auth.uid()) || '%'
    ))
  );

-- ==============================================================================
-- 7. STORAGE POLICIES FOR STUDY MATERIALS & NOTICES
-- ==============================================================================

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('study_materials', 'study_materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('notice_attachments', 'notice_attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- study_materials storage permissions
DROP POLICY IF EXISTS "study_materials_public_read" ON storage.objects;
CREATE POLICY "study_materials_public_read" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'study_materials');

DROP POLICY IF EXISTS "study_materials_faculty_insert" ON storage.objects;
CREATE POLICY "study_materials_faculty_insert" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'study_materials' AND public.is_faculty());

DROP POLICY IF EXISTS "study_materials_faculty_update" ON storage.objects;
CREATE POLICY "study_materials_faculty_update" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'study_materials' AND public.is_faculty());

DROP POLICY IF EXISTS "study_materials_faculty_delete" ON storage.objects;
CREATE POLICY "study_materials_faculty_delete" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'study_materials' AND public.is_faculty());

-- notice_attachments storage permissions
DROP POLICY IF EXISTS "notices_public_read" ON storage.objects;
CREATE POLICY "notices_public_read" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'notice_attachments');

DROP POLICY IF EXISTS "notices_faculty_insert" ON storage.objects;
CREATE POLICY "notices_faculty_insert" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'notice_attachments' AND public.is_faculty());

DROP POLICY IF EXISTS "notices_faculty_update" ON storage.objects;
CREATE POLICY "notices_faculty_update" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'notice_attachments' AND public.is_faculty());

DROP POLICY IF EXISTS "notices_faculty_delete" ON storage.objects;
CREATE POLICY "notices_faculty_delete" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'notice_attachments' AND public.is_faculty());

COMMIT;
