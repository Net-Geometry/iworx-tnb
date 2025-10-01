-- Add route_id to pm_schedules table for route-based scheduling
ALTER TABLE pm_schedules 
ADD COLUMN route_id uuid REFERENCES maintenance_routes(id) ON DELETE SET NULL;

-- Add index for performance on route-based queries
CREATE INDEX idx_pm_schedules_route_id ON pm_schedules(route_id);

-- Add comment explaining the route_id field
COMMENT ON COLUMN pm_schedules.route_id IS 'Optional reference to maintenance route. When set, work orders will be generated for all assets in the route instead of a single asset.';