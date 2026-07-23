-- 0. Fix Foreign Key Reference Block Before Deletion
-- Ensure the cases table has the updated_at column so the trigger doesn't crash on updates
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Safely unlink cases from users being reset to prevent foreign key errors
UPDATE public.cases 
SET user_id = NULL 
WHERE user_id IS NOT NULL;

-- Upgrade the foreign key constraint to automatically set user_id to NULL if an officer account is deleted
ALTER TABLE public.cases 
  DROP CONSTRAINT IF EXISTS cases_user_id_fkey;

ALTER TABLE public.cases 
  ADD CONSTRAINT cases_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE SET NULL;

-- 1. Wipe existing test accounts from auth.users
DELETE FROM auth.users WHERE email IN (
  'miteshsinghvi2007@gmail.com',
  'miteshsinghvi200@gmail.com',
  'miteshsinghvi20@gmail.com',
  'miteshsinghvi2@gmail.com',
  'miteshsinghvi@gmail.com',
  'test_user_crimegpt@example.com',
  'officer@accb.gov.in'
);

-- 2. Wipe public.users table to ensure no conflicts with unique constraints
DELETE FROM public.users WHERE email IN (
  'miteshsinghvi2007@gmail.com',
  'miteshsinghvi200@gmail.com',
  'miteshsinghvi20@gmail.com',
  'miteshsinghvi2@gmail.com',
  'miteshsinghvi@gmail.com',
  'test_user_crimegpt@example.com',
  'officer@accb.gov.in'
);

-- 3. Apply Anon Badge Lookup Policy (If not already applied in restore_users_table)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Allow anon badge lookup for login' 
        AND tablename = 'users'
    ) THEN
        CREATE POLICY "Allow anon badge lookup for login" ON public.users 
        FOR SELECT TO anon USING (true);
    END IF;
END
$$;

-- 4. Reload Schema
NOTIFY pgrst, 'reload schema';
