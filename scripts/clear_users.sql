-- 1. Unlink users from cases to prevent foreign key constraint violations
UPDATE public.cases 
SET user_id = NULL 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%miteshsinghvi%'
);

-- 2. Delete from public profiles table
DELETE FROM public.users 
WHERE email LIKE '%miteshsinghvi%';

-- 3. Delete from auth.users table (This will completely clear the users)
DELETE FROM auth.users 
WHERE email LIKE '%miteshsinghvi%';
