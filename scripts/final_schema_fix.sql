-- 1. ADD ALL MISSING COLUMNS
-- This ensures that category, source, notes, and file_url exist alongside case_id
ALTER TABLE public.evidence_metadata ADD COLUMN IF NOT EXISTS case_id TEXT REFERENCES public.cases(id) ON DELETE SET NULL;
ALTER TABLE public.evidence_metadata ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.evidence_metadata ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.evidence_metadata ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.evidence_metadata ADD COLUMN IF NOT EXISTS file_url TEXT;

-- 2. FORCE RELOAD SCHEMA CACHE
-- This instantly tells Supabase's API to recognize the new columns
NOTIFY pgrst, 'reload schema';
