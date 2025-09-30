-- Add organization_id to suppliers table
ALTER TABLE suppliers ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE suppliers SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE suppliers ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_suppliers_organization_id ON suppliers(organization_id);

-- Update RLS Policies for suppliers
DROP POLICY IF EXISTS "Anyone can view suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON suppliers;

CREATE POLICY "Users can view their organization's suppliers" ON suppliers
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON suppliers
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's suppliers" ON suppliers
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's suppliers" ON suppliers
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );