-- Create meters service schema
CREATE SCHEMA IF NOT EXISTS meters_service;

-- Copy existing meters table structure and data
CREATE TABLE meters_service.meters (LIKE public.meters INCLUDING ALL);
INSERT INTO meters_service.meters SELECT * FROM public.meters;

-- Copy existing meter_groups table structure and data
CREATE TABLE meters_service.groups (LIKE public.meter_groups INCLUDING ALL);
INSERT INTO meters_service.groups SELECT * FROM public.meter_groups;

-- Copy existing meter_group_assignments table structure and data  
CREATE TABLE meters_service.group_assignments (LIKE public.meter_group_assignments INCLUDING ALL);
INSERT INTO meters_service.group_assignments SELECT * FROM public.meter_group_assignments;

-- Update foreign keys to reference new schema
ALTER TABLE meters_service.group_assignments
  DROP CONSTRAINT IF EXISTS meter_group_assignments_meter_id_fkey,
  DROP CONSTRAINT IF EXISTS meter_group_assignments_meter_group_id_fkey,
  ADD FOREIGN KEY (meter_id) REFERENCES meters_service.meters(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (meter_group_id) REFERENCES meters_service.groups(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meters_organization ON meters_service.meters(organization_id);
CREATE INDEX IF NOT EXISTS idx_meters_status ON meters_service.meters(status);
CREATE INDEX IF NOT EXISTS idx_meters_type ON meters_service.meters(meter_type);
CREATE INDEX IF NOT EXISTS idx_groups_organization ON meters_service.groups(organization_id);
CREATE INDEX IF NOT EXISTS idx_assignments_meter ON meters_service.group_assignments(meter_id);
CREATE INDEX IF NOT EXISTS idx_assignments_group ON meters_service.group_assignments(meter_group_id);

-- Grant permissions
GRANT USAGE ON SCHEMA meters_service TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA meters_service TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA meters_service TO authenticated, service_role;

-- Enable RLS
ALTER TABLE meters_service.meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE meters_service.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE meters_service.group_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meters
CREATE POLICY "Users can view their organization's meters"
  ON meters_service.meters FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization"
  ON meters_service.meters FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's meters"
  ON meters_service.meters FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's meters"
  ON meters_service.meters FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- RLS Policies for groups
CREATE POLICY "Users can view their organization's meter groups"
  ON meters_service.groups FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert meter groups in their organization"
  ON meters_service.groups FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's meter groups"
  ON meters_service.groups FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's meter groups"
  ON meters_service.groups FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- RLS Policies for assignments
CREATE POLICY "Users can view their organization's meter assignments"
  ON meters_service.group_assignments FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert meter assignments in their organization"
  ON meters_service.group_assignments FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's meter assignments"
  ON meters_service.group_assignments FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's meter assignments"
  ON meters_service.group_assignments FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

COMMENT ON SCHEMA meters_service IS 'Meters microservice schema - handles all meter and meter group operations';