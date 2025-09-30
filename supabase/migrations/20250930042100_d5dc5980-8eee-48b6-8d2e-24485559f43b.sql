-- =====================================================
-- Phase 3 - Module 2: Assets Data Isolation
-- Add organization_id to 5 tables and update RLS policies
-- =====================================================

-- 1. Add organization_id to assets table
ALTER TABLE assets ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE assets SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE assets ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_assets_organization_id ON assets(organization_id);

-- 2. Add organization_id to hierarchy_levels table
ALTER TABLE hierarchy_levels ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE hierarchy_levels SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE hierarchy_levels ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_hierarchy_levels_organization_id ON hierarchy_levels(organization_id);

-- 3. Add organization_id to hierarchy_nodes table
ALTER TABLE hierarchy_nodes ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE hierarchy_nodes SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE hierarchy_nodes ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_hierarchy_nodes_organization_id ON hierarchy_nodes(organization_id);

-- 4. Add organization_id to asset_documents table
ALTER TABLE asset_documents ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE asset_documents SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE asset_documents ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_asset_documents_organization_id ON asset_documents(organization_id);

-- 5. Add organization_id to asset_boms table
ALTER TABLE asset_boms ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE asset_boms SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE asset_boms ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_asset_boms_organization_id ON asset_boms(organization_id);

-- =====================================================
-- Update RLS Policies for ASSETS table
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view assets" ON assets;
DROP POLICY IF EXISTS "Authenticated users can manage assets" ON assets;

CREATE POLICY "Users can view their organization's assets" ON assets
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON assets
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's assets" ON assets
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's assets" ON assets
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- =====================================================
-- Update RLS Policies for HIERARCHY_LEVELS table
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view hierarchy levels" ON hierarchy_levels;
DROP POLICY IF EXISTS "Authenticated users can manage hierarchy levels" ON hierarchy_levels;

CREATE POLICY "Users can view their organization's hierarchy levels" ON hierarchy_levels
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON hierarchy_levels
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's hierarchy levels" ON hierarchy_levels
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's hierarchy levels" ON hierarchy_levels
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- =====================================================
-- Update RLS Policies for HIERARCHY_NODES table
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view hierarchy nodes" ON hierarchy_nodes;
DROP POLICY IF EXISTS "Authenticated users can manage hierarchy nodes" ON hierarchy_nodes;

CREATE POLICY "Users can view their organization's hierarchy nodes" ON hierarchy_nodes
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON hierarchy_nodes
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's hierarchy nodes" ON hierarchy_nodes
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's hierarchy nodes" ON hierarchy_nodes
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- =====================================================
-- Update RLS Policies for ASSET_DOCUMENTS table
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view asset documents" ON asset_documents;
DROP POLICY IF EXISTS "Authenticated users can manage asset documents" ON asset_documents;

CREATE POLICY "Users can view their organization's asset documents" ON asset_documents
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON asset_documents
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's asset documents" ON asset_documents
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's asset documents" ON asset_documents
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- =====================================================
-- Update RLS Policies for ASSET_BOMS table
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view asset BOMs" ON asset_boms;
DROP POLICY IF EXISTS "Authenticated users can manage asset BOMs" ON asset_boms;

CREATE POLICY "Users can view their organization's asset BOMs" ON asset_boms
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON asset_boms
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's asset BOMs" ON asset_boms
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's asset BOMs" ON asset_boms
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );