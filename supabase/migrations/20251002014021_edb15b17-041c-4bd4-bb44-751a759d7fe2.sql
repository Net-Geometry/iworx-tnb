-- Create workflow steps table for defining step configurations
CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  step_order INTEGER NOT NULL,
  required_role VARCHAR(50) NOT NULL,
  can_approve BOOLEAN DEFAULT false,
  can_assign BOOLEAN DEFAULT false,
  can_transition_to UUID[],
  auto_assign_logic JSONB,
  sla_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create work order workflow state table
CREATE TABLE IF NOT EXISTS public.work_order_workflow_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL,
  current_step_id UUID,
  assigned_to_user_id UUID,
  pending_approval_from_role VARCHAR(50),
  step_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sla_due_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create work order approvals history table
CREATE TABLE IF NOT EXISTS public.work_order_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL,
  step_id UUID,
  approved_by_user_id UUID,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  comments TEXT,
  approval_action VARCHAR(50) NOT NULL,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create incident workflow state table
CREATE TABLE IF NOT EXISTS public.incident_workflow_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  current_step_id UUID,
  assigned_to_user_id UUID,
  pending_approval_from_role VARCHAR(50),
  step_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sla_due_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create incident approvals history table
CREATE TABLE IF NOT EXISTS public.incident_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  step_id UUID,
  approved_by_user_id UUID,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  comments TEXT,
  approval_action VARCHAR(50) NOT NULL,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create role assignment rules table
CREATE TABLE IF NOT EXISTS public.role_assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL,
  asset_type VARCHAR(100),
  maintenance_type VARCHAR(100),
  priority VARCHAR(50),
  severity VARCHAR(50),
  auto_assign BOOLEAN DEFAULT false,
  escalation_hours INTEGER,
  backup_role_name VARCHAR(50),
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_workflow_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_workflow_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_assignment_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view workflow steps" ON public.workflow_steps FOR SELECT USING (true);
CREATE POLICY "Admins can manage workflow steps" ON public.workflow_steps FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view work order workflow state" ON public.work_order_workflow_state FOR SELECT USING (true);
CREATE POLICY "Users can update work order workflow state" ON public.work_order_workflow_state FOR ALL USING (true);

CREATE POLICY "Users can view work order approvals" ON public.work_order_approvals FOR SELECT USING (true);
CREATE POLICY "Users can insert work order approvals" ON public.work_order_approvals FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view incident workflow state" ON public.incident_workflow_state FOR SELECT USING (true);
CREATE POLICY "Users can update incident workflow state" ON public.incident_workflow_state FOR ALL USING (true);

CREATE POLICY "Users can view incident approvals" ON public.incident_approvals FOR SELECT USING (true);
CREATE POLICY "Users can insert incident approvals" ON public.incident_approvals FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view role assignment rules" ON public.role_assignment_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage role assignment rules" ON public.role_assignment_rules FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON public.workflow_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_order_workflow_state_updated_at BEFORE UPDATE ON public.work_order_workflow_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incident_workflow_state_updated_at BEFORE UPDATE ON public.incident_workflow_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_assignment_rules_updated_at BEFORE UPDATE ON public.role_assignment_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default workflow steps for Work Orders
INSERT INTO public.workflow_steps (name, description, module, step_order, required_role, can_approve, can_assign, sla_hours) VALUES
('Draft', 'Initial draft state', 'work_orders', 1, 'technician', false, false, NULL),
('Pending Approval', 'Awaiting supervisor approval', 'work_orders', 2, 'supervisor', true, false, 24),
('Approved', 'Approved and ready for assignment', 'work_orders', 3, 'supervisor', false, true, 4),
('Assigned', 'Assigned to technician', 'work_orders', 4, 'technician', false, false, NULL),
('In Progress', 'Work in progress', 'work_orders', 5, 'technician', false, false, NULL),
('Pending Review', 'Awaiting completion review', 'work_orders', 6, 'supervisor', true, false, 8),
('Completed', 'Work completed and approved', 'work_orders', 7, 'supervisor', false, false, NULL);

-- Insert default workflow steps for Safety Incidents
INSERT INTO public.workflow_steps (name, description, module, step_order, required_role, can_approve, can_assign, sla_hours) VALUES
('Draft', 'Initial draft state', 'safety_incidents', 1, 'reporter', false, false, NULL),
('Reported', 'Incident reported', 'safety_incidents', 2, 'safety_supervisor', false, true, 2),
('Assigned Investigator', 'Investigator assigned', 'safety_incidents', 3, 'investigator', false, false, NULL),
('Investigating', 'Under investigation', 'safety_incidents', 4, 'investigator', false, false, 72),
('Pending Review', 'Investigation complete, awaiting review', 'safety_incidents', 5, 'safety_manager', true, false, 24),
('Corrective Actions', 'Implementing corrective actions', 'safety_incidents', 6, 'safety_supervisor', false, false, 168),
('Resolved', 'Incident resolved', 'safety_incidents', 7, 'safety_manager', true, false, NULL),
('Closed', 'Incident closed', 'safety_incidents', 8, 'compliance_officer', false, false, NULL);