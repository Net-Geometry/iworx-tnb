-- Create all required storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES 
  ('asset-images', 'asset-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('asset-documents', 'asset-documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]),
  ('asset-3d-models', 'asset-3d-models', true, 52428800, ARRAY['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']::text[]),
  ('incident-attachments', 'incident-attachments', false, 10485760, NULL)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ASSET IMAGES BUCKET POLICIES (Public Bucket)
-- =============================================

-- Public read access for asset images
CREATE POLICY "Public read access for asset images"
ON storage.objects FOR SELECT
USING (bucket_id = 'asset-images');

-- Authenticated users can upload images to their organization folder
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

-- Users can update images in their organization folder
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

-- Users can delete images from their organization folder
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

-- Users can view documents from their organization
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

-- Users can upload documents to their organization folder
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

-- Users can update documents in their organization folder
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

-- Users can delete documents from their organization folder
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

-- Public read access for 3D models (needed for viewer)
CREATE POLICY "Public read access for 3D models"
ON storage.objects FOR SELECT
USING (bucket_id = 'asset-3d-models');

-- Users can upload 3D models to their organization folder
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

-- Users can update 3D models in their organization folder
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

-- Users can delete 3D models from their organization folder
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

-- Users can view incident attachments from their organization
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

-- Users can upload incident attachments to their organization folder
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

-- Users can update incident attachments in their organization folder
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

-- Users can delete incident attachments from their organization folder
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