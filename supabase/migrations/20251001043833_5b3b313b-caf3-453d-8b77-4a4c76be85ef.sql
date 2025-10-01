-- Create maintenance routes table
CREATE TABLE public.maintenance_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  route_number VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  route_type VARCHAR DEFAULT 'maintenance',
  status VARCHAR DEFAULT 'active',
  estimated_duration_hours NUMERIC,
  frequency_type VARCHAR,
  frequency_interval INTEGER,
  is_optimized BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, route_number)
);

-- Create route assets table (many-to-many with sequence)
CREATE TABLE public.route_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  sequence_order INTEGER NOT NULL,
  estimated_time_minutes INTEGER,
  notes TEXT,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(route_id, asset_id)
);

-- Create route assignments table (link to PM schedules and work orders)
CREATE TABLE public.route_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL,
  assignment_type VARCHAR NOT NULL, -- 'pm_schedule' or 'work_order'
  assignment_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for maintenance_routes
CREATE POLICY "Users can view their organization's routes"
ON public.maintenance_routes FOR SELECT
USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
ON public.maintenance_routes FOR INSERT
WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's routes"
ON public.maintenance_routes FOR UPDATE
USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's routes"
ON public.maintenance_routes FOR DELETE
USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- RLS Policies for route_assets
CREATE POLICY "Users can view their organization's route assets"
ON public.route_assets FOR SELECT
USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
ON public.route_assets FOR INSERT
WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's route assets"
ON public.route_assets FOR UPDATE
USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's route assets"
ON public.route_assets FOR DELETE
USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- RLS Policies for route_assignments
CREATE POLICY "Users can view their organization's route assignments"
ON public.route_assignments FOR SELECT
USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
ON public.route_assignments FOR INSERT
WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's route assignments"
ON public.route_assignments FOR UPDATE
USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's route assignments"
ON public.route_assignments FOR DELETE
USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- Add trigger for updated_at
CREATE TRIGGER update_maintenance_routes_updated_at
BEFORE UPDATE ON public.maintenance_routes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_route_assets_updated_at
BEFORE UPDATE ON public.route_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_route_assignments_updated_at
BEFORE UPDATE ON public.route_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();