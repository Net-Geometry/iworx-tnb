-- Fix search_path security issue for sync function
CREATE OR REPLACE FUNCTION sync_iot_data_to_sensor_readings()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;