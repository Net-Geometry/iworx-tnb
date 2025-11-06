-- Create all required storage buckets (will skip if already exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES 
  ('asset-images', 'asset-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('asset-documents', 'asset-documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]),
  ('asset-3d-models', 'asset-3d-models', true, 52428800, ARRAY['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']::text[]),
  ('incident-attachments', 'incident-attachments', false, 10485760, NULL)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for asset images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload images to their organization" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their organization images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their organization images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their organization documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents to their organization" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their organization documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their organization documents" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for 3D models" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload 3D models to their organization" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their organization 3D models" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their organization 3D models" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their organization incident attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload incident attachments to their organization" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their organization incident attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their organization incident attachments" ON storage.objects;

-- =============================================
-- ASSET IMAGES BUCKET POLICIES (Public Bucket)
-- =============================================

CREATE POLICY "Public read access for asset images"
ON storage.objects FOR SELECT
USING (bucket_id = 'asset-images');

CREATE POLICY "Users can upload images to their organization"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their organization images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'asset-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete their organization images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'asset-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- ASSET DOCUMENTS BUCKET POLICIES (Private Bucket)
-- =============================================

CREATE POLICY "Users can view their organization documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'asset-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can upload documents to their organization"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'asset-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their organization documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'asset-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete their organization documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'asset-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- ASSET 3D MODELS BUCKET POLICIES (Public Bucket)
-- =============================================

CREATE POLICY "Public read access for 3D models"
ON storage.objects FOR SELECT
USING (bucket_id = 'asset-3d-models');

CREATE POLICY "Users can upload 3D models to their organization"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'asset-3d-models'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their organization 3D models"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'asset-3d-models'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete their organization 3D models"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'asset-3d-models'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- INCIDENT ATTACHMENTS BUCKET POLICIES (Private Bucket)
-- =============================================

CREATE POLICY "Users can view their organization incident attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'incident-attachments'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can upload incident attachments to their organization"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'incident-attachments'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their organization incident attachments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'incident-attachments'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete their organization incident attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'incident-attachments'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT current_organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);