-- Create public views for PM schedule related tables
-- These views point to workorder_service schema tables to make them accessible via public schema

-- Create view for PM schedule assignments
CREATE VIEW public.pm_schedule_assignments AS 
SELECT * FROM workorder_service.pm_schedule_assignments;

-- Create view for PM schedule history
CREATE VIEW public.pm_schedule_history AS 
SELECT * FROM workorder_service.pm_schedule_history;

-- Create view for PM schedule materials
CREATE VIEW public.pm_schedule_materials AS 
SELECT * FROM workorder_service.pm_schedule_materials;

-- Grant CRUD permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_schedule_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_schedule_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_schedule_materials TO authenticated;

-- Add comments explaining the architecture
COMMENT ON VIEW public.pm_schedule_assignments IS 
'View pointing to workorder_service.pm_schedule_assignments. Managed by work-order-service microservice.';

COMMENT ON VIEW public.pm_schedule_history IS 
'View pointing to workorder_service.pm_schedule_history. Managed by work-order-service microservice.';

COMMENT ON VIEW public.pm_schedule_materials IS 
'View pointing to workorder_service.pm_schedule_materials. Managed by work-order-service microservice.';