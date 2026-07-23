-- Enable RLS on the users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to view all users
DROP POLICY IF EXISTS "Allow users to view all profiles" ON public.users;
CREATE POLICY "Allow users to view all profiles" 
ON public.users FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policy to allow updates (Administrators)
DROP POLICY IF EXISTS "Allow admins to update users" ON public.users;
CREATE POLICY "Allow admins to update users" 
ON public.users FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Policy to allow deletes (Administrators)
DROP POLICY IF EXISTS "Allow admins to delete users" ON public.users;
CREATE POLICY "Allow admins to delete users" 
ON public.users FOR DELETE 
USING (auth.role() = 'authenticated');
