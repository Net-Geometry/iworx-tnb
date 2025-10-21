-- 1. Add column for public access control to the base assets table
ALTER TABLE assets_service.assets 
ADD COLUMN IF NOT EXISTS allow_public_access boolean DEFAULT true;

-- 2. Create public asset info function that returns only safe, non-sensitive data
CREATE OR REPLACE FUNCTION public.get_public_asset_info(p_asset_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  asset_number text,
  type text,
  category text,
  manufacturer text,
  model text,
  serial_number text,
  location text,
  status text,
  asset_image_url text,
  qr_code_data text,
  allow_public_access boolean,
  organization_id uuid
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.asset_number,
    a.type,
    a.category,
    a.manufacturer,
    a.model,
    a.serial_number,
    a.location,
    a.status,
    a.asset_image_url,
    a.qr_code_data,
    COALESCE(a.allow_public_access, true) as allow_public_access,
    a.organization_id
  FROM assets_service.assets a
  WHERE a.id = p_asset_id
    AND COALESCE(a.allow_public_access, true) = true;
END;
$$ LANGUAGE plpgsql;

-- 3. Grant execute permission on the function to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_public_asset_info(uuid) TO anon, authenticated;

-- 4. Create audit log table for tracking public access
CREATE TABLE IF NOT EXISTS public.public_asset_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid,
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address text,
  user_agent text,
  referer text
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_public_access_log_asset_id ON public.public_asset_access_log(asset_id);
CREATE INDEX IF NOT EXISTS idx_public_access_log_accessed_at ON public.public_asset_access_log(accessed_at);

-- 6. Enable RLS on audit log table
ALTER TABLE public.public_asset_access_log ENABLE ROW LEVEL SECURITY;

-- 7. Allow anonymous users to insert access logs
CREATE POLICY "Allow public insert to access log"
ON public.public_asset_access_log
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 8. Allow authenticated users to view logs for their organization's assets
CREATE POLICY "Users can view access logs for their organization"
ON public.public_asset_access_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM assets_service.assets
    WHERE assets_service.assets.id = public_asset_access_log.asset_id
    AND assets_service.assets.organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  )
);