-- ══════════════════════════════════════════════════════════════════════════════
-- CrimeGPT: Grant Administrators UPDATE access on public.users
-- ══════════════════════════════════════════════════════════════════════════════

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it already exists to prevent duplicate errors
DROP POLICY IF EXISTS "Allow admins to update user roles" ON public.users;

-- Create the policy: Allow users to UPDATE rows IF their own rank is 'Administrator'
CREATE POLICY "Allow admins to update user roles"
ON public.users
FOR UPDATE
USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.users WHERE rank = 'Administrator'))
WITH CHECK (true);

-- Optional: If admins also need to DELETE users (Revoke Access button)
DROP POLICY IF EXISTS "Allow admins to delete users" ON public.users;
CREATE POLICY "Allow admins to delete users"
ON public.users
FOR DELETE
USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.users WHERE rank = 'Administrator'));
