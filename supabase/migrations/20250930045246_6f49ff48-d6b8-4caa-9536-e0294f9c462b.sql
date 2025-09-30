-- Add organization_id to work_orders table
ALTER TABLE work_orders ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Backfill with MSMS organization ID
UPDATE work_orders SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');

-- Set to NOT NULL
ALTER TABLE work_orders ALTER COLUMN organization_id SET NOT NULL;

-- Add index for performance
CREATE INDEX idx_work_orders_organization_id ON work_orders(organization_id);

-- Update RLS Policies for work_orders
DROP POLICY IF EXISTS "Anyone can view work orders" ON work_orders;
DROP POLICY IF EXISTS "Authenticated users can manage work orders" ON work_orders;

CREATE POLICY "Users can view their organization's work orders" ON work_orders
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON work_orders
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's work orders" ON work_orders
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's work orders" ON work_orders
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );