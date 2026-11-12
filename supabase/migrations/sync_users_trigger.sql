-- ══════════════════════════════════════════════════════════════════════════════
-- CrimeGPT: Automate User Profile Synchronization
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Create the function that copies the data from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, badge_number, rank)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'badge_number',
    new.raw_user_meta_data->>'rank'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Create the trigger that fires the function every time a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
