-- Update public.crafts view to include the rate column
CREATE OR REPLACE VIEW public.crafts
WITH (security_invoker=true)
AS SELECT 
    id,
    organization_id,
    name,
    contract,
    description,
    is_active,
    created_at,
    updated_at,
    skill_level,
    vendor_id,
    rate
FROM people_service.crafts;
