-- Add sensor position to IoT devices
ALTER TABLE iot_devices 
ADD COLUMN sensor_position_3d jsonb DEFAULT NULL;

COMMENT ON COLUMN iot_devices.sensor_position_3d IS 
'3D position of sensor relative to asset model: {x, y, z, label, visible}';

-- Link readings to devices
ALTER TABLE asset_sensor_readings
ADD COLUMN device_id uuid REFERENCES iot_devices(id) ON DELETE SET NULL;

CREATE INDEX idx_asset_sensor_readings_device_id 
ON asset_sensor_readings(device_id);

-- Add sensor layout to the actual assets table in assets_service schema
ALTER TABLE assets_service.assets
ADD COLUMN sensor_layout_config jsonb DEFAULT NULL;

COMMENT ON COLUMN assets_service.assets.sensor_layout_config IS 
'Manual sensor layout configuration for assets without IoT devices';