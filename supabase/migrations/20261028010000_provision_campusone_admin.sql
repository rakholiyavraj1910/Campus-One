-- ==============================================================================
-- CampusOne Administrator Account Provisioning Migration
-- Migration: 20261028010000_provision_campusone_admin.sql
-- Description:
--   Provisions the dedicated institutional administrator account for
--   username: vibhusuvaliyacampusone (email: vibhusuvaliyacampusone@gpahmedabad.ac.in)
--   Ensures email confirmation in auth.users and sets role = 'admin' in public.profiles.
-- ==============================================================================

-- 1. Ensure prevent_role_escalation permits database-level migrations (auth.uid() IS NULL)
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Strict Privilege Separation: Non-admins cannot alter their role, approval status, CGPA, ID, or email
  -- When auth.uid() IS NULL, the operation is an internal migration or postgres superuser command
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
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

-- 2. Provision or Confirm the Admin Account in auth.users and public.profiles
DO $$
DECLARE
  v_user_id UUID;
  v_encrypted_pw TEXT;
BEGIN
  -- Generate bcrypt password hash for 'vibhu1411' using standard pgcrypto
  v_encrypted_pw := extensions.crypt('vibhu1411', extensions.gen_salt('bf', 10));

  -- Check if user already exists in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email IN ('vibhusuvaliyacampusone@gpahmedabad.ac.in', 'vibhusuvaliyacampusone@campusone.edu')
  LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-00-00-00-00-00000000-0000',
      v_user_id,
      'authenticated',
      'authenticated',
      'vibhusuvaliyacampusone@gpahmedabad.ac.in',
      v_encrypted_pw,
      pg_catalog.now(),
      pg_catalog.now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "Vibhu Suvaliya", "role": "admin"}'::jsonb,
      pg_catalog.now(),
      pg_catalog.now()
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_user_id,
      format('{"sub":"%s","email":"%s"}', v_user_id, 'vibhusuvaliyacampusone@gpahmedabad.ac.in')::jsonb,
      'email',
      pg_catalog.now(),
      pg_catalog.now(),
      pg_catalog.now()
    );
  ELSE
    -- Confirm existing user and update password hash
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_pw,
      email_confirmed_at = COALESCE(email_confirmed_at, pg_catalog.now()),
      confirmed_at = COALESCE(confirmed_at, pg_catalog.now()),
      raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{name}',
        '"Vibhu Suvaliya"'
      ),
      updated_at = pg_catalog.now()
    WHERE id = v_user_id;
  END IF;

  -- 3. Upsert into public.profiles with administrative role and clearance
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
    v_user_id,
    'vibhusuvaliyacampusone@gpahmedabad.ac.in',
    'Vibhu Suvaliya',
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
    name = 'Vibhu Suvaliya',
    designation = 'Chief Administrative Officer',
    department = 'Central Administration',
    updated_at = pg_catalog.now();

END $$;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
