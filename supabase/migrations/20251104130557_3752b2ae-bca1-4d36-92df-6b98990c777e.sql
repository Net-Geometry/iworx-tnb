-- Grant permissions on the view to authenticated users
GRANT SELECT ON public.assets TO authenticated;

-- Grant service role full access to the actual assets table
GRANT ALL ON assets_service.assets TO service_role;

-- Grant service role access to hierarchy_nodes (this is the missing permission causing errors)
GRANT ALL ON public.hierarchy_nodes TO service_role;