-- =====================================================
-- Phase 1: PM Service Schema Migration
-- Creates fresh pm_service schema with no data migration
-- =====================================================

-- 1. CLEANUP EXISTING
-- =====================================================
DROP VIEW IF EXISTS public.pm_schedules CASCADE;
DROP VIEW IF EXISTS public.pm_schedule_history CASCADE;
DROP VIEW IF EXISTS public.pm_schedule_materials CASCADE;
DROP VIEW IF EXISTS public.pm_schedule_assignments CASCADE;
DROP SCHEMA IF EXISTS pm_service CASCADE;

-- 2. CREATE PM SERVICE SCHEMA
-- =====================================================
CREATE SCHEMA pm_service;

-- 3. CREATE SCHEDULES TABLE
-- =====================================================
CREATE TABLE pm_service.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  schedule_number VARCHAR NOT NULL,
  name VARCHAR,
  title VARCHAR NOT NULL,
  description TEXT,
  
  asset_id UUID,
  job_plan_id UUID,
  
  frequency_type VARCHAR NOT NULL,
  frequency_value INTEGER NOT NULL DEFAULT 1,
  frequency_unit VARCHAR,
  
  start_date DATE NOT NULL,
  next_due_date DATE,
  last_completed_date DATE,
  lead_time_days INTEGER DEFAULT 0,
  
  assigned_person_id UUID,
  assigned_team_id UUID,
  
  route_id UUID,
  location_node_id UUID,
  
  estimated_duration_hours NUMERIC,
  estimated_material_cost NUMERIC,
  estimated_labor_cost NUMERIC,
  other_costs NUMERIC,
  
  priority VARCHAR DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  status VARCHAR DEFAULT 'active',
  
  auto_generate_wo BOOLEAN DEFAULT false,
  notification_enabled BOOLEAN DEFAULT true,
  
  safety_precaution_ids UUID[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  
  UNIQUE(organization_id, schedule_number)
);

-- 4. CREATE SCHEDULE HISTORY TABLE
-- =====================================================
CREATE TABLE pm_service.schedule_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_schedule_id UUID NOT NULL REFERENCES pm_service.schedules(id) ON DELETE CASCADE,
  work_order_id UUID,
  completed_date DATE NOT NULL,
  completed_by UUID,
  status VARCHAR NOT NULL,
  notes TEXT,
  organization_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE MATERIALS TABLE
-- =====================================================
CREATE TABLE pm_service.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_schedule_id UUID NOT NULL REFERENCES pm_service.schedules(id) ON DELETE CASCADE,
  bom_item_id UUID,
  quantity_required NUMERIC NOT NULL,
  unit VARCHAR DEFAULT 'each',
  estimated_cost NUMERIC,
  notes TEXT,
  organization_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE pm_service.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_schedule_id UUID NOT NULL REFERENCES pm_service.schedules(id) ON DELETE CASCADE,
  assigned_person_id UUID,
  assignment_role VARCHAR DEFAULT 'assigned',
  assigned_by UUID,
  assigned_date TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE BACKWARD-COMPATIBLE VIEWS
-- =====================================================
CREATE VIEW public.pm_schedules AS 
SELECT 
  id, organization_id, schedule_number, name, title, description,
  asset_id, job_plan_id, frequency_type, frequency_value, frequency_unit,
  start_date, next_due_date, last_completed_date, lead_time_days,
  assigned_person_id as assigned_to,
  assigned_person_id,
  assigned_team_id,
  route_id as maintenance_route_id,
  route_id,
  location_node_id, estimated_duration_hours, estimated_material_cost,
  estimated_labor_cost, other_costs, priority, is_active, status,
  auto_generate_wo, notification_enabled, safety_precaution_ids,
  created_at, updated_at, created_by
FROM pm_service.schedules;

CREATE VIEW public.pm_schedule_history AS 
SELECT * FROM pm_service.schedule_history;

