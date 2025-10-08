-- Refresh the public.assets view to include new 3D model columns
DROP VIEW IF EXISTS public.assets CASCADE;

CREATE VIEW public.assets WITH (security_invoker = true) AS 
SELECT * FROM assets_service.assets;