-- Enable global display preferences for IoT devices

-- 1. Make user_id nullable to allow global preferences
ALTER TABLE public.iot_device_display_preferences 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add global default flag
ALTER TABLE public.iot_device_display_preferences 
ADD COLUMN IF NOT EXISTS is_global_default BOOLEAN DEFAULT FALSE NOT NULL;

-- 3. Ensure only one global default per device
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_global_device_preference 
ON public.iot_device_display_preferences(device_id) 
WHERE user_id IS NULL AND is_global_default = TRUE;

-- 4. Add default display config to device types
ALTER TABLE public.iot_device_types 
ADD COLUMN IF NOT EXISTS default_display_config JSONB DEFAULT jsonb_build_object(
  'preferred_metrics', '[]'::jsonb,
  'preferred_lorawan_fields', '["rssi", "snr"]'::jsonb
);

-- 5. Update RLS policy to allow viewing global preferences
DROP POLICY IF EXISTS "Users can view own display preferences" ON public.iot_device_display_preferences;

CREATE POLICY "Users can view display preferences"
ON public.iot_device_display_preferences FOR SELECT
USING (
  auth.uid() = user_id OR 
  (user_id IS NULL AND is_global_default = TRUE)
);

-- 6. Add policy for admins to manage global preferences
CREATE POLICY "Admins can insert global preferences"
ON public.iot_device_display_preferences FOR INSERT
WITH CHECK (
  (auth.uid() = user_id AND user_id IS NOT NULL) OR
  (user_id IS NULL AND is_global_default = TRUE AND has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Admins can update global preferences"
ON public.iot_device_display_preferences FOR UPDATE
USING (
  (auth.uid() = user_id AND user_id IS NOT NULL) OR
  (user_id IS NULL AND is_global_default = TRUE AND has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Admins can delete global preferences"
ON public.iot_device_display_preferences FOR DELETE
USING (
  (auth.uid() = user_id AND user_id IS NOT NULL) OR
  (user_id IS NULL AND is_global_default = TRUE AND has_role(auth.uid(), 'admin'))
);

-- 7. Comment for documentation
COMMENT ON COLUMN public.iot_device_display_preferences.is_global_default IS 
'When true and user_id is NULL, this preference applies as default for all users of this device';

COMMENT ON COLUMN public.iot_device_types.default_display_config IS 
'Default display configuration for all devices of this type. Format: {"preferred_metrics": [...], "preferred_lorawan_fields": [...]}';