-- Add work order creation capability to workflow template steps
ALTER TABLE workflow_template_steps 
ADD COLUMN IF NOT EXISTS allows_work_order_creation BOOLEAN DEFAULT false;

COMMENT ON COLUMN workflow_template_steps.allows_work_order_creation IS 'Indicates if work orders can be created at this workflow step';