-- Create meters table
CREATE TABLE public.meters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  meter_number VARCHAR NOT NULL,
  serial_number VARCHAR NOT NULL,
  meter_type VARCHAR NOT NULL, -- 'revenue', 'monitoring', 'protection', 'power_quality'
  manufacturer VARCHAR,
  model VARCHAR,
  accuracy_class VARCHAR,
  voltage_rating NUMERIC,
  current_rating NUMERIC,
  phase_type VARCHAR, -- 'single', 'three'
  installation_date DATE,
  installation_location TEXT,
  coordinates JSONB, -- {lat, lng}
  last_calibration_date DATE,
  next_calibration_date DATE,
  calibration_certificate_number VARCHAR,
  meter_constant NUMERIC,
  multiplier NUMERIC DEFAULT 1,
  status VARCHAR NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'faulty', 'retired'
  health_score INTEGER DEFAULT 100,
  last_reading NUMERIC,
  last_reading_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(organization_id, meter_number)
);

-- Create meter_groups table
CREATE TABLE public.meter_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  group_number VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  group_type VARCHAR, -- 'revenue', 'monitoring', 'zone', 'feeder'
  purpose TEXT,
  hierarchy_node_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(organization_id, group_number)
);

-- Create meter_group_assignments table (meters to groups)
CREATE TABLE public.meter_group_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  meter_id UUID NOT NULL,
  meter_group_id UUID NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID,
  is_primary BOOLEAN DEFAULT false,
  status VARCHAR DEFAULT 'active', -- 'active', 'inactive'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meter_id, meter_group_id)
);

-- Create asset_meter_groups table (meter groups to assets)
CREATE TABLE public.asset_meter_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  meter_group_id UUID NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID,
  purpose TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(asset_id, meter_group_id)
);

-- Enable RLS
ALTER TABLE public.meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_group_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_meter_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meters
CREATE POLICY "Users can view their organization's meters"
  ON public.meters FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.meters FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's meters"
  ON public.meters FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's meters"
  ON public.meters FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- RLS Policies for meter_groups
CREATE POLICY "Users can view their organization's meter groups"
  ON public.meter_groups FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.meter_groups FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's meter groups"
  ON public.meter_groups FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's meter groups"
  ON public.meter_groups FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- RLS Policies for meter_group_assignments
CREATE POLICY "Users can view their organization's meter assignments"
  ON public.meter_group_assignments FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.meter_group_assignments FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's meter assignments"
  ON public.meter_group_assignments FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's meter assignments"
  ON public.meter_group_assignments FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- RLS Policies for asset_meter_groups
CREATE POLICY "Users can view their organization's asset meter groups"
  ON public.asset_meter_groups FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.asset_meter_groups FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's asset meter groups"
  ON public.asset_meter_groups FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's asset meter groups"
  ON public.asset_meter_groups FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- Create indexes for performance
CREATE INDEX idx_meters_organization ON public.meters(organization_id);
CREATE INDEX idx_meters_status ON public.meters(status);
CREATE INDEX idx_meter_groups_organization ON public.meter_groups(organization_id);
CREATE INDEX idx_meter_group_assignments_meter ON public.meter_group_assignments(meter_id);
CREATE INDEX idx_meter_group_assignments_group ON public.meter_group_assignments(meter_group_id);
CREATE INDEX idx_asset_meter_groups_asset ON public.asset_meter_groups(asset_id);
CREATE INDEX idx_asset_meter_groups_meter_group ON public.asset_meter_groups(meter_group_id);

-- Create triggers for updated_at
CREATE TRIGGER update_meters_updated_at
  BEFORE UPDATE ON public.meters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meter_groups_updated_at
  BEFORE UPDATE ON public.meter_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meter_group_assignments_updated_at
  BEFORE UPDATE ON public.meter_group_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_meter_groups_updated_at
  BEFORE UPDATE ON public.asset_meter_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();