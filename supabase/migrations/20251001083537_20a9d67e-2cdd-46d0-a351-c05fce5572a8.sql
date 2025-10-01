-- Create asset_skill_requirements table
CREATE TABLE public.asset_skill_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level_required proficiency_level NOT NULL DEFAULT 'intermediate',
  is_mandatory BOOLEAN DEFAULT true,
  priority_order INTEGER DEFAULT 1,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(asset_id, skill_id)
);

-- Enable RLS on asset_skill_requirements
ALTER TABLE public.asset_skill_requirements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for asset_skill_requirements
CREATE POLICY "Users can view their organization's asset skill requirements"
  ON public.asset_skill_requirements FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.asset_skill_requirements FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's asset skill requirements"
  ON public.asset_skill_requirements FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's asset skill requirements"
  ON public.asset_skill_requirements FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- Create job_plan_task_skills table
CREATE TABLE public.job_plan_task_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_plan_task_id UUID NOT NULL REFERENCES public.job_plan_tasks(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level_required proficiency_level NOT NULL DEFAULT 'intermediate',
  estimated_time_minutes INTEGER,
  is_critical BOOLEAN DEFAULT false,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(job_plan_task_id, skill_id)
);

-- Enable RLS on job_plan_task_skills
ALTER TABLE public.job_plan_task_skills ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for job_plan_task_skills
CREATE POLICY "Users can view their organization's job plan task skills"
  ON public.job_plan_task_skills FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.job_plan_task_skills FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's job plan task skills"
  ON public.job_plan_task_skills FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's job plan task skills"
  ON public.job_plan_task_skills FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- Create work_order_skill_requirements table
CREATE TABLE public.work_order_skill_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level_required proficiency_level NOT NULL DEFAULT 'intermediate',
  is_fulfilled BOOLEAN DEFAULT false,
  assigned_person_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(work_order_id, skill_id)
);

-- Enable RLS on work_order_skill_requirements
ALTER TABLE public.work_order_skill_requirements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for work_order_skill_requirements
CREATE POLICY "Users can view their organization's work order skill requirements"
  ON public.work_order_skill_requirements FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.work_order_skill_requirements FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's work order skill requirements"
  ON public.work_order_skill_requirements FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's work order skill requirements"
  ON public.work_order_skill_requirements FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- Create triggers for updated_at
CREATE TRIGGER update_asset_skill_requirements_updated_at
  BEFORE UPDATE ON public.asset_skill_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_plan_task_skills_updated_at
  BEFORE UPDATE ON public.job_plan_task_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_order_skill_requirements_updated_at
  BEFORE UPDATE ON public.work_order_skill_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get recommended technicians for a work order
CREATE OR REPLACE FUNCTION public.get_recommended_technicians(
  _work_order_id UUID,
  _organization_id UUID
)
RETURNS TABLE (
  person_id UUID,
  person_name TEXT,
  match_percentage NUMERIC,
  matched_skills JSONB,
  missing_skills JSONB,
  total_experience_years NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH work_order_skills AS (
    SELECT skill_id, proficiency_level_required
    FROM work_order_skill_requirements
    WHERE work_order_id = _work_order_id
  ),
  person_skills_matched AS (
    SELECT 
      p.id AS person_id,
      CONCAT(p.first_name, ' ', p.last_name) AS person_name,
      ps.skill_id,
      ps.proficiency_level,
      ps.years_of_experience,
      wos.proficiency_level_required,
      CASE 
        WHEN ps.proficiency_level >= wos.proficiency_level_required THEN true
        ELSE false
      END AS meets_requirement
    FROM people p
    JOIN person_skills ps ON p.id = ps.person_id
    JOIN work_order_skills wos ON ps.skill_id = wos.skill_id
    WHERE p.organization_id = _organization_id
      AND p.is_active = true
      AND ps.is_active = true
  )
  SELECT 
    psm.person_id,
    psm.person_name,
    ROUND(
      (COUNT(*) FILTER (WHERE psm.meets_requirement = true)::NUMERIC / 
       NULLIF((SELECT COUNT(*) FROM work_order_skills)::NUMERIC, 0)) * 100,
      2
    ) AS match_percentage,
    jsonb_agg(
      jsonb_build_object(
        'skill_id', psm.skill_id,
        'proficiency_level', psm.proficiency_level,
        'meets_requirement', psm.meets_requirement
      )
    ) FILTER (WHERE psm.meets_requirement = true) AS matched_skills,
    jsonb_agg(
      jsonb_build_object(
        'skill_id', psm.skill_id,
        'required_level', psm.proficiency_level_required,
        'current_level', psm.proficiency_level
      )
    ) FILTER (WHERE psm.meets_requirement = false) AS missing_skills,
    COALESCE(SUM(psm.years_of_experience), 0) AS total_experience_years
  FROM person_skills_matched psm
  GROUP BY psm.person_id, psm.person_name
  ORDER BY match_percentage DESC, total_experience_years DESC;
END;
$$;