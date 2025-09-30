-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user-organization membership table
CREATE TABLE public.user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- Create helper function to get user's organization IDs
CREATE OR REPLACE FUNCTION public.get_user_organizations(_user_id UUID)
RETURNS UUID[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(organization_id)
  FROM user_organizations
  WHERE user_id = _user_id
$$;

-- Create helper function to check if user has cross-project access
CREATE OR REPLACE FUNCTION public.has_cross_project_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = _user_id
      AND r.name = 'tnb_management'
      AND r.is_active = true
  )
$$;

-- RLS Policies for organizations table
CREATE POLICY "Users can view active organizations"
  ON public.organizations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_organizations table
CREATE POLICY "Users can view their memberships"
  ON public.user_organizations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage memberships"
  ON public.user_organizations FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Insert MSMS organization
INSERT INTO public.organizations (name, code, description, is_active)
VALUES ('MSMS', 'MSMS', 'Main System - Default Organization', true);

-- Assign all existing users to MSMS organization
INSERT INTO public.user_organizations (user_id, organization_id)
SELECT u.id, o.id
FROM auth.users u
CROSS JOIN public.organizations o
WHERE o.code = 'MSMS';

-- Create TNB Management role
INSERT INTO public.roles (name, display_name, description, is_system_role, is_active, permissions)
VALUES (
  'tnb_management',
  'TNB Management',
  'TNB management team with cross-project access',
  true,
  true,
  jsonb_build_object(
    'cross_project_access', jsonb_build_object('enabled', true),
    'admin_panel', jsonb_build_object('access', true),
    'assets', jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true),
    'work_orders', jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true, 'assign', true),
    'inventory', jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true),
    'people', jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true),
    'safety', jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true),
    'reports', jsonb_build_object('view', true, 'export', true),
    'analytics', jsonb_build_object('view', true, 'cross_project', true)
  )
);