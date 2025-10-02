-- Add work_order_status field to workflow_template_steps
ALTER TABLE public.workflow_template_steps
ADD COLUMN IF NOT EXISTS work_order_status VARCHAR;

-- Add permission columns to workflow_step_role_assignments if they don't exist
ALTER TABLE public.workflow_step_role_assignments
ADD COLUMN IF NOT EXISTS can_approve BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_reject BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_assign BOOLEAN DEFAULT false;