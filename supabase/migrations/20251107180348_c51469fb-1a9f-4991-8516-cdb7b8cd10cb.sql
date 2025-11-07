-- =====================================================
-- GRANT SERVICE_ROLE FULL ACCESS (for edge functions)
-- =====================================================
-- Service role needs full access to bypass RLS and manage all operations

GRANT ALL ON ALL TABLES IN SCHEMA people_service TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA people_service TO service_role;

-- Future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA people_service 
GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA people_service 
GRANT ALL ON SEQUENCES TO service_role;

-- =====================================================
-- GRANT AUTHENTICATED ROLE ACCESS (for frontend users)
-- =====================================================
-- Authenticated users need CRUD operations, RLS policies will control row-level access

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA people_service TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA people_service TO authenticated;

-- Future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA people_service 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA people_service 
GRANT USAGE ON SEQUENCES TO authenticated;

-- =====================================================
-- UPDATE RLS POLICIES TO USE CORRECT SCHEMA
-- =====================================================
-- Recreate policies to ensure they work with people_service schema

-- People policies
DROP POLICY IF EXISTS "Anyone can view people" ON people_service.people;
DROP POLICY IF EXISTS "Authenticated users can manage people" ON people_service.people;

CREATE POLICY "Anyone can view people" 
ON people_service.people FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage people" 
ON people_service.people FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Teams policies
DROP POLICY IF EXISTS "Anyone can view teams" ON people_service.teams;
DROP POLICY IF EXISTS "Authenticated users can manage teams" ON people_service.teams;

CREATE POLICY "Anyone can view teams" 
ON people_service.teams FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage teams" 
ON people_service.teams FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Team Members policies
DROP POLICY IF EXISTS "Anyone can view team members" ON people_service.team_members;
DROP POLICY IF EXISTS "Authenticated users can manage team members" ON people_service.team_members;

CREATE POLICY "Anyone can view team members" 
ON people_service.team_members FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage team members" 
ON people_service.team_members FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Skills policies
DROP POLICY IF EXISTS "Anyone can view skills" ON people_service.skills;
DROP POLICY IF EXISTS "Authenticated users can manage skills" ON people_service.skills;

CREATE POLICY "Anyone can view skills" 
ON people_service.skills FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage skills" 
ON people_service.skills FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Person Skills policies
DROP POLICY IF EXISTS "Anyone can view person skills" ON people_service.person_skills;
DROP POLICY IF EXISTS "Authenticated users can manage person skills" ON people_service.person_skills;

CREATE POLICY "Anyone can view person skills" 
ON people_service.person_skills FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage person skills" 
ON people_service.person_skills FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Crafts policies
DROP POLICY IF EXISTS "Anyone can view crafts" ON people_service.crafts;
DROP POLICY IF EXISTS "Authenticated users can manage crafts" ON people_service.crafts;

CREATE POLICY "Anyone can view crafts" 
ON people_service.crafts FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage crafts" 
ON people_service.crafts FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Person Crafts policies
DROP POLICY IF EXISTS "Anyone can view person crafts" ON people_service.person_crafts;
DROP POLICY IF EXISTS "Authenticated users can manage person crafts" ON people_service.person_crafts;

CREATE POLICY "Anyone can view person crafts" 
ON people_service.person_crafts FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage person crafts" 
ON people_service.person_crafts FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Person Business Areas policies
DROP POLICY IF EXISTS "Anyone can view person business areas" ON people_service.person_business_areas;
DROP POLICY IF EXISTS "Authenticated users can manage person business areas" ON people_service.person_business_areas;

CREATE POLICY "Anyone can view person business areas" 
ON people_service.person_business_areas FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage person business areas" 
ON people_service.person_business_areas FOR ALL 
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- DOCUMENTATION
-- =====================================================
COMMENT ON SCHEMA people_service IS 
'People & Labor Service - Contains people, teams, skills, and crafts data. 
Service role has full access for edge functions. 
Authenticated role has CRUD access controlled by RLS policies.';