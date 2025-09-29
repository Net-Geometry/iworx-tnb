-- Add new columns to assets table for comprehensive asset management
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS category character varying,
ADD COLUMN IF NOT EXISTS subcategory character varying,
ADD COLUMN IF NOT EXISTS parent_asset_id uuid REFERENCES public.assets(id),
ADD COLUMN IF NOT EXISTS purchase_cost numeric(12,2),
ADD COLUMN IF NOT EXISTS warranty_expiry_date date,
ADD COLUMN IF NOT EXISTS asset_image_url text,
ADD COLUMN IF NOT EXISTS qr_code_data text;

-- Create storage buckets for asset files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('asset-images', 'asset-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('asset-documents', 'asset-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create asset_documents table to track uploaded documents
CREATE TABLE IF NOT EXISTS public.asset_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_type text NOT NULL,
    file_size bigint,
    uploaded_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on asset_documents
ALTER TABLE public.asset_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for asset_documents
CREATE POLICY "Anyone can view asset documents" 
ON public.asset_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage asset documents" 
ON public.asset_documents 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Storage policies for asset-images bucket
CREATE POLICY "Asset images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'asset-images');

CREATE POLICY "Authenticated users can upload asset images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'asset-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update asset images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'asset-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete asset images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'asset-images' AND auth.uid() IS NOT NULL);

-- Storage policies for asset-documents bucket
CREATE POLICY "Authenticated users can view asset documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'asset-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload asset documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'asset-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update asset documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'asset-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete asset documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'asset-documents' AND auth.uid() IS NOT NULL);