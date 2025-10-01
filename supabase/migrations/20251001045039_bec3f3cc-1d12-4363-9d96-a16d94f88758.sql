-- Add foreign key constraint between route_assets and maintenance_routes
ALTER TABLE public.route_assets 
ADD CONSTRAINT route_assets_route_id_fkey 
FOREIGN KEY (route_id) 
REFERENCES public.maintenance_routes(id) 
ON DELETE CASCADE;