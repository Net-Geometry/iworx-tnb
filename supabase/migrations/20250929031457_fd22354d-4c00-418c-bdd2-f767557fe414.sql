-- Create dynamic hierarchy system

-- Create hierarchy levels table
CREATE TABLE public.hierarchy_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  level_order INTEGER NOT NULL UNIQUE,
  icon_name VARCHAR NOT NULL DEFAULT 'folder',
  color_code VARCHAR NOT NULL DEFAULT '#6366f1',
  parent_level_id UUID REFERENCES public.hierarchy_levels(id),
  custom_properties_schema JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hierarchy nodes table  
CREATE TABLE public.hierarchy_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  hierarchy_level_id UUID REFERENCES public.hierarchy_levels(id) NOT NULL,
  parent_id UUID REFERENCES public.hierarchy_nodes(id),
  properties JSONB DEFAULT '{}',
  status VARCHAR DEFAULT 'operational',
  asset_count INTEGER DEFAULT 0,
  path VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hierarchy_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hierarchy_nodes ENABLE ROW LEVEL SECURITY;

-- Create policies (public read for now, can be restricted later)
CREATE POLICY "Anyone can view hierarchy levels" 
ON public.hierarchy_levels FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view hierarchy nodes" 
ON public.hierarchy_nodes FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage hierarchy levels" 
ON public.hierarchy_levels FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage hierarchy nodes" 
ON public.hierarchy_nodes FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_hierarchy_levels_updated_at
  BEFORE UPDATE ON public.hierarchy_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hierarchy_nodes_updated_at
  BEFORE UPDATE ON public.hierarchy_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default hierarchy levels (Power Grid example)
INSERT INTO public.hierarchy_levels (name, level_order, icon_name, color_code) VALUES
('State', 0, 'map', '#10b981'),
('Station', 1, 'building2', '#3b82f6'),
('Substation', 2, 'zap', '#f59e0b'),
('Voltage Level', 3, 'activity', '#ef4444'),
('Location', 4, 'map-pin', '#8b5cf6');

-- Insert some sample data
WITH level_ids AS (
  SELECT id, name FROM public.hierarchy_levels
),
california_state AS (
  INSERT INTO public.hierarchy_nodes (name, hierarchy_level_id, parent_id, properties, status, asset_count) 
  SELECT 
    'California',
    (SELECT id FROM level_ids WHERE name = 'State'),
    NULL,
    '{}'::jsonb,
    'operational',
    142
  RETURNING id
)
INSERT INTO public.hierarchy_nodes (name, hierarchy_level_id, parent_id, properties, status, asset_count) 
SELECT 
  'Central Power Station',
  (SELECT id FROM level_ids WHERE name = 'Station'),
  (SELECT id FROM california_state),
  '{"capacity": "500MW"}'::jsonb,
  'operational',
  28;