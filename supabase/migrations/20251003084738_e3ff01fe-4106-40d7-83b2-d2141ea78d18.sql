-- Add work order planning fields to safety_incidents table
ALTER TABLE safety_service.safety_incidents
  ADD COLUMN IF NOT EXISTS wo_maintenance_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS wo_priority VARCHAR(20),
  ADD COLUMN IF NOT EXISTS wo_estimated_duration_hours NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS wo_assigned_technician VARCHAR(255),
  ADD COLUMN IF NOT EXISTS wo_estimated_cost NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS wo_target_start_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS wo_target_finish_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS wo_notes TEXT,
  ADD COLUMN IF NOT EXISTS immediate_actions TEXT;

-- Add comments for documentation
COMMENT ON COLUMN safety_service.safety_incidents.wo_maintenance_type IS 'Planned maintenance type for work order: preventive, corrective, predictive, or emergency';
COMMENT ON COLUMN safety_service.safety_incidents.wo_priority IS 'Work order priority: low, medium, high, or critical';
COMMENT ON COLUMN safety_service.safety_incidents.wo_estimated_duration_hours IS 'Estimated hours needed to complete the work';
COMMENT ON COLUMN safety_service.safety_incidents.wo_assigned_technician IS 'Technician name or ID for assignment';
COMMENT ON COLUMN safety_service.safety_incidents.wo_estimated_cost IS 'Estimated cost for repair/maintenance work';
COMMENT ON COLUMN safety_service.safety_incidents.wo_target_start_date IS 'Preferred/required start date for work order';
COMMENT ON COLUMN safety_service.safety_incidents.wo_target_finish_date IS 'Target completion date for work order';
COMMENT ON COLUMN safety_service.safety_incidents.wo_notes IS 'Additional notes for maintenance work';
COMMENT ON COLUMN safety_service.safety_incidents.immediate_actions IS 'Immediate corrective actions taken at time of incident';