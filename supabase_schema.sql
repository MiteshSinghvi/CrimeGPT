-- 1. Create cases table
CREATE TABLE public.cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  assignee TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id)
);

-- 2. Create evidence metadata table
CREATE TABLE public.evidence_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_size TEXT NOT NULL,
  sha256_hash TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- 3. Enable RLS (Row Level Security) and add basic policies (Optional but recommended)
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read all cases" ON public.cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users to insert cases" ON public.cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to read evidence" ON public.evidence_metadata FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users to insert evidence" ON public.evidence_metadata FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Note: You also need to create a Storage Bucket named 'evidence_locker' in the Supabase Dashboard
-- Make sure to set the bucket to Public or configure appropriate Storage Policies so your app can upload to it!
