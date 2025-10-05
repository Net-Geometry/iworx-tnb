-- Recreate public.pm_schedules view with all columns
DROP VIEW IF EXISTS public.pm_schedules CASCADE;

CREATE OR REPLACE VIEW public.pm_schedules AS 
SELECT 
  id,
  organization_id,
  schedule_number,
  title as name,  -- Map title to name for backward compatibility
  title,          -- Keep original title column too
  description,
  frequency_type::text as frequency_type,
  frequency_value,
  frequency_unit::text as frequency_unit,
  start_date,
  next_due_date,
  last_completed_date,
  lead_time_days,
  assigned_to as assigned_person_id,  -- Map assigned_to to assigned_person_id
  assigned_to,                         -- Keep original assigned_to too
  assigned_team_id,
  route_id as maintenance_route_id,    -- Map route_id to maintenance_route_id
  route_id,                             -- Keep original route_id too
  location_node_id,
  estimated_duration_hours,
  estimated_material_cost,
  estimated_labor_cost,
  other_costs,
  priority,
  is_active,
  status::text as status,
  auto_generate_wo,
  notification_enabled,
  safety_precaution_ids,
  created_at,
  updated_at,
  assigned_to as created_by  -- Temporary mapping for created_by
FROM workorder_service.pm_schedules;