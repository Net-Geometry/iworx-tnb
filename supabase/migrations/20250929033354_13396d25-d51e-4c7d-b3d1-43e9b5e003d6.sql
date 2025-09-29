-- Create assets table with hierarchy integration
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  asset_number VARCHAR UNIQUE,
  type VARCHAR,
  description TEXT,
  hierarchy_node_id UUID REFERENCES public.hierarchy_nodes(id) ON DELETE SET NULL,
  status VARCHAR DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'out_of_service', 'decommissioned')),
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  criticality VARCHAR DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
  manufacturer VARCHAR,
  model VARCHAR,
  serial_number VARCHAR,
  purchase_date DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create policies for asset access
CREATE POLICY "Anyone can view assets" 
ON public.assets 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage assets" 
ON public.assets 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on hierarchy queries
CREATE INDEX idx_assets_hierarchy_node_id ON public.assets(hierarchy_node_id);
CREATE INDEX idx_assets_status ON public.assets(status);
CREATE INDEX idx_assets_criticality ON public.assets(criticality);