-- Add organization_id to all 5 safety tables
ALTER TABLE safety_precautions ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE safety_incidents ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE safety_hazards ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE loto_procedures ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE capa_records ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Backfill with MSMS organization ID
UPDATE safety_precautions SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
UPDATE safety_incidents SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
UPDATE safety_hazards SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
UPDATE loto_procedures SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
UPDATE capa_records SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');

-- Set to NOT NULL
ALTER TABLE safety_precautions ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE safety_incidents ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE safety_hazards ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE loto_procedures ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE capa_records ALTER COLUMN organization_id SET NOT NULL;

-- Add indexes for performance
CREATE INDEX idx_safety_precautions_organization_id ON safety_precautions(organization_id);
CREATE INDEX idx_safety_incidents_organization_id ON safety_incidents(organization_id);
CREATE INDEX idx_safety_hazards_organization_id ON safety_hazards(organization_id);
CREATE INDEX idx_loto_procedures_organization_id ON loto_procedures(organization_id);
CREATE INDEX idx_capa_records_organization_id ON capa_records(organization_id);

-- Update RLS Policies for safety_precautions
DROP POLICY IF EXISTS "Anyone can view safety precautions" ON safety_precautions;
DROP POLICY IF EXISTS "Authenticated users can manage safety precautions" ON safety_precautions;

CREATE POLICY "Users can view their organization's precautions" ON safety_precautions
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON safety_precautions
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's precautions" ON safety_precautions
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's precautions" ON safety_precautions
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for safety_incidents
DROP POLICY IF EXISTS "Anyone can view incidents" ON safety_incidents;
DROP POLICY IF EXISTS "Authenticated users can manage incidents" ON safety_incidents;

CREATE POLICY "Users can view their organization's incidents" ON safety_incidents
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON safety_incidents
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's incidents" ON safety_incidents
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's incidents" ON safety_incidents
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for safety_hazards
DROP POLICY IF EXISTS "Anyone can view hazards" ON safety_hazards;
DROP POLICY IF EXISTS "Authenticated users can manage hazards" ON safety_hazards;

CREATE POLICY "Users can view their organization's hazards" ON safety_hazards
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON safety_hazards
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's hazards" ON safety_hazards
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's hazards" ON safety_hazards
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for loto_procedures
DROP POLICY IF EXISTS "Anyone can view LOTO procedures" ON loto_procedures;
DROP POLICY IF EXISTS "Authenticated users can manage LOTO procedures" ON loto_procedures;

CREATE POLICY "Users can view their organization's LOTO procedures" ON loto_procedures
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON loto_procedures
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's LOTO procedures" ON loto_procedures
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's LOTO procedures" ON loto_procedures
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for capa_records
DROP POLICY IF EXISTS "Anyone can view CAPA records" ON capa_records;
DROP POLICY IF EXISTS "Authenticated users can manage CAPA records" ON capa_records;

CREATE POLICY "Users can view their organization's CAPA records" ON capa_records
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON capa_records
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's CAPA records" ON capa_records
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's CAPA records" ON capa_records
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );