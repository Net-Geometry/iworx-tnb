-- Create roles table
CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_role BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create policies for roles table
CREATE POLICY "Anyone can view active roles"
  ON public.roles
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage roles"
  ON public.roles
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial roles FIRST
INSERT INTO public.roles (name, display_name, description, permissions, is_system_role) VALUES
(
  'admin',
  'Administrator',
  'Full system access with all permissions',
  '{
    "assets": {"view": true, "create": true, "edit": true, "delete": true},
    "work_orders": {"view": true, "create": true, "edit": true, "delete": true, "assign": true},
    "inventory": {"view": true, "create": true, "edit": true, "delete": true},
    "safety": {"view": true, "create": true, "edit": true, "delete": true},
    "admin_panel": {"access": true, "user_management": true, "system_settings": true, "role_management": true}
  }'::jsonb,
  true
),
(
  'manager',
  'Maintenance Manager',
  'Can manage assets, work orders, and inventory',
  '{
    "assets": {"view": true, "create": true, "edit": true, "delete": false},
    "work_orders": {"view": true, "create": true, "edit": true, "delete": false, "assign": true},
    "inventory": {"view": true, "create": true, "edit": true, "delete": false},
    "safety": {"view": true, "create": true, "edit": true, "delete": false},
    "admin_panel": {"access": false, "user_management": false, "system_settings": false, "role_management": false}
  }'::jsonb,
  true
),
(
  'technician',
  'Technician',
  'Can view and update work orders, limited asset access',
  '{
    "assets": {"view": true, "create": false, "edit": true, "delete": false},
    "work_orders": {"view": true, "create": true, "edit": true, "delete": false, "assign": false},
    "inventory": {"view": true, "create": false, "edit": true, "delete": false},
    "safety": {"view": true, "create": true, "edit": false, "delete": false},
    "admin_panel": {"access": false, "user_management": false, "system_settings": false, "role_management": false}
  }'::jsonb,
  true
),
(
  'viewer',
  'Viewer',
  'Read-only access to most features',
  '{
    "assets": {"view": true, "create": false, "edit": false, "delete": false},
    "work_orders": {"view": true, "create": false, "edit": false, "delete": false, "assign": false},
    "inventory": {"view": true, "create": false, "edit": false, "delete": false},
    "safety": {"view": true, "create": false, "edit": false, "delete": false},
    "admin_panel": {"access": false, "user_management": false, "system_settings": false, "role_management": false}
  }'::jsonb,
  true
);

-- Add role_id column to user_roles as NULLABLE first
ALTER TABLE public.user_roles ADD COLUMN role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE;

-- Migrate existing data - map enum 'admin' to admin role id, 'user' to viewer role id
UPDATE public.user_roles
SET role_id = (SELECT id FROM public.roles WHERE name = 'admin')
WHERE role = 'admin';

UPDATE public.user_roles
SET role_id = (SELECT id FROM public.roles WHERE name = 'viewer')
WHERE role = 'user';

-- Now make role_id NOT NULL
ALTER TABLE public.user_roles ALTER COLUMN role_id SET NOT NULL;

-- Drop the old enum column
ALTER TABLE public.user_roles DROP COLUMN role;

-- Update has_role function to work with role names
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = _user_id
      AND r.name = _role_name
      AND r.is_active = true
  )
$$;

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(r.permissions),
    '[]'::jsonb
  )
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = _user_id
    AND r.is_active = true
$$;