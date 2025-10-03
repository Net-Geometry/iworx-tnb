-- Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Add geometry columns to meters table (public schema)
ALTER TABLE public.meters 
ADD COLUMN IF NOT EXISTS location GEOMETRY(POINT, 4326);

-- Migrate existing JSONB coordinates
UPDATE public.meters 
SET location = ST_SetSRID(
  ST_MakePoint(
    (coordinates->>'lng')::float, 
    (coordinates->>'lat')::float
  ), 
  4326
)
WHERE coordinates IS NOT NULL AND location IS NULL;

CREATE INDEX IF NOT EXISTS idx_meters_location_gist ON public.meters USING GIST(location);

-- Add location tracking to people table
ALTER TABLE people_service.people 
ADD COLUMN IF NOT EXISTS current_location GEOMETRY(POINT, 4326),
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location_accuracy_meters NUMERIC;

CREATE INDEX IF NOT EXISTS idx_people_current_location_gist 
ON people_service.people USING GIST(current_location);

-- Add geospatial data to hierarchy_nodes
ALTER TABLE assets_service.hierarchy_nodes 
ADD COLUMN IF NOT EXISTS location_point GEOMETRY(POINT, 4326),
ADD COLUMN IF NOT EXISTS location_boundary GEOMETRY(POLYGON, 4326),
ADD COLUMN IF NOT EXISTS address_components JSONB;

CREATE INDEX IF NOT EXISTS idx_hierarchy_nodes_point_gist 
ON assets_service.hierarchy_nodes USING GIST(location_point);

CREATE INDEX IF NOT EXISTS idx_hierarchy_nodes_boundary_gist 
ON assets_service.hierarchy_nodes USING GIST(location_boundary);

-- Add location tracking to assets
ALTER TABLE assets_service.assets 
ADD COLUMN IF NOT EXISTS current_location GEOMETRY(POINT, 4326),
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_mobile BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_assets_current_location_gist 
ON assets_service.assets USING GIST(current_location);

-- Create person_location_history table
CREATE TABLE IF NOT EXISTS public.person_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  location GEOMETRY(POINT, 4326) NOT NULL,
  altitude_meters NUMERIC,
  accuracy_meters NUMERIC,
  speed_kmh NUMERIC,
  bearing_degrees NUMERIC,
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tracking_source VARCHAR(50),
  device_id VARCHAR(255),
  battery_level INTEGER,
  work_order_id UUID,
  on_duty BOOLEAN DEFAULT TRUE,
  activity_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_person_location_history_person 
ON person_location_history(person_id, tracked_at DESC);

CREATE INDEX IF NOT EXISTS idx_person_location_history_org_time 
ON person_location_history(organization_id, tracked_at DESC);

CREATE INDEX IF NOT EXISTS idx_person_location_history_location_gist 
ON person_location_history USING GIST(location);

-- Create asset_location_history table
CREATE TABLE IF NOT EXISTS public.asset_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  location GEOMETRY(POINT, 4326) NOT NULL,
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tracking_source VARCHAR(50),
  operating_status VARCHAR(50),
  operator_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_location_history_asset 
ON asset_location_history(asset_id, tracked_at DESC);

CREATE INDEX IF NOT EXISTS idx_asset_location_history_location_gist 
ON asset_location_history USING GIST(location);

-- Create geofence_zones table
CREATE TABLE IF NOT EXISTS public.geofence_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  zone_type VARCHAR(50),
  description TEXT,
  boundary GEOMETRY(POLYGON, 4326) NOT NULL,
  center_point GEOMETRY(POINT, 4326),
  radius_meters NUMERIC,
  hierarchy_node_id UUID,
  entry_notification BOOLEAN DEFAULT FALSE,
  exit_notification BOOLEAN DEFAULT FALSE,
  restricted_access BOOLEAN DEFAULT FALSE,
  allowed_person_ids UUID[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geofence_zones_org 
ON geofence_zones(organization_id);

CREATE INDEX IF NOT EXISTS idx_geofence_zones_boundary_gist 
ON geofence_zones USING GIST(boundary);

-- Create geofence_events table
CREATE TABLE IF NOT EXISTS public.geofence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geofence_zone_id UUID NOT NULL,
  person_id UUID,
  asset_id UUID,
  organization_id UUID NOT NULL,
  event_type VARCHAR(20) NOT NULL,
  event_location GEOMETRY(POINT, 4326) NOT NULL,
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  entry_time TIMESTAMPTZ,
  exit_time TIMESTAMPTZ,
  duration_minutes NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geofence_events_zone 
ON geofence_events(geofence_zone_id, event_time DESC);

CREATE INDEX IF NOT EXISTS idx_geofence_events_person 
ON geofence_events(person_id, event_time DESC);