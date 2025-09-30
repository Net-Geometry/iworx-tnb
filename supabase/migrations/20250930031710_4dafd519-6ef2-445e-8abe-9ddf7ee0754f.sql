-- Drop all policies that depend on the old has_role function
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON roles;

-- Drop the old has_role function that uses app_role enum
DROP FUNCTION IF EXISTS has_role(uuid, app_role);

-- Recreate policy on roles table using text-based has_role
CREATE POLICY "Admins can manage roles"
ON roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Recreate policies on user_roles table using text-based has_role
CREATE POLICY "Admins can manage user roles"
ON user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));