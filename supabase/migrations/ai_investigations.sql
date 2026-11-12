-- ══════════════════════════════════════════════════════════════════
-- CrimeGPT: ai_investigations table
-- Run this in Supabase SQL Editor to enable the history feature.
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.ai_investigations (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  -- SEC-11: Add user ownership column so RLS can scope per-officer
  user_id       uuid references auth.users(id) default auth.uid(),
  raw_narrative text not null,
  analysis_json jsonb not null
);

-- Index for fast descending time queries
create index if not exists ai_investigations_created_at_idx
  on public.ai_investigations (created_at desc);

-- Index on user_id for fast per-officer filtering
create index if not exists ai_investigations_user_id_idx
  on public.ai_investigations (user_id);

-- Enable Row-Level Security
alter table public.ai_investigations enable row level security;

-- SEC-11: Drop old broad policies and replace with user-scoped ones
drop policy if exists "Authenticated users can read investigations" on public.ai_investigations;
drop policy if exists "Authenticated users can insert investigations" on public.ai_investigations;

-- Officers can only read their own past analyses
create policy "Officers read own investigations"
  on public.ai_investigations
  for select
  using (user_id = auth.uid());

-- Officers can only insert under their own user_id
create policy "Officers insert own investigations"
  on public.ai_investigations
  for insert
  with check (user_id = auth.uid());

-- Officers can delete their own investigations (history cleanup)
create policy "Officers delete own investigations"
  on public.ai_investigations
  for delete
  using (user_id = auth.uid());
