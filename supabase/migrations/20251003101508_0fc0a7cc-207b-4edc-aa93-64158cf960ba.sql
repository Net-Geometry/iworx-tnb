-- Phase 1: Add Engineering Assessment Fields to Incidents

-- Add new columns to safety_service.safety_incidents
ALTER TABLE safety_service.safety_incidents
  ADD COLUMN suggested_job_plan_id UUID REFERENCES workorder_service.job_plans(id) ON DELETE SET NULL,
  ADD COLUMN estimated_repair_hours NUMERIC CHECK (estimated_repair_hours >= 0),
  ADD COLUMN priority_assessment VARCHAR(50) CHECK (
    priority_assessment IN ('can_wait', 'should_schedule', 'urgent', 'critical')
  ),
  ADD COLUMN estimated_material_cost NUMERIC CHECK (estimated_material_cost >= 0),
  ADD COLUMN estimated_labor_cost NUMERIC CHECK (estimated_labor_cost >= 0);

-- Add job plan reference to work orders
ALTER TABLE workorder_service.work_orders
  ADD COLUMN job_plan_id UUID REFERENCES workorder_service.job_plans(id) ON DELETE SET NULL;

-- Create indices for performance
CREATE INDEX idx_incidents_suggested_job_plan 
  ON safety_service.safety_incidents(suggested_job_plan_id);

CREATE INDEX idx_work_orders_job_plan 
  ON workorder_service.work_orders(job_plan_id);

-- Add comments for documentation
COMMENT ON COLUMN safety_service.safety_incidents.suggested_job_plan_id IS 'Reference to a standard job plan that may be suitable for this incident repair';
COMMENT ON COLUMN safety_service.safety_incidents.estimated_repair_hours IS 'Initial engineering estimate of repair duration in hours';
COMMENT ON COLUMN safety_service.safety_incidents.priority_assessment IS 'Business impact assessment: can_wait, should_schedule, urgent, critical';
COMMENT ON COLUMN safety_service.safety_incidents.estimated_material_cost IS 'Estimated cost of materials needed for repair';
COMMENT ON COLUMN safety_service.safety_incidents.estimated_labor_cost IS 'Estimated cost of labor for repair work';
COMMENT ON COLUMN workorder_service.work_orders.job_plan_id IS 'Reference to the job plan used for this work order (if any)';