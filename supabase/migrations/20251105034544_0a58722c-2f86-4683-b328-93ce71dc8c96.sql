-- Grant SELECT permissions on assets table and view
-- RLS policies will still enforce row-level access control

-- Grant SELECT on the assets_service.assets table (RLS still enforced)
GRANT SELECT ON assets_service.assets TO authenticated, anon;

-- Grant SELECT on the public.assets view
GRANT SELECT ON public.assets TO authenticated, anon;

-- Grant EXECUTE permission on has_role function (if it exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'has_role' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated, anon;
  END IF;
END $$;