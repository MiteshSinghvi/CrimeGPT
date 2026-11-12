-- scripts/restore_users_table.sql

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  full_name TEXT NOT NULL,
  badge_number TEXT UNIQUE,
  rank TEXT DEFAULT 'Investigating Officer',
  department TEXT DEFAULT 'Cyber Crime Division',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create safe development policies
CREATE POLICY "Allow public read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow anon badge lookup for login" ON public.users FOR SELECT TO anon USING (true);
CREATE POLICY "Allow authenticated insert/update" ON public.users FOR ALL USING (true);

-- Refresh Supabase schema cache
NOTIFY pgrst, 'reload schema';
