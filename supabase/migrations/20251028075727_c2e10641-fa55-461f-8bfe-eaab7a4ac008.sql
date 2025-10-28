-- Fix the get_public_asset_info function to use correct column name
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
) AS $$
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
    -- Convert geography point to human-readable text
    CASE 
      WHEN a.current_location IS NOT NULL 
      THEN ST_AsText(a.current_location::geometry)
      ELSE NULL
    END as location,
    a.status,
    a.asset_image_url,
    a.qr_code_data,
    COALESCE(a.allow_public_access, true) as allow_public_access,
    a.organization_id
  FROM assets_service.assets a
  WHERE a.id = p_asset_id
    AND COALESCE(a.allow_public_access, true) = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure permissions are correct
GRANT EXECUTE ON FUNCTION public.get_public_asset_info(uuid) TO anon, authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_public_asset_info IS 'Returns public asset information without authentication. Only returns assets with allow_public_access=true. Location is converted from PostGIS geography to WKT text format.';