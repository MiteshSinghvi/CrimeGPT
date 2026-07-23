CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert a log
CREATE POLICY "Allow authenticated inserts" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ONLY Admins can read the logs
CREATE POLICY "Allow admin read" ON public.audit_logs FOR SELECT USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'Administrator'
);
