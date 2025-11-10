-- Grant permissions to service_role for safety_service schema
-- This allows the edge function to access safety tables using service_role

-- Grant schema usage to service_role
GRANT USAGE ON SCHEMA safety_service TO service_role;

-- Grant all permissions on all existing tables
GRANT ALL ON ALL TABLES IN SCHEMA safety_service TO service_role;

-- Grant all permissions on all sequences (for auto-increment)
GRANT ALL ON ALL SEQUENCES IN SCHEMA safety_service TO service_role;

-- Grant all permissions on future tables (auto-grant for new tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA safety_service 
GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA safety_service 
GRANT ALL ON SEQUENCES TO service_role;