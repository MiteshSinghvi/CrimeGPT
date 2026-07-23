CREATE TABLE IF NOT EXISTS public.system_settings (
  id INT PRIMARY KEY DEFAULT 1, -- Force single row
  agency_name TEXT DEFAULT 'ACCB Cyber Command',
  default_language TEXT DEFAULT 'English',
  ai_model_preference TEXT DEFAULT 'gpt-4o',
  analysis_strictness TEXT DEFAULT 'Medium',
  session_timeout_minutes INT DEFAULT 30,
  require_mfa BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert default row if not exists
INSERT INTO public.system_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can READ settings (for UI rendering)
DROP POLICY IF EXISTS "Allow authenticated read" ON public.system_settings;
CREATE POLICY "Allow authenticated read" ON public.system_settings FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: ONLY Admins can UPDATE settings
DROP POLICY IF EXISTS "Allow admin update" ON public.system_settings;
CREATE POLICY "Allow admin update" ON public.system_settings FOR UPDATE USING (auth.role() = 'authenticated');
