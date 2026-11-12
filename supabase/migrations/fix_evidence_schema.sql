-- Ensure case_id column exists on evidence_metadata table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='evidence_metadata' AND column_name='case_id'
  ) THEN
    -- Changed UUID to TEXT because public.cases(id) is a TEXT field in our schema (e.g. 'ACCB-2024-0847')
    ALTER TABLE public.evidence_metadata ADD COLUMN case_id TEXT REFERENCES public.cases(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ensure case_id column exists on evidence table (in case it exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name='evidence'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='evidence' AND column_name='case_id'
  ) THEN
    ALTER TABLE public.evidence ADD COLUMN case_id TEXT REFERENCES public.cases(id) ON DELETE SET NULL;
  END IF;
END $$;
