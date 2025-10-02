-- Fix security warning: Set search_path for validate_location_level function

CREATE OR REPLACE FUNCTION validate_location_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hierarchy_node_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM assets_service.hierarchy_nodes hn
      JOIN assets_service.hierarchy_levels hl ON hn.hierarchy_level_id = hl.id
      WHERE hn.id = NEW.hierarchy_node_id AND hl.level_order = 4
    ) THEN
      RAISE EXCEPTION 'hierarchy_node_id must reference a Location (Level 4) node';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, assets_service;