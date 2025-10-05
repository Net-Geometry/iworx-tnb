-- Create pm_schedule_history table in workorder_service schema
CREATE TABLE IF NOT EXISTS workorder_service.pm_schedule_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_schedule_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  work_order_id UUID,
  completed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pm_schedule_history_schedule_id 
  ON workorder_service.pm_schedule_history(pm_schedule_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedule_history_org_id 
  ON workorder_service.pm_schedule_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedule_history_completed_date 
  ON workorder_service.pm_schedule_history(completed_date);

-- Create public view
CREATE OR REPLACE VIEW public.pm_schedule_history AS 
SELECT * FROM workorder_service.pm_schedule_history;