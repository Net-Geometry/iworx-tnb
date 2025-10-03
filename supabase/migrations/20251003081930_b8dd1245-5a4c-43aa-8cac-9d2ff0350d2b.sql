-- Add configurable rejection target to workflow template steps
ALTER TABLE public.workflow_template_steps
ADD COLUMN reject_target_step_id UUID REFERENCES public.workflow_template_steps(id);

COMMENT ON COLUMN public.workflow_template_steps.reject_target_step_id IS 
'Defines where to route when this step is rejected. NULL = go to previous step (default)';

-- Create index for performance
CREATE INDEX idx_workflow_steps_reject_target 
ON public.workflow_template_steps(reject_target_step_id) 
WHERE reject_target_step_id IS NOT NULL;