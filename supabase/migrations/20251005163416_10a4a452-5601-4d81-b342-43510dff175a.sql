-- ============================================================================
-- Job Plans Service Schema Migration (Final - Simplified)
-- ============================================================================

-- Step 1: Create schema
CREATE SCHEMA IF NOT EXISTS jobplans_service;

-- Step 2: Move tables from public to jobplans_service (preserves existing indexes)
DO $$ 
BEGIN
  -- Move job_plans
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'job_plans'
  ) THEN
    ALTER TABLE public.job_plans SET SCHEMA jobplans_service;
  END IF;

  -- Move job_plan_tasks
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'job_plan_tasks'
  ) THEN
    ALTER TABLE public.job_plan_tasks SET SCHEMA jobplans_service;
  END IF;

  -- Move job_plan_parts
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'job_plan_parts'
  ) THEN
    ALTER TABLE public.job_plan_parts SET SCHEMA jobplans_service;
  END IF;

  -- Move job_plan_tools
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'job_plan_tools'
  ) THEN
    ALTER TABLE public.job_plan_tools SET SCHEMA jobplans_service;
  END IF;

  -- Move job_plan_documents
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'job_plan_documents'
  ) THEN
    ALTER TABLE public.job_plan_documents SET SCHEMA jobplans_service;
  END IF;

  -- Move job_plan_task_skills
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'job_plan_task_skills'
  ) THEN
    ALTER TABLE public.job_plan_task_skills SET SCHEMA jobplans_service;
  END IF;
END $$;

-- Step 3: Create backward-compatible views in public schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'jobplans_service' AND table_name = 'job_plans'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW public.job_plans AS SELECT * FROM jobplans_service.job_plans';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'jobplans_service' AND table_name = 'job_plan_tasks'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW public.job_plan_tasks AS SELECT * FROM jobplans_service.job_plan_tasks';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'jobplans_service' AND table_name = 'job_plan_parts'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW public.job_plan_parts AS SELECT * FROM jobplans_service.job_plan_parts';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'jobplans_service' AND table_name = 'job_plan_tools'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW public.job_plan_tools AS SELECT * FROM jobplans_service.job_plan_tools';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'jobplans_service' AND table_name = 'job_plan_documents'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW public.job_plan_documents AS SELECT * FROM jobplans_service.job_plan_documents';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'jobplans_service' AND table_name = 'job_plan_task_skills'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW public.job_plan_task_skills AS SELECT * FROM jobplans_service.job_plan_task_skills';
  END IF;
END $$;

-- Step 4: Grant permissions
-- Authenticated users can read through views
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Service role gets full access to actual tables in jobplans_service
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA jobplans_service TO service_role;