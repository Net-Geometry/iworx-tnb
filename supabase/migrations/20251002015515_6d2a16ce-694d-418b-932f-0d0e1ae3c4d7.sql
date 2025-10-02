-- Create workflow templates table for storing custom workflow configurations
CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL, -- 'work_orders' or 'safety_incidents'
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, module, name)
);

-- Create workflow template steps table
CREATE TABLE IF NOT EXISTS public.workflow_template_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  step_order INTEGER NOT NULL,
  step_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'approval', 'assignment', 'review'
  sla_hours INTEGER,
  is_required BOOLEAN DEFAULT true,
  approval_type VARCHAR(50) DEFAULT 'single', -- 'single', 'multiple', 'unanimous'
  auto_assign_enabled BOOLEAN DEFAULT false,
  auto_assign_logic JSONB,
  form_fields JSONB, -- Custom form fields for this step
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(template_id, step_order)
);

-- Create workflow step conditions table for if/then logic
CREATE TABLE IF NOT EXISTS public.workflow_step_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES public.workflow_template_steps(id) ON DELETE CASCADE,
  condition_type VARCHAR(50) NOT NULL, -- 'field_value', 'role_check', 'time_based', 'custom'
  field_name VARCHAR(100), -- e.g., 'priority', 'cost', 'asset_type'
  operator VARCHAR(20), -- 'equals', 'greater_than', 'less_than', 'contains', 'in'
  value JSONB, -- The value to compare against
  action VARCHAR(50) NOT NULL, -- 'skip_step', 'route_to_step', 'require_approval', 'escalate'
  target_step_id UUID REFERENCES public.workflow_template_steps(id),
  priority INTEGER DEFAULT 0, -- For evaluating multiple conditions in order
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow step role assignments table
CREATE TABLE IF NOT EXISTS public.workflow_step_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES public.workflow_template_steps(id) ON DELETE CASCADE,
  role_name VARCHAR(100) NOT NULL, -- Role that can perform actions
  can_approve BOOLEAN DEFAULT false,
  can_reject BOOLEAN DEFAULT false,
  can_assign BOOLEAN DEFAULT false,
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  is_primary_assignee BOOLEAN DEFAULT false,
  is_backup_assignee BOOLEAN DEFAULT false,
  assignment_logic JSONB, -- Dynamic assignment rules
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(step_id, role_name)
);

-- Create workflow transitions table
CREATE TABLE IF NOT EXISTS public.workflow_template_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  from_step_id UUID REFERENCES public.workflow_template_steps(id) ON DELETE CASCADE,
  to_step_id UUID REFERENCES public.workflow_template_steps(id) ON DELETE CASCADE,
  transition_name VARCHAR(100), -- 'approve', 'reject', 'escalate', 'complete'
  requires_comment BOOLEAN DEFAULT false,
  condition_group_id UUID, -- Group conditions together with AND/OR logic
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(template_id, from_step_id, to_step_id, transition_name)
);

-- Create indexes for performance
CREATE INDEX idx_workflow_templates_org ON public.workflow_templates(organization_id, module);
CREATE INDEX idx_workflow_template_steps_template ON public.workflow_template_steps(template_id, step_order);
CREATE INDEX idx_workflow_step_conditions_step ON public.workflow_step_conditions(step_id);
CREATE INDEX idx_workflow_step_roles_step ON public.workflow_step_role_assignments(step_id);
CREATE INDEX idx_workflow_transitions_template ON public.workflow_template_transitions(template_id);

-- Enable RLS
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_template_transitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_templates
CREATE POLICY "Users can view their organization's templates"
  ON public.workflow_templates FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Admins can manage templates"
  ON public.workflow_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for workflow_template_steps
CREATE POLICY "Users can view their organization's template steps"
  ON public.workflow_template_steps FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Admins can manage template steps"
  ON public.workflow_template_steps FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for workflow_step_conditions
CREATE POLICY "Users can view their organization's step conditions"
  ON public.workflow_step_conditions FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Admins can manage step conditions"
  ON public.workflow_step_conditions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for workflow_step_role_assignments
CREATE POLICY "Users can view their organization's step roles"
  ON public.workflow_step_role_assignments FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Admins can manage step roles"
  ON public.workflow_step_role_assignments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for workflow_template_transitions
CREATE POLICY "Users can view their organization's transitions"
  ON public.workflow_template_transitions FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Admins can manage transitions"
  ON public.workflow_template_transitions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON public.workflow_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_template_steps_updated_at
  BEFORE UPDATE ON public.workflow_template_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add template_id column to existing workflow state tables to track which template is being used
ALTER TABLE public.work_order_workflow_state 
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.workflow_templates(id);

ALTER TABLE public.incident_workflow_state 
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.workflow_templates(id);