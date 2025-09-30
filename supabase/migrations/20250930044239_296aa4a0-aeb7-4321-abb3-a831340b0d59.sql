-- Module 5: BOMs - Add organization_id and update RLS policies

-- Add organization_id to bill_of_materials
ALTER TABLE bill_of_materials ADD COLUMN organization_id UUID;

-- Backfill with MSMS organization
UPDATE bill_of_materials 
SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');

-- Make it required
ALTER TABLE bill_of_materials ALTER COLUMN organization_id SET NOT NULL;

-- Add foreign key
ALTER TABLE bill_of_materials 
ADD CONSTRAINT bill_of_materials_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX idx_bill_of_materials_organization_id ON bill_of_materials(organization_id);

-- Add organization_id to bom_items
ALTER TABLE bom_items ADD COLUMN organization_id UUID;

-- Backfill with MSMS organization
UPDATE bom_items 
SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');

-- Make it required
ALTER TABLE bom_items ALTER COLUMN organization_id SET NOT NULL;

-- Add foreign key
ALTER TABLE bom_items 
ADD CONSTRAINT bom_items_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX idx_bom_items_organization_id ON bom_items(organization_id);

-- Drop old permissive policies for bill_of_materials
DROP POLICY IF EXISTS "Anyone can view BOMs" ON bill_of_materials;
DROP POLICY IF EXISTS "Authenticated users can manage BOMs" ON bill_of_materials;

-- New organization-scoped policies for bill_of_materials
CREATE POLICY "Users can view their organization's BOMs" ON bill_of_materials
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON bill_of_materials
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's BOMs" ON bill_of_materials
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's BOMs" ON bill_of_materials
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Drop old permissive policies for bom_items
DROP POLICY IF EXISTS "Anyone can view BOM items" ON bom_items;
DROP POLICY IF EXISTS "Authenticated users can manage BOM items" ON bom_items;

-- New organization-scoped policies for bom_items
CREATE POLICY "Users can view their organization's BOM items" ON bom_items
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON bom_items
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's BOM items" ON bom_items
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's BOM items" ON bom_items
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );