-- Add foreign key relationship between iot_devices and the assets base table
-- The assets table is in the assets_service schema, not public
ALTER TABLE public.iot_devices
ADD CONSTRAINT iot_devices_asset_id_fkey
FOREIGN KEY (asset_id)
REFERENCES assets_service.assets(id)
ON DELETE SET NULL;

-- Add index for better query performance when querying devices by asset
CREATE INDEX IF NOT EXISTS idx_iot_devices_asset_id ON public.iot_devices(asset_id);