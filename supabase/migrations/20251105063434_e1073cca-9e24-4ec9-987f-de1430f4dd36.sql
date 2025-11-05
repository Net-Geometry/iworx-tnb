-- ============================================
-- FIX ALL SCHEMA PERMISSIONS FOR AUTHENTICATED USERS
-- Issue: Authenticated users cannot access tables in service schemas
-- Solution: Re-grant all necessary permissions (only for existing schemas)
-- Date: November 5, 2025
-- ============================================

-- ============================================
-- GRANT SCHEMA USAGE (with conditional checks)
-- ============================================

DO $$ 
BEGIN
  -- Grant usage on existing schemas only
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'assets_service') THEN
    GRANT USAGE ON SCHEMA assets_service TO authenticated, service_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'workorder_service') THEN
    GRANT USAGE ON SCHEMA workorder_service TO authenticated, service_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'inventory_service') THEN
    GRANT USAGE ON SCHEMA inventory_service TO authenticated, service_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'people_service') THEN
    GRANT USAGE ON SCHEMA people_service TO authenticated, service_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'safety_service') THEN
    GRANT USAGE ON SCHEMA safety_service TO authenticated, service_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'pm_service') THEN
    GRANT USAGE ON SCHEMA pm_service TO authenticated, service_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'meters_service') THEN
    GRANT USAGE ON SCHEMA meters_service TO authenticated, service_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'notification_service') THEN
    GRANT USAGE ON SCHEMA notification_service TO authenticated, service_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'workflow_service') THEN
    GRANT USAGE ON SCHEMA workflow_service TO authenticated, service_role;
  END IF;
END $$;

-- ============================================
-- GRANT TABLE PERMISSIONS - ASSETS SERVICE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'assets_service') THEN
    GRANT ALL ON ALL TABLES IN SCHEMA assets_service TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA assets_service TO authenticated;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA assets_service TO authenticated;
    
    -- Set default privileges for future objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA assets_service GRANT ALL ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA assets_service GRANT ALL ON SEQUENCES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA assets_service GRANT ALL ON FUNCTIONS TO authenticated;
    
    COMMENT ON SCHEMA assets_service IS 'Assets Management Service - Full permissions granted to authenticated users';
  END IF;
END $$;

-- ============================================
-- GRANT TABLE PERMISSIONS - WORKORDER SERVICE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'workorder_service') THEN
    GRANT ALL ON ALL TABLES IN SCHEMA workorder_service TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA workorder_service TO authenticated;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA workorder_service TO authenticated;
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA workorder_service GRANT ALL ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA workorder_service GRANT ALL ON SEQUENCES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA workorder_service GRANT ALL ON FUNCTIONS TO authenticated;
    
    COMMENT ON SCHEMA workorder_service IS 'Work Order Service - Full permissions granted to authenticated users';
  END IF;
END $$;

-- ============================================
-- GRANT TABLE PERMISSIONS - INVENTORY SERVICE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'inventory_service') THEN
    GRANT ALL ON ALL TABLES IN SCHEMA inventory_service TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA inventory_service TO authenticated;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA inventory_service TO authenticated;
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA inventory_service GRANT ALL ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA inventory_service GRANT ALL ON SEQUENCES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA inventory_service GRANT ALL ON FUNCTIONS TO authenticated;
    
    COMMENT ON SCHEMA inventory_service IS 'Inventory Service - Full permissions granted to authenticated users';
  END IF;
END $$;

-- ============================================
-- GRANT TABLE PERMISSIONS - PEOPLE SERVICE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'people_service') THEN
    GRANT ALL ON ALL TABLES IN SCHEMA people_service TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA people_service TO authenticated;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA people_service TO authenticated;
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA people_service GRANT ALL ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA people_service GRANT ALL ON SEQUENCES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA people_service GRANT ALL ON FUNCTIONS TO authenticated;
    
    COMMENT ON SCHEMA people_service IS 'People & Labor Service - Full permissions granted to authenticated users';
  END IF;
END $$;

