-- ══════════════════════════════════════════════════════════════════════════════
-- CrimeGPT: Fix Foreign Key Cascade Constraints (v3 — column-safe)
-- Run this in the Supabase SQL Editor.
--
-- What's new in v3:
--   Each step first ensures the FK column EXISTS before adding the constraint.
--   This prevents "column does not exist" errors on tables that were created
--   without the user_id column in the live database.
-- ══════════════════════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 1: public.users  (id → auth.users.id)
-- Profile rows are personal — CASCADE delete with the auth account.
-- ══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  -- Drop every existing FK from public.users → auth.users
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid  = 'public.users'::regclass
      AND contype   = 'f'
      AND confrelid = 'auth.users'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT IF EXISTS %I', r.conname);
    RAISE NOTICE 'Dropped % on public.users', r.conname;
  END LOOP;
END $$;

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- The users table uses id (not user_id) as the FK column
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;


-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 2: public.cases  (user_id → auth.users.id)
-- Cases are departmental records — SET NULL on delete (preserve the case).
-- ══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  -- 1. Ensure user_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'cases'
      AND column_name  = 'user_id'
  ) THEN
    ALTER TABLE public.cases ADD COLUMN user_id UUID;
    RAISE NOTICE 'Added user_id column to public.cases';
  END IF;

  -- 2. Drop every existing FK on that column
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid  = 'public.cases'::regclass
      AND contype   = 'f'
      AND confrelid = 'auth.users'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS %I', r.conname);
    RAISE NOTICE 'Dropped % on public.cases', r.conname;
  END LOOP;
END $$;

ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_user_id_fkey;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;


-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 3: public.evidence_metadata  (user_id → auth.users.id)
-- Forensic evidence is immutable — SET NULL on delete (preserve the record).
-- ══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  -- 1. Ensure user_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'evidence_metadata'
      AND column_name  = 'user_id'
  ) THEN
    ALTER TABLE public.evidence_metadata ADD COLUMN user_id UUID;
    RAISE NOTICE 'Added user_id column to public.evidence_metadata';
  END IF;

  -- 2. Drop every existing FK on that column
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid  = 'public.evidence_metadata'::regclass
      AND contype   = 'f'
      AND confrelid = 'auth.users'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.evidence_metadata DROP CONSTRAINT IF EXISTS %I', r.conname);
    RAISE NOTICE 'Dropped % on public.evidence_metadata', r.conname;
  END LOOP;
END $$;

ALTER TABLE public.evidence_metadata DROP CONSTRAINT IF EXISTS evidence_metadata_user_id_fkey;

ALTER TABLE public.evidence_metadata
  ADD CONSTRAINT evidence_metadata_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;


-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 4: public.ai_investigations  (user_id → auth.users.id)
-- Investigation history is personal — CASCADE delete with the auth account.
-- ══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  -- 1. Ensure user_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'ai_investigations'
      AND column_name  = 'user_id'
  ) THEN
    ALTER TABLE public.ai_investigations ADD COLUMN user_id UUID;
    RAISE NOTICE 'Added user_id column to public.ai_investigations';
  END IF;

  -- 2. Drop every existing FK on that column
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid  = 'public.ai_investigations'::regclass
      AND contype   = 'f'
      AND confrelid = 'auth.users'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.ai_investigations DROP CONSTRAINT IF EXISTS %I', r.conname);
    RAISE NOTICE 'Dropped % on public.ai_investigations', r.conname;
  END LOOP;
END $$;

ALTER TABLE public.ai_investigations DROP CONSTRAINT IF EXISTS ai_investigations_user_id_fkey;

ALTER TABLE public.ai_investigations
  ADD CONSTRAINT ai_investigations_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;


-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 5: public.audit_logs  (user_id → auth.users.id)
-- Audit trail must survive account deletion — SET NULL on delete.
-- ══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  -- 1. Ensure user_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'audit_logs'
      AND column_name  = 'user_id'
  ) THEN
    ALTER TABLE public.audit_logs ADD COLUMN user_id UUID;
    RAISE NOTICE 'Added user_id column to public.audit_logs';
  END IF;

  -- 2. Drop every existing FK on that column
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid  = 'public.audit_logs'::regclass
      AND contype   = 'f'
      AND confrelid = 'auth.users'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS %I', r.conname);
    RAISE NOTICE 'Dropped % on public.audit_logs', r.conname;
  END LOOP;
END $$;

ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;


-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION — run this after the migration to confirm all 5 constraints
-- ══════════════════════════════════════════════════════════════════════════════
SELECT
  tc.table_name,
  kcu.column_name,
  rc.delete_rule AS on_delete
FROM information_schema.table_constraints      AS tc
JOIN information_schema.key_column_usage       AS kcu ON tc.constraint_name  = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc  ON tc.constraint_name  = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema   = 'auth'
  AND ccu.table_name     = 'users'
ORDER BY tc.table_name;
