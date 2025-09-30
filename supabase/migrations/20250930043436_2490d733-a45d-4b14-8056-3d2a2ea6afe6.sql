-- Module 4: Job Plans & Maintenance Data Isolation
-- Add organization_id to job plans and maintenance tables and update RLS policies

-- 1. Add organization_id to job_plans
ALTER TABLE job_plans ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE job_plans SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE job_plans ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_job_plans_organization_id ON job_plans(organization_id);

-- 2. Add organization_id to job_plan_tasks
ALTER TABLE job_plan_tasks ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE job_plan_tasks SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE job_plan_tasks ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_job_plan_tasks_organization_id ON job_plan_tasks(organization_id);

-- 3. Add organization_id to job_plan_parts
ALTER TABLE job_plan_parts ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE job_plan_parts SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE job_plan_parts ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_job_plan_parts_organization_id ON job_plan_parts(organization_id);

-- 4. Add organization_id to job_plan_tools
ALTER TABLE job_plan_tools ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE job_plan_tools SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE job_plan_tools ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_job_plan_tools_organization_id ON job_plan_tools(organization_id);

-- 5. Add organization_id to job_plan_documents
ALTER TABLE job_plan_documents ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE job_plan_documents SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE job_plan_documents ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_job_plan_documents_organization_id ON job_plan_documents(organization_id);

-- 6. Add organization_id to maintenance_records
ALTER TABLE maintenance_records ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE maintenance_records SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE maintenance_records ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_maintenance_records_organization_id ON maintenance_records(organization_id);

-- Update RLS Policies for job_plans
DROP POLICY IF EXISTS "Anyone can view job plans" ON job_plans;
DROP POLICY IF EXISTS "Authenticated users can manage job plans" ON job_plans;

CREATE POLICY "Users can view their organization's job plans" ON job_plans
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON job_plans
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's job plans" ON job_plans
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's job plans" ON job_plans
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for job_plan_tasks
DROP POLICY IF EXISTS "Anyone can view job plan tasks" ON job_plan_tasks;
DROP POLICY IF EXISTS "Authenticated users can manage job plan tasks" ON job_plan_tasks;

CREATE POLICY "Users can view their organization's job plan tasks" ON job_plan_tasks
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON job_plan_tasks
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's job plan tasks" ON job_plan_tasks
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's job plan tasks" ON job_plan_tasks
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for job_plan_parts
DROP POLICY IF EXISTS "Anyone can view job plan parts" ON job_plan_parts;
DROP POLICY IF EXISTS "Authenticated users can manage job plan parts" ON job_plan_parts;

CREATE POLICY "Users can view their organization's job plan parts" ON job_plan_parts
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON job_plan_parts
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's job plan parts" ON job_plan_parts
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's job plan parts" ON job_plan_parts
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for job_plan_tools
DROP POLICY IF EXISTS "Anyone can view job plan tools" ON job_plan_tools;
DROP POLICY IF EXISTS "Authenticated users can manage job plan tools" ON job_plan_tools;

CREATE POLICY "Users can view their organization's job plan tools" ON job_plan_tools
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON job_plan_tools
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's job plan tools" ON job_plan_tools
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's job plan tools" ON job_plan_tools
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for job_plan_documents
DROP POLICY IF EXISTS "Anyone can view job plan documents" ON job_plan_documents;
DROP POLICY IF EXISTS "Authenticated users can manage job plan documents" ON job_plan_documents;

CREATE POLICY "Users can view their organization's job plan documents" ON job_plan_documents
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON job_plan_documents
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's job plan documents" ON job_plan_documents
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's job plan documents" ON job_plan_documents
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for maintenance_records
DROP POLICY IF EXISTS "Anyone can view maintenance records" ON maintenance_records;
DROP POLICY IF EXISTS "Authenticated users can manage maintenance records" ON maintenance_records;

CREATE POLICY "Users can view their organization's maintenance records" ON maintenance_records
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON maintenance_records
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's maintenance records" ON maintenance_records
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's maintenance records" ON maintenance_records
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );