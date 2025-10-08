-- Add resolved_at column to safety_service.safety_incidents table
ALTER TABLE safety_service.safety_incidents 
ADD COLUMN resolved_at timestamp with time zone;

-- Add index for efficient querying of resolved incidents
CREATE INDEX idx_safety_incidents_resolved_at 
ON safety_service.safety_incidents(resolved_at) 
WHERE resolved_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN safety_service.safety_incidents.resolved_at IS 
'Timestamp when incident status was changed to resolved';

-- Drop and recreate public view to include new resolved_at column and refresh PostgREST cache
DROP VIEW IF EXISTS public.safety_incidents CASCADE;

CREATE VIEW public.safety_incidents WITH (security_invoker = true) AS 
SELECT * FROM safety_service.safety_incidents;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.safety_incidents TO authenticated;

-- Update comment to force PostgREST schema cache refresh
COMMENT ON VIEW public.safety_incidents IS 
'Public view for safety incidents - includes resolved_at timestamp for audit trail';