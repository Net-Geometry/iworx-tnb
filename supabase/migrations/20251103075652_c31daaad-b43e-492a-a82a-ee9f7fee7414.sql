-- Grant select permission on the public.assets view to service role
GRANT SELECT ON public.assets TO service_role;

-- Grant all permissions on assets_service.assets table to service role
GRANT ALL ON assets_service.assets TO service_role;