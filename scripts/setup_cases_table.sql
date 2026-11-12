-- scripts/setup_cases_table.sql
-- Create the cases table
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    status TEXT DEFAULT 'active'::text,
    priority TEXT DEFAULT 'medium'::text,
    assignee TEXT DEFAULT 'Unassigned'::text,
    progress INTEGER DEFAULT 0,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated read access" 
    ON public.cases 
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated insert access" 
    ON public.cases 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" 
    ON public.cases 
    FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete access" 
    ON public.cases 
    FOR DELETE 
    TO authenticated 
    USING (true);

-- Allow anon read/write for development purposes (if necessary, uncomment below)
-- CREATE POLICY "Allow anon select" ON public.cases FOR SELECT TO anon USING (true);
-- CREATE POLICY "Allow anon insert" ON public.cases FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow anon update" ON public.cases FOR UPDATE TO anon USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow anon delete" ON public.cases FOR DELETE TO anon USING (true);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_cases_updated_at ON public.cases;
CREATE TRIGGER set_cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
