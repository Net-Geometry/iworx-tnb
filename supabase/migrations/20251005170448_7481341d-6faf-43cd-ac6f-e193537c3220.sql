-- Create public.pm_schedule_assignments view
CREATE OR REPLACE VIEW public.pm_schedule_assignments AS 
SELECT * FROM workorder_service.pm_schedule_assignments;

-- Create public.pm_schedule_materials view
CREATE OR REPLACE VIEW public.pm_schedule_materials AS 
SELECT * FROM workorder_service.pm_schedule_materials;