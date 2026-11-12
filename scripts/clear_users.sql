-- 1. Unlink demo/test users from cases to prevent foreign key constraint violations
UPDATE public.cases
SET user_id = NULL
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- 2. Delete from public profiles table
DELETE FROM public.users
WHERE email LIKE '%@example.com';

-- 3. Delete from auth.users table
DELETE FROM auth.users
WHERE email LIKE '%@example.com';
