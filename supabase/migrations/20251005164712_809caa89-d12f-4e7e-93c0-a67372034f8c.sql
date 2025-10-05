-- PM Schedules Service Migration
-- Drop existing objects dynamically
DO $$
DECLARE
  obj_name TEXT;
BEGIN
  FOR obj_name IN SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('pm_schedules', 'pm_schedule_history', 'pm_schedule_materials', 'pm_schedule_assignments')
    AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', obj_name);
  END LOOP;
  
  FOR obj_name IN SELECT table_name FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name IN ('pm_schedules', 'pm_schedule_history', 'pm_schedule_materials', 'pm_schedule_assignments')
  LOOP
    EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', obj_name);
  END LOOP;
END $$;

CREATE SCHEMA IF NOT EXISTS pm_service;

CREATE TABLE pm_service.pm_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_number character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  asset_id uuid,
  job_plan_id uuid,
  frequency_type character varying NOT NULL,
  frequency_value integer NOT NULL,
  start_date date NOT NULL,
  next_due_date date,
  last_completed_date date,
  is_active boolean DEFAULT true,
  status character varying DEFAULT 'active',
  priority character varying,
  estimated_duration_hours numeric,
  assigned_to uuid,
  notes text,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

CREATE TABLE pm_service.pm_schedule_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_schedule_id uuid NOT NULL REFERENCES pm_service.pm_schedules(id) ON DELETE CASCADE,
  work_order_id uuid,
  completed_date date NOT NULL,
  completed_by uuid,
  actual_duration_hours numeric,
  notes text,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE pm_service.pm_schedule_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_schedule_id uuid NOT NULL REFERENCES pm_service.pm_schedules(id) ON DELETE CASCADE,
  bom_item_id uuid NOT NULL,
  planned_quantity numeric NOT NULL,
  estimated_unit_cost numeric,
  notes text,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE pm_service.pm_schedule_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_schedule_id uuid NOT NULL REFERENCES pm_service.pm_schedules(id) ON DELETE CASCADE,
  assigned_person_id uuid NOT NULL,
  assignment_role character varying DEFAULT 'assigned',
  assigned_date timestamp with time zone DEFAULT now(),
  assigned_by uuid,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE VIEW public.pm_schedules AS SELECT * FROM pm_service.pm_schedules;
CREATE VIEW public.pm_schedule_history AS SELECT * FROM pm_service.pm_schedule_history;
CREATE VIEW public.pm_schedule_materials AS SELECT * FROM pm_service.pm_schedule_materials;
CREATE VIEW public.pm_schedule_assignments AS SELECT * FROM pm_service.pm_schedule_assignments;

CREATE INDEX idx_pm_schedules_asset ON pm_service.pm_schedules(asset_id);
CREATE INDEX idx_pm_schedules_org ON pm_service.pm_schedules(organization_id);

GRANT USAGE ON SCHEMA pm_service TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA pm_service TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA pm_service TO service_role;

ALTER TABLE pm_service.pm_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_service.pm_schedule_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_service.pm_schedule_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_service.pm_schedule_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access_schedules" ON pm_service.pm_schedules FOR SELECT 
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "org_access_history" ON pm_service.pm_schedule_history FOR SELECT 
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "org_access_materials" ON pm_service.pm_schedule_materials FOR SELECT 
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "org_access_assignments" ON pm_service.pm_schedule_assignments FOR SELECT 
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE OR REPLACE FUNCTION pm_service.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_schedules_updated_at BEFORE UPDATE ON pm_service.pm_schedules
  FOR EACH ROW EXECUTE FUNCTION pm_service.update_updated_at();

CREATE TRIGGER trg_materials_updated_at BEFORE UPDATE ON pm_service.pm_schedule_materials
  FOR EACH ROW EXECUTE FUNCTION pm_service.update_updated_at();

CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON pm_service.pm_schedule_assignments
  FOR EACH ROW EXECUTE FUNCTION pm_service.update_updated_at();