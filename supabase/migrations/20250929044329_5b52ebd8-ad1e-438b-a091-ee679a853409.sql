-- Create maintenance_records table
CREATE TABLE public.maintenance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL,
  maintenance_type VARCHAR NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'predictive', 'emergency')),
  description TEXT NOT NULL,
  technician_name VARCHAR,
  performed_date DATE NOT NULL,
  cost NUMERIC,
  duration_hours NUMERIC,
  notes TEXT,
  status VARCHAR NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'in_progress')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_orders table for scheduled/upcoming maintenance
CREATE TABLE public.work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  maintenance_type VARCHAR NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'predictive', 'emergency')),
  priority VARCHAR NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  scheduled_date DATE NOT NULL,
  estimated_duration_hours NUMERIC,
  assigned_technician VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  estimated_cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance_records
CREATE POLICY "Anyone can view maintenance records" 
ON public.maintenance_records 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage maintenance records" 
ON public.maintenance_records 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create policies for work_orders
CREATE POLICY "Anyone can view work orders" 
ON public.work_orders 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage work orders" 
ON public.work_orders 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add triggers for updated_at
CREATE TRIGGER update_maintenance_records_updated_at
  BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_maintenance_records_asset_id ON public.maintenance_records(asset_id);
CREATE INDEX idx_maintenance_records_performed_date ON public.maintenance_records(performed_date);
CREATE INDEX idx_work_orders_asset_id ON public.work_orders(asset_id);
CREATE INDEX idx_work_orders_scheduled_date ON public.work_orders(scheduled_date);
CREATE INDEX idx_work_orders_status ON public.work_orders(status);