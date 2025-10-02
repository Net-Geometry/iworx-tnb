-- Create storage bucket for incident attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-attachments', 'incident-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for incident-attachments bucket
CREATE POLICY "Users can view their organization's incident attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'incident-attachments' AND
  (has_cross_project_access(auth.uid()) OR 
   EXISTS (
     SELECT 1 FROM safety_service.safety_incidents si
     WHERE si.organization_id = ANY (get_user_organizations(auth.uid()))
     AND storage.filename(name) LIKE '%' || si.id::text || '%'
   ))
);

CREATE POLICY "Users can upload incident attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'incident-attachments' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their organization's incident attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'incident-attachments' AND
  (has_cross_project_access(auth.uid()) OR
   EXISTS (
     SELECT 1 FROM safety_service.safety_incidents si
     WHERE si.organization_id = ANY (get_user_organizations(auth.uid()))
     AND storage.filename(name) LIKE '%' || si.id::text || '%'
   ))
);

-- Add attachment columns to safety_incidents table in safety_service schema
ALTER TABLE safety_service.safety_incidents
ADD COLUMN IF NOT EXISTS attachment_urls text[],
ADD COLUMN IF NOT EXISTS attachment_metadata jsonb DEFAULT '[]'::jsonb;