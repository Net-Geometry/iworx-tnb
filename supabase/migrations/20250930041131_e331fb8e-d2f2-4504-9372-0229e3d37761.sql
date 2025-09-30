-- Phase 3 - Module 1: People & Labor Data Isolation
-- Add organization_id to 5 tables and update RLS policies

-- 1. Add organization_id to people table
ALTER TABLE people ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE people SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE people ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_people_organization_id ON people(organization_id);

-- 2. Add organization_id to teams table  
ALTER TABLE teams ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE teams SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE teams ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_teams_organization_id ON teams(organization_id);

-- 3. Add organization_id to team_members table
ALTER TABLE team_members ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE team_members SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE team_members ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_team_members_organization_id ON team_members(organization_id);

-- 4. Add organization_id to person_skills table
ALTER TABLE person_skills ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE person_skills SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE person_skills ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_person_skills_organization_id ON person_skills(organization_id);

-- 5. Add organization_id to skills table
ALTER TABLE skills ADD COLUMN organization_id UUID REFERENCES organizations(id);
UPDATE skills SET organization_id = (SELECT id FROM organizations WHERE code = 'MSMS');
ALTER TABLE skills ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX idx_skills_organization_id ON skills(organization_id);

-- Update RLS Policies for PEOPLE TABLE
DROP POLICY IF EXISTS "Anyone can view people" ON people;
DROP POLICY IF EXISTS "Authenticated users can manage people" ON people;

CREATE POLICY "Users can view their organization's people" ON people
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON people
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's people" ON people
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's people" ON people
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for TEAMS TABLE
DROP POLICY IF EXISTS "Anyone can view teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can manage teams" ON teams;

CREATE POLICY "Users can view their organization's teams" ON teams
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON teams
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's teams" ON teams
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's teams" ON teams
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for TEAM_MEMBERS TABLE
DROP POLICY IF EXISTS "Anyone can view team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can manage team members" ON team_members;

CREATE POLICY "Users can view their organization's team members" ON team_members
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON team_members
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's team members" ON team_members
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's team members" ON team_members
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for PERSON_SKILLS TABLE
DROP POLICY IF EXISTS "Anyone can view person skills" ON person_skills;
DROP POLICY IF EXISTS "Authenticated users can manage person skills" ON person_skills;

CREATE POLICY "Users can view their organization's person skills" ON person_skills
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON person_skills
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's person skills" ON person_skills
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's person skills" ON person_skills
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Update RLS Policies for SKILLS TABLE
DROP POLICY IF EXISTS "Anyone can view skills" ON skills;
DROP POLICY IF EXISTS "Authenticated users can manage skills" ON skills;

CREATE POLICY "Users can view their organization's skills" ON skills
  FOR SELECT USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can insert in their organization" ON skills
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's skills" ON skills
  FOR UPDATE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's skills" ON skills
  FOR DELETE USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );