-- Fix hierarchy_levels unique constraint to be per-organization
-- Drop the existing unique constraint on level_order from the actual table
ALTER TABLE assets_service.hierarchy_levels 
DROP CONSTRAINT IF EXISTS hierarchy_levels_level_order_key;

-- Add a composite unique constraint on (organization_id, level_order)
-- This allows each organization to have its own sequence of level orders
ALTER TABLE assets_service.hierarchy_levels 
ADD CONSTRAINT hierarchy_levels_org_level_order_unique 
UNIQUE (organization_id, level_order);