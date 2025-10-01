-- Add foreign key constraint between route_assets and assets
ALTER TABLE public.route_assets 
ADD CONSTRAINT route_assets_asset_id_fkey 
FOREIGN KEY (asset_id) 
REFERENCES public.assets(id) 
ON DELETE CASCADE;