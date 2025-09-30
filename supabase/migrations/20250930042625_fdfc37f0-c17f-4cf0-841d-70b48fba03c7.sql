-- Module 3: Inventory Data Isolation
-- Add organization_id to inventory tables and update RLS policies

-- 1. Add organization_id to inventory_items
ALTER TABLE inventory_items ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE inventory_items SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE inventory_items ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_inventory_items_organization_id ON inventory_items(organization_id);

-- 2. Add organization_id to inventory_locations
ALTER TABLE inventory_locations ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE inventory_locations SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE inventory_locations ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_inventory_locations_organization_id ON inventory_locations(organization_id);

-- 3. Add organization_id to inventory_item_locations
ALTER TABLE inventory_item_locations ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE inventory_item_locations SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE inventory_item_locations ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_inventory_item_locations_organization_id ON inventory_item_locations(organization_id);

-- 4. Add organization_id to inventory_transactions
ALTER TABLE inventory_transactions ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE inventory_transactions SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE inventory_transactions ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_inventory_transactions_organization_id ON inventory_transactions(organization_id);

-- 5. Add organization_id to inventory_transfers
ALTER TABLE inventory_transfers ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE inventory_transfers SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE inventory_transfers ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_inventory_transfers_organization_id ON inventory_transfers(organization_id);

-- 6. Add organization_id to inventory_transfer_items
ALTER TABLE inventory_transfer_items ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE inventory_transfer_items SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE inventory_transfer_items ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_inventory_transfer_items_organization_id ON inventory_transfer_items(organization_id);

-- 7. Add organization_id to inventory_loans
ALTER TABLE inventory_loans ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE inventory_loans SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE inventory_loans ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_inventory_loans_organization_id ON inventory_loans(organization_id);

-- 8. Add organization_id to purchase_orders
ALTER TABLE purchase_orders ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE purchase_orders SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE purchase_orders ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_purchase_orders_organization_id ON purchase_orders(organization_id);

-- 9. Add organization_id to purchase_order_items
ALTER TABLE purchase_order_items ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE purchase_order_items SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE purchase_order_items ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_purchase_order_items_organization_id ON purchase_order_items(organization_id);

-- Update RLS Policies for inventory_items
DROP POLICY IF EXISTS "Anyone can view items" ON inventory_items;
DROP POLICY IF EXISTS "Authenticated users can manage items" ON inventory_items;

CREATE POLICY "Users can view their organization's inventory items" ON inventory_items
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON inventory_items
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's inventory items" ON inventory_items
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's inventory items" ON inventory_items
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for inventory_locations
DROP POLICY IF EXISTS "Anyone can view locations" ON inventory_locations;
DROP POLICY IF EXISTS "Authenticated users can manage locations" ON inventory_locations;

CREATE POLICY "Users can view their organization's inventory locations" ON inventory_locations
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON inventory_locations
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's inventory locations" ON inventory_locations
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's inventory locations" ON inventory_locations
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for inventory_item_locations
DROP POLICY IF EXISTS "Anyone can view item locations" ON inventory_item_locations;
DROP POLICY IF EXISTS "Authenticated users can manage item locations" ON inventory_item_locations;

CREATE POLICY "Users can view their organization's item locations" ON inventory_item_locations
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON inventory_item_locations
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's item locations" ON inventory_item_locations
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's item locations" ON inventory_item_locations
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for inventory_transactions
DROP POLICY IF EXISTS "Anyone can view transactions" ON inventory_transactions;
DROP POLICY IF EXISTS "Authenticated users can manage transactions" ON inventory_transactions;

CREATE POLICY "Users can view their organization's transactions" ON inventory_transactions
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON inventory_transactions
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's transactions" ON inventory_transactions
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's transactions" ON inventory_transactions
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for inventory_transfers
DROP POLICY IF EXISTS "Anyone can view transfers" ON inventory_transfers;
DROP POLICY IF EXISTS "Authenticated users can manage transfers" ON inventory_transfers;

CREATE POLICY "Users can view their organization's transfers" ON inventory_transfers
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON inventory_transfers
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's transfers" ON inventory_transfers
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's transfers" ON inventory_transfers
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for inventory_transfer_items
DROP POLICY IF EXISTS "Anyone can view transfer items" ON inventory_transfer_items;
DROP POLICY IF EXISTS "Authenticated users can manage transfer items" ON inventory_transfer_items;

CREATE POLICY "Users can view their organization's transfer items" ON inventory_transfer_items
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON inventory_transfer_items
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's transfer items" ON inventory_transfer_items
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's transfer items" ON inventory_transfer_items
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for inventory_loans
DROP POLICY IF EXISTS "Anyone can view loans" ON inventory_loans;
DROP POLICY IF EXISTS "Authenticated users can manage loans" ON inventory_loans;

CREATE POLICY "Users can view their organization's loans" ON inventory_loans
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON inventory_loans
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's loans" ON inventory_loans
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's loans" ON inventory_loans
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for purchase_orders
DROP POLICY IF EXISTS "Anyone can view purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can manage purchase orders" ON purchase_orders;

CREATE POLICY "Users can view their organization's purchase orders" ON purchase_orders
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON purchase_orders
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's purchase orders" ON purchase_orders
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's purchase orders" ON purchase_orders
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for purchase_order_items
DROP POLICY IF EXISTS "Anyone can view PO items" ON purchase_order_items;
DROP POLICY IF EXISTS "Authenticated users can manage PO items" ON purchase_order_items;

CREATE POLICY "Users can view their organization's PO items" ON purchase_order_items
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON purchase_order_items
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's PO items" ON purchase_order_items
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's PO items" ON purchase_order_items
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );