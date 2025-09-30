-- Add incident_report_id to work_orders table to link work orders generated from incidents
ALTER TABLE public.work_orders 
ADD COLUMN incident_report_id uuid REFERENCES public.safety_incidents(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_work_orders_incident_report_id ON public.work_orders(incident_report_id);

-- Add comment to document the relationship
COMMENT ON COLUMN public.work_orders.incident_report_id IS 'Links work order to the incident report that generated it';