-- Phase 1: Database Schema Changes for Location-Based Work Order Notification System

-- =====================================================
-- 1. Create Person-Location Junction Table
-- =====================================================
CREATE TABLE person_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people_service.people(id) ON DELETE CASCADE,
  hierarchy_node_id UUID NOT NULL REFERENCES assets_service.hierarchy_nodes(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES people_service.people(id),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(person_id, hierarchy_node_id)
);

-- Indexes for performance
CREATE INDEX idx_person_locations_person ON person_locations(person_id);
CREATE INDEX idx_person_locations_location ON person_locations(hierarchy_node_id);
CREATE INDEX idx_person_locations_org ON person_locations(organization_id);
CREATE INDEX idx_person_locations_active ON person_locations(is_active) WHERE is_active = true;

-- RLS policies
ALTER TABLE person_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's person locations"
  ON person_locations FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON person_locations FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their org's person locations"
  ON person_locations FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their org's person locations"
  ON person_locations FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- Validation trigger to ensure hierarchy_node_id is Level 4 (Location)
CREATE OR REPLACE FUNCTION validate_location_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hierarchy_node_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM assets_service.hierarchy_nodes hn
      JOIN assets_service.hierarchy_levels hl ON hn.hierarchy_level_id = hl.id
      WHERE hn.id = NEW.hierarchy_node_id AND hl.level_order = 4
    ) THEN
      RAISE EXCEPTION 'hierarchy_node_id must reference a Location (Level 4) node';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_person_location_level
  BEFORE INSERT OR UPDATE ON person_locations
  FOR EACH ROW EXECUTE FUNCTION validate_location_level();

-- Updated_at trigger
CREATE TRIGGER update_person_locations_updated_at
  BEFORE UPDATE ON person_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. Add Location to PM Schedules
-- =====================================================
ALTER TABLE workorder_service.pm_schedules 
  ADD COLUMN location_node_id UUID REFERENCES assets_service.hierarchy_nodes(id);

-- Index for performance
CREATE INDEX idx_pm_schedules_location ON workorder_service.pm_schedules(location_node_id);

-- Validation trigger for PM schedules
CREATE TRIGGER validate_pm_schedule_location_level
  BEFORE INSERT OR UPDATE ON workorder_service.pm_schedules
  FOR EACH ROW 
  WHEN (NEW.location_node_id IS NOT NULL)
  EXECUTE FUNCTION validate_location_level();

-- =====================================================
-- 3. Create Notifications Table
-- =====================================================
CREATE TYPE notification_type AS ENUM (
  'work_order_created',
  'work_order_assigned',
  'work_order_completed',
  'work_order_overdue',
  'pm_schedule_due'
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES workorder_service.work_orders(id) ON DELETE CASCADE,
  pm_schedule_id UUID REFERENCES workorder_service.pm_schedules(id) ON DELETE SET NULL,
  notification_type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_work_order ON notifications(work_order_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_org ON notifications(organization_id);

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- System can create notifications (for service role)
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Updated_at trigger
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. Add Location to Work Orders Table
-- =====================================================
ALTER TABLE workorder_service.work_orders 
  ADD COLUMN location_node_id UUID REFERENCES assets_service.hierarchy_nodes(id);

-- Index for performance
CREATE INDEX idx_work_orders_location ON workorder_service.work_orders(location_node_id);

-- Validation trigger for work orders
CREATE TRIGGER validate_work_order_location_level
  BEFORE INSERT OR UPDATE ON workorder_service.work_orders
  FOR EACH ROW 
  WHEN (NEW.location_node_id IS NOT NULL)
  EXECUTE FUNCTION validate_location_level();

-- =====================================================
-- 5. Comments for documentation
-- =====================================================
COMMENT ON TABLE person_locations IS 'Links people (engineers) to locations in the asset hierarchy for work order notification routing';
COMMENT ON COLUMN person_locations.hierarchy_node_id IS 'Must reference a Level 4 (Location) node in hierarchy_nodes';
COMMENT ON COLUMN person_locations.is_primary IS 'Indicates if this is the person''s primary location assignment';

COMMENT ON TABLE notifications IS 'Stores notification records for users about work orders and PM schedules';
COMMENT ON COLUMN notifications.notification_type IS 'Type of notification: work_order_created, work_order_assigned, work_order_completed, work_order_overdue, pm_schedule_due';

COMMENT ON COLUMN workorder_service.pm_schedules.location_node_id IS 'Location (Level 4) where this PM schedule applies';
COMMENT ON COLUMN workorder_service.work_orders.location_node_id IS 'Location (Level 4) where this work order should be performed';