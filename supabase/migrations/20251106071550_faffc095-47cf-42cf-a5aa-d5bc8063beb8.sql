-- ============================================================================
-- Consolidate Job Plans to Work Order Service
-- ============================================================================
-- This migration:
-- 1. Drops the redundant jobplans_service schema and its views
-- 2. Updates public schema views to point directly to workorder_service tables
-- 3. Ensures proper foreign key relationships for PostgREST
-- ============================================================================

-- Drop redundant jobplans_service schema completely
DROP SCHEMA IF EXISTS jobplans_service CASCADE;

-- Drop existing broken public views
DROP VIEW IF EXISTS public.job_plans CASCADE;
DROP VIEW IF EXISTS public.job_plan_tasks CASCADE;
DROP VIEW IF EXISTS public.job_plan_parts CASCADE;
DROP VIEW IF EXISTS public.job_plan_tools CASCADE;
DROP VIEW IF EXISTS public.job_plan_documents CASCADE;

-- Recreate public views pointing directly to workorder_service tables
-- This ensures PostgREST can properly resolve foreign key relationships

CREATE VIEW public.job_plans AS 
SELECT * FROM workorder_service.job_plans;

CREATE VIEW public.job_plan_tasks AS 
SELECT * FROM workorder_service.job_plan_tasks;

CREATE VIEW public.job_plan_parts AS 
SELECT * FROM workorder_service.job_plan_parts;

CREATE VIEW public.job_plan_tools AS 
SELECT * FROM workorder_service.job_plan_tools;

CREATE VIEW public.job_plan_documents AS 
SELECT * FROM workorder_service.job_plan_documents;

-- Grant appropriate permissions on views
GRANT SELECT ON public.job_plans TO authenticated;
GRANT SELECT ON public.job_plan_tasks TO authenticated;
GRANT SELECT ON public.job_plan_parts TO authenticated;
GRANT SELECT ON public.job_plan_tools TO authenticated;
GRANT SELECT ON public.job_plan_documents TO authenticated;

-- Add comment explaining the architecture
COMMENT ON VIEW public.job_plans IS 
'View pointing to workorder_service.job_plans. Job plans are managed by work-order-service microservice.';

COMMENT ON VIEW public.job_plan_tasks IS 
'View pointing to workorder_service.job_plan_tasks. Managed by work-order-service microservice.';

COMMENT ON VIEW public.job_plan_parts IS 
'View pointing to workorder_service.job_plan_parts. Managed by work-order-service microservice.';

COMMENT ON VIEW public.job_plan_tools IS 
'View pointing to workorder_service.job_plan_tools. Managed by work-order-service microservice.';

COMMENT ON VIEW public.job_plan_documents IS 
'View pointing to workorder_service.job_plan_documents. Managed by work-order-service microservice.';