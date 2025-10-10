-- Create asset_display_preferences table for storing user and global display preferences
CREATE TABLE IF NOT EXISTS public.asset_display_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL,
  selected_sensor_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_global_default boolean NOT NULL DEFAULT false,
  refresh_interval_seconds integer NOT NULL DEFAULT 30,
  max_readings_shown integer NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_asset_user_preference UNIQUE(asset_id, user_id),
  CONSTRAINT valid_refresh_interval CHECK (refresh_interval_seconds >= 5 AND refresh_interval_seconds <= 300),
  CONSTRAINT valid_max_readings CHECK (max_readings_shown >= 10 AND max_readings_shown <= 1000)
);

-- Enable RLS
ALTER TABLE public.asset_display_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences and global defaults
CREATE POLICY "Users can view display preferences"
  ON public.asset_display_preferences
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND is_global_default = true)
  );

-- Users can create their own preferences
CREATE POLICY "Users can create own display preferences"
  ON public.asset_display_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own display preferences"
  ON public.asset_display_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own display preferences"
  ON public.asset_display_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage global preferences
CREATE POLICY "Admins can insert global preferences"
  ON public.asset_display_preferences
  FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id AND user_id IS NOT NULL) OR
    (user_id IS NULL AND is_global_default = true AND has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admins can update global preferences"
  ON public.asset_display_preferences
  FOR UPDATE
  USING (
    (auth.uid() = user_id AND user_id IS NOT NULL) OR
    (user_id IS NULL AND is_global_default = true AND has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admins can delete global preferences"
  ON public.asset_display_preferences
  FOR DELETE
  USING (
    (auth.uid() = user_id AND user_id IS NOT NULL) OR
    (user_id IS NULL AND is_global_default = true AND has_role(auth.uid(), 'admin'))
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_asset_display_prefs_asset_user 
  ON public.asset_display_preferences(asset_id, user_id);

CREATE INDEX IF NOT EXISTS idx_asset_display_prefs_global 
  ON public.asset_display_preferences(asset_id, is_global_default) 
  WHERE is_global_default = true;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_asset_display_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_asset_display_preferences_updated_at
  BEFORE UPDATE ON public.asset_display_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_asset_display_preferences_updated_at();