-- Create enum types
CREATE TYPE employment_status AS ENUM ('active', 'inactive', 'on_leave', 'terminated');
CREATE TYPE team_shift AS ENUM ('day', 'night', 'swing', 'rotating');
CREATE TYPE team_role AS ENUM ('leader', 'member', 'supervisor');
CREATE TYPE skill_category AS ENUM ('mechanical', 'electrical', 'plumbing', 'hvac', 'instrumentation', 'safety', 'software', 'other');
CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Create people table
CREATE TABLE public.people (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_number VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  hire_date DATE,
  employment_status employment_status DEFAULT 'active',
  job_title VARCHAR,
  department VARCHAR,
  hourly_rate NUMERIC,
  certifications TEXT[],
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name VARCHAR UNIQUE NOT NULL,
  team_code VARCHAR UNIQUE NOT NULL,
  description TEXT,
  team_leader_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
  department VARCHAR,
  shift team_shift,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  role_in_team team_role DEFAULT 'member',
  assigned_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_id, person_id)
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name VARCHAR UNIQUE NOT NULL,
  skill_code VARCHAR UNIQUE NOT NULL,
  category skill_category DEFAULT 'other',
  description TEXT,
  certification_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create person_skills table
CREATE TABLE public.person_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level proficiency_level DEFAULT 'beginner',
  years_experience NUMERIC,
  certified BOOLEAN DEFAULT false,
  certification_date DATE,
  certification_expiry DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(person_id, skill_id)
);

-- Enable RLS
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for people
CREATE POLICY "Anyone can view people" ON public.people FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage people" ON public.people FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for teams
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage teams" ON public.teams FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for team_members
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage team members" ON public.team_members FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for skills
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage skills" ON public.skills FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for person_skills
CREATE POLICY "Anyone can view person skills" ON public.person_skills FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage person skills" ON public.person_skills FOR ALL USING (auth.uid() IS NOT NULL);

-- Create updated_at triggers
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_person_skills_updated_at BEFORE UPDATE ON public.person_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial skills
INSERT INTO public.skills (skill_name, skill_code, category, description, certification_required) VALUES
('Bearing Replacement', 'MECH-001', 'mechanical', 'Replace and maintain various types of bearings', false),
('Belt Alignment', 'MECH-002', 'mechanical', 'Align and tension drive belts', false),
('Pump Maintenance', 'MECH-003', 'mechanical', 'Service and repair pumps', false),
('Motor Repair', 'ELEC-001', 'electrical', 'Diagnose and repair electric motors', true),
('Control Systems', 'ELEC-002', 'electrical', 'Work on control panels and systems', true),
('PLC Programming', 'ELEC-003', 'electrical', 'Program and troubleshoot PLCs', true),
('AC Repair', 'HVAC-001', 'hvac', 'Repair air conditioning systems', true),
('Ventilation Systems', 'HVAC-002', 'hvac', 'Install and maintain ventilation', false),
('Refrigeration', 'HVAC-003', 'hvac', 'Service refrigeration equipment', true),
('LOTO Certified', 'SAFE-001', 'safety', 'Lockout/Tagout certification', true),
('Confined Space', 'SAFE-002', 'safety', 'Confined space entry certification', true),
('First Aid', 'SAFE-003', 'safety', 'First aid and CPR certified', true),
('Sensor Calibration', 'INST-001', 'instrumentation', 'Calibrate measurement sensors', false),
('PID Tuning', 'INST-002', 'instrumentation', 'Tune PID control loops', false),
('Plumbing Systems', 'PLUM-001', 'plumbing', 'Install and repair plumbing', false),
('Pipe Fitting', 'PLUM-002', 'plumbing', 'Fit and join pipes', false);

-- Seed initial teams
INSERT INTO public.teams (team_name, team_code, description, department, shift) VALUES
('Day Shift Maintenance', 'TEAM-DAY', 'Primary maintenance crew for day shift operations', 'Maintenance', 'day'),
('Night Shift Maintenance', 'TEAM-NIGHT', 'Maintenance crew covering night operations', 'Maintenance', 'night'),
('Reliability Team', 'TEAM-REL', 'Focused on reliability improvements and predictive maintenance', 'Engineering', 'day'),
('Emergency Response Team', 'TEAM-EMERG', 'Rapid response team for critical breakdowns', 'Maintenance', 'rotating');