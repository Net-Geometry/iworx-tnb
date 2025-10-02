-- Add scheduling timestamp columns to the base work_orders table
ALTER TABLE workorder_service.work_orders
ADD COLUMN target_start_date timestamp with time zone,
ADD COLUMN target_finish_date timestamp with time zone,
ADD COLUMN actual_start_date timestamp with time zone,
ADD COLUMN actual_finish_date timestamp with time zone;

-- Drop and recreate the view to include new columns
DROP VIEW IF EXISTS public.work_orders;

CREATE VIEW public.work_orders AS
SELECT 
    id,
    asset_id,
    title,
    description,
    maintenance_type,
    priority,
    scheduled_date,
    estimated_duration_hours,
    assigned_technician,
    status,
    estimated_cost,
    notes,
    created_at,
    updated_at,
    organization_id,
    pm_schedule_id,
    generation_type,
    incident_report_id,
    target_start_date,
    target_finish_date,
    actual_start_date,
    actual_finish_date
FROM workorder_service.work_orders;

-- Add comments for documentation
COMMENT ON COLUMN workorder_service.work_orders.target_start_date IS 'Planned start timestamp for the work order';
COMMENT ON COLUMN workorder_service.work_orders.target_finish_date IS 'Planned finish timestamp for the work order';
COMMENT ON COLUMN workorder_service.work_orders.actual_start_date IS 'Actual start timestamp when work began';
COMMENT ON COLUMN workorder_service.work_orders.actual_finish_date IS 'Actual finish timestamp when work was completed';