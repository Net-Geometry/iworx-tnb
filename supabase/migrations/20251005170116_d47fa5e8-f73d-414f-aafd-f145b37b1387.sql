-- Create public.work_orders view pointing to workorder_service.work_orders
CREATE OR REPLACE VIEW public.work_orders AS 
SELECT * FROM workorder_service.work_orders;

-- Recreate public.pm_schedules view pointing to workorder_service.pm_schedules
-- Map columns correctly based on actual schema
DROP VIEW IF EXISTS public.pm_schedules CASCADE;

CREATE OR REPLACE VIEW public.pm_schedules AS 
SELECT 
  id,
  organization_id,
  title as name,  -- Map title to name for backward compatibility
  description,
  frequency_type::text as frequency_type,
  frequency_value,
  frequency_unit::text as frequency_unit,
  start_date,
  next_due_date,
  last_completed_date,
  is_active,
  status::text as status,
  asset_id,
  job_plan_id,
  assigned_to as assigned_person_id,  -- Map assigned_to to assigned_person_id
  route_id as maintenance_route_id,   -- Map route_id to maintenance_route_id
  estimated_duration_hours,
  priority,
  schedule_number as notes,  -- Temporary mapping for notes
  created_at,
  updated_at,
  assigned_to as created_by  -- Temporary mapping for created_by
FROM workorder_service.pm_schedules;

-- Drop the duplicate pm_service schema
DROP SCHEMA IF EXISTS pm_service CASCADE;