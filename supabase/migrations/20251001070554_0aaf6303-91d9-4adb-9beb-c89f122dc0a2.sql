-- Add meter_group_id column to job_plan_tasks table
ALTER TABLE public.job_plan_tasks
ADD COLUMN meter_group_id uuid REFERENCES public.meter_groups(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_job_plan_tasks_meter_group_id ON public.job_plan_tasks(meter_group_id);

-- Add comment to document the column
COMMENT ON COLUMN public.job_plan_tasks.meter_group_id IS 'Optional meter group associated with this task for monitoring';