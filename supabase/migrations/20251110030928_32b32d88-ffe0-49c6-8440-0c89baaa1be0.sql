-- Drop the existing view
DROP VIEW IF EXISTS public.work_orders;

-- Recreate the view with all columns including AI-related fields
CREATE OR REPLACE VIEW public.work_orders AS 
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
    actual_finish_date,
    work_order_type,
    location_node_id,
    job_plan_id,
    -- Add missing AI-related columns
    ai_priority_score,
    ai_priority_factors,
    predicted_failure_risk,
    ml_recommended,
    anomaly_detection_id
FROM workorder_service.work_orders;

-- Add comment
COMMENT ON VIEW public.work_orders IS 'Public view exposing work orders from workorder_service schema with AI prioritization fields';