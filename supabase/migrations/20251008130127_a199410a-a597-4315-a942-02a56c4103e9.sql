-- Add 3D model fields to assets table in assets_service schema
ALTER TABLE assets_service.assets
ADD COLUMN IF NOT EXISTS model_3d_url text,
ADD COLUMN IF NOT EXISTS model_3d_scale jsonb DEFAULT '{"x": 1, "y": 1, "z": 1}'::jsonb,
ADD COLUMN IF NOT EXISTS model_3d_rotation jsonb DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb;

-- Create storage bucket for 3D models
INSERT INTO storage.buckets (id, name, public)
VALUES ('asset-3d-models', 'asset-3d-models', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for asset-3d-models bucket
CREATE POLICY "Users can view 3D models from their organization"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'asset-3d-models' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM assets_service.assets 
    WHERE organization_id = ANY(get_user_organizations(auth.uid()))
  )
);

CREATE POLICY "Users can upload 3D models to their organization folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'asset-3d-models' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM assets_service.assets 
    WHERE organization_id = ANY(get_user_organizations(auth.uid()))
  )
);

CREATE POLICY "Users can update their organization's 3D models"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'asset-3d-models' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM assets_service.assets 
    WHERE organization_id = ANY(get_user_organizations(auth.uid()))
  )
);

CREATE POLICY "Users can delete their organization's 3D models"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'asset-3d-models' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM assets_service.assets 
    WHERE organization_id = ANY(get_user_organizations(auth.uid()))
  )
);