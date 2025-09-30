-- Add PM schedule relationship and generation type to work orders
ALTER TABLE public.work_orders 
ADD COLUMN IF NOT EXISTS pm_schedule_id UUID REFERENCES public.pm_schedules(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS generation_type VARCHAR(20) DEFAULT 'manual' CHECK (generation_type IN ('manual', 'automatic'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_work_orders_pm_schedule_id ON public.work_orders(pm_schedule_id);

-- Add comment for documentation
COMMENT ON COLUMN public.work_orders.pm_schedule_id IS 'Links work order to the PM schedule that generated it';
COMMENT ON COLUMN public.work_orders.generation_type IS 'Indicates if work order was manually or automatically generated';