-- ============================================
-- GRANT TABLE PERMISSIONS - SAFETY SERVICE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'safety_service') THEN
    GRANT ALL ON ALL TABLES IN SCHEMA safety_service TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA safety_service TO authenticated;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA safety_service TO authenticated;
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA safety_service GRANT ALL ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA safety_service GRANT ALL ON SEQUENCES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA safety_service GRANT ALL ON FUNCTIONS TO authenticated;
    
    COMMENT ON SCHEMA safety_service IS 'Safety & Compliance Service - Full permissions granted to authenticated users';
  END IF;
END $$;

-- ============================================
-- GRANT TABLE PERMISSIONS - PM SERVICE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'pm_service') THEN
    GRANT ALL ON ALL TABLES IN SCHEMA pm_service TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA pm_service TO authenticated;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA pm_service TO authenticated;
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA pm_service GRANT ALL ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA pm_service GRANT ALL ON SEQUENCES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA pm_service GRANT ALL ON FUNCTIONS TO authenticated;
  END IF;
END $$;

-- ============================================
-- GRANT TABLE PERMISSIONS - METERS SERVICE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'meters_service') THEN
    GRANT ALL ON ALL TABLES IN SCHEMA meters_service TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA meters_service TO authenticated;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA meters_service TO authenticated;
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA meters_service GRANT ALL ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA meters_service GRANT ALL ON SEQUENCES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA meters_service GRANT ALL ON FUNCTIONS TO authenticated;
  END IF;
END $$;

-- ============================================
-- GRANT TABLE PERMISSIONS - NOTIFICATION SERVICE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'notification_service') THEN
    GRANT ALL ON ALL TABLES IN SCHEMA notification_service TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA notification_service TO authenticated;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA notification_service TO authenticated;
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA notification_service GRANT ALL ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA notification_service GRANT ALL ON SEQUENCES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA notification_service GRANT ALL ON FUNCTIONS TO authenticated;
  END IF;
END $$;

-- ============================================
-- GRANT TABLE PERMISSIONS - WORKFLOW SERVICE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'workflow_service') THEN
    GRANT ALL ON ALL TABLES IN SCHEMA workflow_service TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA workflow_service TO authenticated;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA workflow_service TO authenticated;
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA workflow_service GRANT ALL ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA workflow_service GRANT ALL ON SEQUENCES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA workflow_service GRANT ALL ON FUNCTIONS TO authenticated;
  END IF;
END $$;

-- ============================================
-- GRANT PERMISSIONS ON PUBLIC SCHEMA VIEWS
-- ============================================

-- Grant permissions on all public views (backward compatibility)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- VERIFICATION AND LOGGING
-- ============================================

DO $$
DECLARE
  schema_count INTEGER := 0;
  schema_names TEXT := '';
BEGIN
  -- Count and list processed schemas
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'assets_service') THEN
    schema_count := schema_count + 1;
    schema_names := schema_names || 'assets_service, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'workorder_service') THEN
    schema_count := schema_count + 1;
    schema_names := schema_names || 'workorder_service, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'inventory_service') THEN
    schema_count := schema_count + 1;
    schema_names := schema_names || 'inventory_service, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'people_service') THEN
    schema_count := schema_count + 1;
    schema_names := schema_names || 'people_service, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'safety_service') THEN
    schema_count := schema_count + 1;
    schema_names := schema_names || 'safety_service, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'pm_service') THEN
    schema_count := schema_count + 1;
    schema_names := schema_names || 'pm_service, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'meters_service') THEN
    schema_count := schema_count + 1;
    schema_names := schema_names || 'meters_service, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'notification_service') THEN
    schema_count := schema_count + 1;
    schema_names := schema_names || 'notification_service, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'workflow_service') THEN
    schema_count := schema_count + 1;
    schema_names := schema_names || 'workflow_service, ';
  END IF;
  
  -- Remove trailing comma and space
  schema_names := rtrim(schema_names, ', ');
  
  RAISE NOTICE 'Successfully granted permissions to % service schemas', schema_count;
  RAISE NOTICE 'Processed schemas: %', schema_names;
  RAISE NOTICE 'All schema permissions have been re-granted to authenticated users';
END $$;