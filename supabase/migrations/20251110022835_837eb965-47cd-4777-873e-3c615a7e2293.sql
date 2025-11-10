-- Grant permissions to service_role for inventory_service schema
-- This allows the edge function to access inventory tables using service_role

-- Grant schema usage to service_role
GRANT USAGE ON SCHEMA inventory_service TO service_role;

-- Grant all permissions on all existing tables
GRANT ALL ON ALL TABLES IN SCHEMA inventory_service TO service_role;

-- Grant all permissions on all sequences (for auto-increment)
GRANT ALL ON ALL SEQUENCES IN SCHEMA inventory_service TO service_role;

-- Grant all permissions on future tables (auto-grant for new tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA inventory_service 
GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA inventory_service 
GRANT ALL ON SEQUENCES TO service_role;