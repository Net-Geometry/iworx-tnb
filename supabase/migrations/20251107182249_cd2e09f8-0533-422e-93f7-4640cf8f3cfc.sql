-- Grant service_role full access to workorder_service schema
GRANT ALL ON ALL TABLES IN SCHEMA workorder_service TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA workorder_service TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workorder_service GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workorder_service GRANT ALL ON SEQUENCES TO service_role;

-- Grant service_role full access to assets_service schema
GRANT ALL ON ALL TABLES IN SCHEMA assets_service TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA assets_service TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA assets_service GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA assets_service GRANT ALL ON SEQUENCES TO service_role;

-- Grant authenticated role appropriate access to workorder_service
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA workorder_service TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA workorder_service TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA workorder_service GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA workorder_service GRANT USAGE ON SEQUENCES TO authenticated;

-- Grant authenticated role appropriate access to assets_service
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA assets_service TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA assets_service TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA assets_service GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA assets_service GRANT USAGE ON SEQUENCES TO authenticated;