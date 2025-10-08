-- Drop the existing view to clear PostgREST cache
DROP VIEW IF EXISTS public.safety_incidents CASCADE;

-- Recreate the view with security_invoker (maintains microservices security model)
CREATE VIEW public.safety_incidents WITH (security_invoker = true) AS 
SELECT * FROM safety_service.safety_incidents;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.safety_incidents TO authenticated;

-- Add documentation
COMMENT ON VIEW public.safety_incidents IS 
'Public view for safety incidents - delegates to safety_service.safety_incidents with security_invoker. Includes engineering assessment fields.';