-- Add cost estimation fields to pm_schedules table
ALTER TABLE pm_schedules 
ADD COLUMN IF NOT EXISTS estimated_material_cost numeric,
ADD COLUMN IF NOT EXISTS estimated_labor_cost numeric,
ADD COLUMN IF NOT EXISTS other_costs numeric DEFAULT 0;

-- Add labor cost center field to people table (hourly_rate already exists)
ALTER TABLE people
ADD COLUMN IF NOT EXISTS default_labor_cost_center character varying;

-- Create pm_schedule_materials table for PM-specific material planning
CREATE TABLE IF NOT EXISTS pm_schedule_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pm_schedule_id uuid NOT NULL REFERENCES pm_schedules(id) ON DELETE CASCADE,
  bom_item_id uuid NOT NULL REFERENCES bom_items(id) ON DELETE CASCADE,
  planned_quantity numeric NOT NULL DEFAULT 1,
  estimated_unit_cost numeric,
  notes text,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on pm_schedule_materials
ALTER TABLE pm_schedule_materials ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist and recreate
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their organization's PM schedule materials" ON pm_schedule_materials;
  CREATE POLICY "Users can view their organization's PM schedule materials"
    ON pm_schedule_materials FOR SELECT
    USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert in their organization" ON pm_schedule_materials;
  CREATE POLICY "Users can insert in their organization"
    ON pm_schedule_materials FOR INSERT
    WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update their organization's PM schedule materials" ON pm_schedule_materials;
  CREATE POLICY "Users can update their organization's PM schedule materials"
    ON pm_schedule_materials FOR UPDATE
    USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete their organization's PM schedule materials" ON pm_schedule_materials;
  CREATE POLICY "Users can delete their organization's PM schedule materials"
    ON pm_schedule_materials FOR DELETE
    USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pm_schedule_materials_pm_schedule_id ON pm_schedule_materials(pm_schedule_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedule_materials_bom_item_id ON pm_schedule_materials(bom_item_id);

-- Add trigger for updating updated_at
DROP TRIGGER IF EXISTS update_pm_schedule_materials_updated_at ON pm_schedule_materials;
CREATE TRIGGER update_pm_schedule_materials_updated_at
  BEFORE UPDATE ON pm_schedule_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();