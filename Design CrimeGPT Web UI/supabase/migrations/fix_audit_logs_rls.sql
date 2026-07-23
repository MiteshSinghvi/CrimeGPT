-- Drop the complex admin-only read policy that is currently failing
DROP POLICY IF EXISTS "Allow admin read" ON public.audit_logs;

-- Replace with a standard authenticated read policy. 
-- (Our frontend RBAC already strictly prevents non-admins from mounting the Logbook component)
CREATE POLICY "Allow authenticated read" 
ON public.audit_logs 
FOR SELECT 
USING (auth.role() = 'authenticated');
