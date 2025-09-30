-- Create PM frequency enums
CREATE TYPE pm_frequency_type AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom');
CREATE TYPE pm_frequency_unit AS ENUM ('days', 'weeks', 'months', 'years');
CREATE TYPE pm_status AS ENUM ('active', 'paused', 'suspended', 'completed');

-- Create pm_schedules table
CREATE TABLE public.pm_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_number VARCHAR NOT NULL UNIQUE,
  title VARCHAR NOT NULL,
  description TEXT,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  job_plan_id UUID REFERENCES public.job_plans(id) ON DELETE SET NULL,
  frequency_type pm_frequency_type NOT NULL,
  frequency_value INTEGER NOT NULL DEFAULT 1,
  frequency_unit pm_frequency_unit,
  start_date DATE NOT NULL,
  next_due_date DATE,
  last_completed_date DATE,
  lead_time_days INTEGER DEFAULT 7,
  assigned_to UUID REFERENCES public.people(id) ON DELETE SET NULL,
  assigned_team_id UUID,
  priority VARCHAR DEFAULT 'medium',
  estimated_duration_hours NUMERIC,
  is_active BOOLEAN DEFAULT true,
  status pm_status DEFAULT 'active',
  auto_generate_wo BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT true,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pm_schedule_history table
CREATE TABLE public.pm_schedule_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_schedule_id UUID NOT NULL REFERENCES public.pm_schedules(id) ON DELETE CASCADE,
  work_order_id UUID,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status VARCHAR NOT NULL,
  notes TEXT,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pm_generated_work_orders table
CREATE TABLE public.pm_generated_work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_schedule_id UUID NOT NULL REFERENCES public.pm_schedules(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL,
  generation_date TIMESTAMPTZ DEFAULT NOW(),
  due_date DATE NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_pm_schedules_asset_id ON public.pm_schedules(asset_id);
CREATE INDEX idx_pm_schedules_job_plan_id ON public.pm_schedules(job_plan_id);
CREATE INDEX idx_pm_schedules_next_due_date ON public.pm_schedules(next_due_date);
CREATE INDEX idx_pm_schedules_assigned_to ON public.pm_schedules(assigned_to);
CREATE INDEX idx_pm_schedules_organization_id ON public.pm_schedules(organization_id);
CREATE INDEX idx_pm_schedules_status ON public.pm_schedules(status);

CREATE INDEX idx_pm_schedule_history_pm_schedule_id ON public.pm_schedule_history(pm_schedule_id);
CREATE INDEX idx_pm_schedule_history_organization_id ON public.pm_schedule_history(organization_id);

CREATE INDEX idx_pm_generated_work_orders_pm_schedule_id ON public.pm_generated_work_orders(pm_schedule_id);
CREATE INDEX idx_pm_generated_work_orders_organization_id ON public.pm_generated_work_orders(organization_id);

-- Enable RLS on all tables
ALTER TABLE public.pm_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_schedule_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_generated_work_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pm_schedules
CREATE POLICY "Users can view their organization's PM schedules"
  ON public.pm_schedules
  FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.pm_schedules
  FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's PM schedules"
  ON public.pm_schedules
  FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's PM schedules"
  ON public.pm_schedules
  FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- RLS Policies for pm_schedule_history
CREATE POLICY "Users can view their organization's PM history"
  ON public.pm_schedule_history
  FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.pm_schedule_history
  FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's PM history"
  ON public.pm_schedule_history
  FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's PM history"
  ON public.pm_schedule_history
  FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- RLS Policies for pm_generated_work_orders
CREATE POLICY "Users can view their organization's generated WOs"
  ON public.pm_generated_work_orders
  FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.pm_generated_work_orders
  FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's generated WOs"
  ON public.pm_generated_work_orders
  FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's generated WOs"
  ON public.pm_generated_work_orders
  FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_pm_schedules_updated_at
  BEFORE UPDATE ON public.pm_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.pm_schedules IS 'Preventive maintenance schedules for assets';
COMMENT ON TABLE public.pm_schedule_history IS 'Audit trail of PM schedule completions and changes';
COMMENT ON TABLE public.pm_generated_work_orders IS 'Links PM schedules to auto-generated work orders';