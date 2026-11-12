-- Enable RLS on evidence_metadata table if not already enabled
ALTER TABLE public.evidence_metadata ENABLE ROW LEVEL SECURITY;

-- Allow all read/write operations on evidence_metadata table for authenticated users / public during dev
DROP POLICY IF EXISTS "Allow authenticated users to insert evidence" ON public.evidence_metadata;
CREATE POLICY "Allow authenticated users to insert evidence" 
ON public.evidence_metadata FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to view evidence" ON public.evidence_metadata;
CREATE POLICY "Allow users to view evidence" 
ON public.evidence_metadata FOR SELECT 
USING (true);

-- Allow storage bucket access for evidence-vault
DROP POLICY IF EXISTS "Give public access to evidence-vault" ON storage.objects;
CREATE POLICY "Give public access to evidence-vault"
ON storage.objects FOR SELECT
USING (bucket_id = 'evidence-vault');

DROP POLICY IF EXISTS "Allow authenticated uploads to evidence-vault" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to evidence-vault"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'evidence-vault');
