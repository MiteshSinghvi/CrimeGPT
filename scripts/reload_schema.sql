-- Force add the column if the IF NOT EXISTS block failed for some reason
ALTER TABLE public.evidence_metadata ADD COLUMN IF NOT EXISTS case_id TEXT REFERENCES public.cases(id) ON DELETE SET NULL;

-- VERY IMPORTANT: Force Supabase to reload its API schema cache so it recognizes the new case_id column!
NOTIFY pgrst, 'reload schema';
