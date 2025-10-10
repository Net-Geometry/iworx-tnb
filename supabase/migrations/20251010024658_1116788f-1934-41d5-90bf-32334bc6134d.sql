-- Create IoT Device Display Preferences Table
CREATE TABLE IF NOT EXISTS public.iot_device_display_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.iot_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Configuration
  selected_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  lorawan_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  refresh_interval_seconds INTEGER NOT NULL DEFAULT 30,
  max_readings_shown INTEGER NOT NULL DEFAULT 50,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_device_user UNIQUE(device_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_iot_display_prefs_device ON public.iot_device_display_preferences(device_id);
CREATE INDEX idx_iot_display_prefs_user ON public.iot_device_display_preferences(user_id);
CREATE INDEX idx_iot_display_prefs_org ON public.iot_device_display_preferences(organization_id);

-- RLS Policies
ALTER TABLE public.iot_device_display_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own display preferences"
  ON public.iot_device_display_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own display preferences"
  ON public.iot_device_display_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own display preferences"
  ON public.iot_device_display_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own display preferences"
  ON public.iot_device_display_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp trigger (reuse existing function)
CREATE TRIGGER update_iot_display_prefs_timestamp
  BEFORE UPDATE ON public.iot_device_display_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comments
COMMENT ON TABLE public.iot_device_display_preferences IS 'User preferences for IoT device data display customization';
COMMENT ON COLUMN public.iot_device_display_preferences.selected_metrics IS 'Array of metric names to display, e.g. ["Pitch", "Roll"]';
COMMENT ON COLUMN public.iot_device_display_preferences.lorawan_fields IS 'Array of lorawan_metadata keys to show, e.g. ["rssi", "snr"]';