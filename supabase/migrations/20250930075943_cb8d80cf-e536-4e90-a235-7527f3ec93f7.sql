-- Create pm_schedule_assignments table for multi-user assignment
CREATE TABLE public.pm_schedule_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pm_schedule_id UUID NOT NULL REFERENCES public.pm_schedules(id) ON DELETE CASCADE,
  assigned_person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  assignment_role VARCHAR(50) DEFAULT 'assigned' CHECK (assignment_role IN ('primary', 'secondary', 'reviewer', 'assigned')),
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pm_schedule_id, assigned_person_id)
);

-- Enable RLS
ALTER TABLE public.pm_schedule_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization's assignments"
  ON public.pm_schedule_assignments
  FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.pm_schedule_assignments
  FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's assignments"
  ON public.pm_schedule_assignments
  FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's assignments"
  ON public.pm_schedule_assignments
  FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- Add trigger for updated_at
CREATE TRIGGER update_pm_schedule_assignments_updated_at
  BEFORE UPDATE ON public.pm_schedule_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_pm_schedule_assignments_schedule_id ON public.pm_schedule_assignments(pm_schedule_id);
CREATE INDEX idx_pm_schedule_assignments_person_id ON public.pm_schedule_assignments(assigned_person_id);