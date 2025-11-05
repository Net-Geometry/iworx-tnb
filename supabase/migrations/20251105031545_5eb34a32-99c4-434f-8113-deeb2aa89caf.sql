-- Grant EXECUTE permissions on helper functions to authenticated and anon roles
-- This allows RLS policies to execute these functions

GRANT EXECUTE ON FUNCTION public.get_user_organizations(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_cross_project_access(UUID) TO authenticated, anon;