CREATE VIEW public.pm_schedule_materials AS 
SELECT 
  id, pm_schedule_id, bom_item_id,
  quantity_required as planned_quantity,
  unit, 
  estimated_cost as estimated_unit_cost,
  notes, organization_id, created_at, updated_at
FROM pm_service.materials;

CREATE VIEW public.pm_schedule_assignments AS 
SELECT * FROM pm_service.assignments;

-- 8. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE pm_service.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_service.schedule_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_service.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_service.assignments ENABLE ROW LEVEL SECURITY;

-- 9. CREATE RLS POLICIES
-- =====================================================
CREATE POLICY "Users can view their org PM schedules"
  ON pm_service.schedules FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can create PM schedules"
  ON pm_service.schedules FOR INSERT
  WITH CHECK (organization_id = ANY (get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their org PM schedules"
  ON pm_service.schedules FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their org PM schedules"
  ON pm_service.schedules FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can view their org schedule history"
  ON pm_service.schedule_history FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can create schedule history"
  ON pm_service.schedule_history FOR INSERT
  WITH CHECK (organization_id = ANY (get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their org schedule history"
  ON pm_service.schedule_history FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their org schedule history"
  ON pm_service.schedule_history FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can view their org materials"
  ON pm_service.materials FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can create materials"
  ON pm_service.materials FOR INSERT
  WITH CHECK (organization_id = ANY (get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their org materials"
  ON pm_service.materials FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their org materials"
  ON pm_service.materials FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can view their org assignments"
  ON pm_service.assignments FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can create assignments"
  ON pm_service.assignments FOR INSERT
  WITH CHECK (organization_id = ANY (get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their org assignments"
  ON pm_service.assignments FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their org assignments"
  ON pm_service.assignments FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) 
    OR organization_id = ANY (get_user_organizations(auth.uid()))
  );

-- 10. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_schedules_organization ON pm_service.schedules(organization_id);
CREATE INDEX idx_schedules_asset ON pm_service.schedules(asset_id);
CREATE INDEX idx_schedules_job_plan ON pm_service.schedules(job_plan_id);
CREATE INDEX idx_schedules_next_due ON pm_service.schedules(next_due_date);
CREATE INDEX idx_schedules_status ON pm_service.schedules(status);
CREATE INDEX idx_schedules_route ON pm_service.schedules(route_id);
CREATE INDEX idx_schedules_assigned_person ON pm_service.schedules(assigned_person_id);

CREATE INDEX idx_history_schedule ON pm_service.schedule_history(pm_schedule_id);
CREATE INDEX idx_history_organization ON pm_service.schedule_history(organization_id);
CREATE INDEX idx_history_completed ON pm_service.schedule_history(completed_date);
CREATE INDEX idx_history_work_order ON pm_service.schedule_history(work_order_id);

CREATE INDEX idx_materials_schedule ON pm_service.materials(pm_schedule_id);
CREATE INDEX idx_materials_organization ON pm_service.materials(organization_id);
CREATE INDEX idx_materials_bom_item ON pm_service.materials(bom_item_id);

CREATE INDEX idx_assignments_schedule ON pm_service.assignments(pm_schedule_id);
CREATE INDEX idx_assignments_person ON pm_service.assignments(assigned_person_id);
CREATE INDEX idx_assignments_organization ON pm_service.assignments(organization_id);

-- 11. GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA pm_service TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA pm_service TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA pm_service TO authenticated;

COMMENT ON SCHEMA pm_service IS 'PM Schedules microservice schema created fresh - ready for new data';
COMMENT ON TABLE pm_service.schedules IS 'PM schedules with consolidated columns (assigned_person_id, route_id)';
COMMENT ON TABLE pm_service.materials IS 'Materials with unit field and renamed quantity_required/estimated_cost';
COMMENT ON TABLE pm_service.assignments IS 'Assignments with assigned_by and assigned_date fields';