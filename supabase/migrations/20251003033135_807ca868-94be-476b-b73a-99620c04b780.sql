-- Enable RLS on new GPS tracking tables
ALTER TABLE person_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofence_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofence_events ENABLE ROW LEVEL SECURITY;

-- Minimal RLS policy for person_location_history
CREATE POLICY "Superadmins can view all person locations"
ON person_location_history FOR SELECT
USING (has_role(auth.uid(), 'tnb_management'));

CREATE POLICY "System can insert person location data"
ON person_location_history FOR INSERT
WITH CHECK (true);

-- Minimal RLS policy for asset_location_history
CREATE POLICY "Superadmins can view all asset locations"
ON asset_location_history FOR SELECT
USING (has_role(auth.uid(), 'tnb_management'));

CREATE POLICY "System can insert asset location data"
ON asset_location_history FOR INSERT
WITH CHECK (true);

-- Minimal RLS policy for geofence_zones
CREATE POLICY "Superadmins can manage geofences"
ON geofence_zones FOR ALL
USING (has_role(auth.uid(), 'tnb_management'));

-- Minimal RLS policy for geofence_events
CREATE POLICY "Superadmins can view geofence events"
ON geofence_events FOR SELECT
USING (has_role(auth.uid(), 'tnb_management'));

CREATE POLICY "System can insert geofence events"
ON geofence_events FOR INSERT
WITH CHECK (true);