-- Add the 'role' column to the users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='role'
  ) THEN
    ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'Investigating Officer';
  END IF;
END $$;
