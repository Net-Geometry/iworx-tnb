-- ============================================================================
-- Trigger Function to sync iot_data to asset_sensor_readings
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_iot_data_to_sensor_readings()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_id UUID;
  v_device_name TEXT;
  v_threshold_exceeded BOOLEAN := FALSE;
BEGIN
  -- Get the asset_id from the IoT device
  SELECT asset_id, device_name 
  INTO v_asset_id, v_device_name
  FROM iot_devices
  WHERE id = NEW.device_id;

  -- Skip if device is not assigned to an asset
  IF v_asset_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine if threshold is exceeded
  -- Temperature > 80°C, Battery < 3.0V, Roll/Pitch > 45°
  v_threshold_exceeded := CASE
    WHEN NEW.metric_name = 'TempC_DS18B20' AND NEW.value > 80 THEN TRUE
    WHEN NEW.metric_name = 'Bat' AND NEW.value < 3.0 THEN TRUE
    WHEN NEW.metric_name IN ('Roll', 'Pitch') AND ABS(NEW.value) > 45 THEN TRUE
    ELSE FALSE
  END;

  -- Insert into asset_sensor_readings
  INSERT INTO asset_sensor_readings (
    asset_id,
    sensor_type,
    reading_value,
    unit,
    timestamp,
    organization_id,
    alert_threshold_exceeded,
    metadata
  ) VALUES (
    v_asset_id,
    NEW.metric_name,
    NEW.value,
    COALESCE(NEW.unit, ''),
    NEW.timestamp,
    NEW.organization_id,
    v_threshold_exceeded,
    jsonb_build_object(
      'device_id', NEW.device_id,
      'device_name', v_device_name,
      'lorawan_metadata', NEW.lorawan_metadata
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_sync_iot_data ON iot_data;
CREATE TRIGGER trigger_sync_iot_data
  AFTER INSERT ON iot_data
  FOR EACH ROW
  EXECUTE FUNCTION sync_iot_data_to_sensor_readings();

-- ============================================================================
-- Backfill existing data (one-time operation)
-- ============================================================================

INSERT INTO asset_sensor_readings (
  asset_id,
  sensor_type,
  reading_value,
  unit,
  timestamp,
  organization_id,
  alert_threshold_exceeded,
  metadata
)
SELECT 
  d.asset_id,
  iot.metric_name,
  iot.value,
  COALESCE(iot.unit, ''),
  iot.timestamp,
  iot.organization_id,
  CASE
    WHEN iot.metric_name = 'TempC_DS18B20' AND iot.value > 80 THEN TRUE
    WHEN iot.metric_name = 'Bat' AND iot.value < 3.0 THEN TRUE
    WHEN iot.metric_name IN ('Roll', 'Pitch') AND ABS(iot.value) > 45 THEN TRUE
    ELSE FALSE
  END,
  jsonb_build_object(
    'device_id', iot.device_id,
    'device_name', d.device_name,
    'lorawan_metadata', iot.lorawan_metadata
  )
FROM iot_data iot
JOIN iot_devices d ON iot.device_id = d.id
WHERE d.asset_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON FUNCTION sync_iot_data_to_sensor_readings() IS 'Automatically syncs iot_data to asset_sensor_readings for Digital Twin visualization';