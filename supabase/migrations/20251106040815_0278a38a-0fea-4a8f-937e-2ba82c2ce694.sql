-- Add allow_public_access column to assets_service.assets table
ALTER TABLE assets_service.assets 
ADD COLUMN allow_public_access BOOLEAN DEFAULT false;

-- Update the public.assets view to include the new column
CREATE OR REPLACE VIEW public.assets
WITH (security_invoker=true)
AS SELECT 
    id,
    name,
    asset_number,
    type,
    description,
    hierarchy_node_id,
    status,
    health_score,
    criticality,
    manufacturer,
    model,
    serial_number,
    purchase_date,
    last_maintenance_date,
    next_maintenance_date,
    created_at,
    updated_at,
    category,
    subcategory,
    parent_asset_id,
    purchase_cost,
    warranty_expiry_date,
    asset_image_url,
    qr_code_data,
    organization_id,
    current_location,
    last_location_update,
    is_mobile,
    model_3d_url,
    model_3d_scale,
    model_3d_rotation,
    allow_public_access
FROM assets_service.assets;