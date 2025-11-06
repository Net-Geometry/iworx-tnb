-- ============================================================================
-- Consolidate PM Schedules to Work Order Service
-- ============================================================================
-- This migration:
-- 1. Drops the redundant pm_service schema and its views
-- 2. Updates public schema views to point directly to workorder_service tables
-- 3. Ensures proper foreign key relationships for PostgREST
-- ============================================================================

-- Drop redundant pm_service schema completely
DROP SCHEMA IF EXISTS pm_service CASCADE;

-- Drop existing broken public views
DROP VIEW IF EXISTS public.pm_schedules CASCADE;

-- Recreate public view pointing directly to workorder_service table
-- This ensures PostgREST can properly resolve foreign key relationships

CREATE VIEW public.pm_schedules AS 
SELECT * FROM workorder_service.pm_schedules;

-- Grant appropriate permissions on view
GRANT SELECT ON public.pm_schedules TO authenticated;

-- Add comment explaining the architecture
COMMENT ON VIEW public.pm_schedules IS 
'View pointing to workorder_service.pm_schedules. PM schedules are managed by work-order-service microservice.';