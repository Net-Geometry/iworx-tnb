-- Drop existing public tables (data already copied to meters_service)
DROP TABLE IF EXISTS public.meters CASCADE;
DROP TABLE IF EXISTS public.meter_groups CASCADE;
DROP TABLE IF EXISTS public.meter_group_assignments CASCADE;

-- Create backward-compatible views in public schema pointing to meters_service
CREATE OR REPLACE VIEW public.meters AS 
SELECT * FROM meters_service.meters;

CREATE OR REPLACE VIEW public.meter_groups AS 
SELECT * FROM meters_service.groups;

CREATE OR REPLACE VIEW public.meter_group_assignments AS 
SELECT * FROM meters_service.group_assignments;

-- Grant permissions on views
GRANT SELECT ON public.meters TO authenticated, service_role;
GRANT SELECT ON public.meter_groups TO authenticated, service_role;
GRANT SELECT ON public.meter_group_assignments TO authenticated, service_role;

COMMENT ON VIEW public.meters IS 'Backward-compatible view proxying to meters_service.meters';
COMMENT ON VIEW public.meter_groups IS 'Backward-compatible view proxying to meters_service.groups';
COMMENT ON VIEW public.meter_group_assignments IS 'Backward-compatible view proxying to meters_service.group_assignments';