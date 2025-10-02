-- Create enum for work order type
CREATE TYPE work_order_type AS ENUM ('pm', 'cm');

-- Add work_order_type column to workorder_service.work_orders
ALTER TABLE workorder_service.work_orders
ADD COLUMN work_order_type work_order_type DEFAULT 'cm';

-- Update existing records based on pm_schedule_id
UPDATE workorder_service.work_orders
SET work_order_type = 'pm'
WHERE pm_schedule_id IS NOT NULL;

-- Drop and recreate the public.work_orders view to include work_order_type
DROP VIEW IF EXISTS public.work_orders;

CREATE VIEW public.work_orders AS
SELECT 
  wo.*,
  a.name as asset_name,
  a.asset_number,
  a.category as asset_category,
  a.status as asset_status,
  p.first_name || ' ' || p.last_name as assigned_technician_name,
  ps.title as pm_schedule_name,
  ps.frequency_type as pm_frequency_type
FROM workorder_service.work_orders wo
LEFT JOIN public.assets a ON wo.asset_id = a.id
LEFT JOIN public.people p ON wo.assigned_technician::uuid = p.id
LEFT JOIN public.pm_schedules ps ON wo.pm_schedule_id = ps.id;