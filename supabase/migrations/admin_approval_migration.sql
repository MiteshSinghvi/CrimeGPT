-- ══════════════════════════════════════════════════════════════════════════════
-- CrimeGPT: Implement Admin Approval Workflow
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Add 'account_status' column to public.users (Defaults to 'pending')
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'pending';

-- Ensure existing users are grandfathered in as 'approved'
UPDATE public.users SET account_status = 'approved' WHERE account_status = 'pending';

-- 2. Update the Trigger Function
-- This ensures that when a new user signs up in auth.users, they are inserted with a 'pending' status.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, badge_number, rank, account_status)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'badge_number',
    new.raw_user_meta_data->>'rank',
    'pending'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
