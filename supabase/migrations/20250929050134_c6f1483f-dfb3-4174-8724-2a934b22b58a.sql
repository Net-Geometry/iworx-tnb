-- Create BOM module tables with RLS policies

-- Create enum for BOM types
CREATE TYPE public.bom_type AS ENUM ('manufacturing', 'maintenance', 'spare_parts');

-- Create enum for BOM status
CREATE TYPE public.bom_status AS ENUM ('active', 'inactive', 'draft', 'archived');

-- Create enum for BOM item types
CREATE TYPE public.bom_item_type AS ENUM ('part', 'material', 'tool', 'consumable');

-- Main BOM table
CREATE TABLE public.bill_of_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  version VARCHAR DEFAULT '1.0',
  description TEXT,
  bom_type bom_type DEFAULT 'manufacturing',
  status bom_status DEFAULT 'active',
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- BOM Items table
CREATE TABLE public.bom_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bom_id UUID NOT NULL REFERENCES public.bill_of_materials(id) ON DELETE CASCADE,
  item_name VARCHAR NOT NULL,
  item_number VARCHAR,
  description TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit VARCHAR DEFAULT 'each',
  item_type bom_item_type DEFAULT 'part',
  cost_per_unit NUMERIC,
  lead_time_days INTEGER,
  supplier VARCHAR,
  notes TEXT,
  parent_item_id UUID REFERENCES public.bom_items(id),
  level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Asset-BOM relationship table
CREATE TABLE public.asset_boms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  bom_id UUID NOT NULL REFERENCES public.bill_of_materials(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id),
  is_primary BOOLEAN DEFAULT false,
  UNIQUE(asset_id, bom_id)
);

-- Enable RLS on all BOM tables
ALTER TABLE public.bill_of_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_boms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bill_of_materials
CREATE POLICY "Anyone can view BOMs" 
ON public.bill_of_materials 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage BOMs" 
ON public.bill_of_materials 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for bom_items
CREATE POLICY "Anyone can view BOM items" 
ON public.bom_items 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage BOM items" 
ON public.bom_items 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for asset_boms
CREATE POLICY "Anyone can view asset BOMs" 
ON public.asset_boms 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage asset BOMs" 
ON public.asset_boms 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_bill_of_materials_updated_at
  BEFORE UPDATE ON public.bill_of_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bom_items_updated_at
  BEFORE UPDATE ON public.bom_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_bom_items_bom_id ON public.bom_items(bom_id);
CREATE INDEX idx_bom_items_parent_item_id ON public.bom_items(parent_item_id);
CREATE INDEX idx_asset_boms_asset_id ON public.asset_boms(asset_id);
CREATE INDEX idx_asset_boms_bom_id ON public.asset_boms(bom_id);