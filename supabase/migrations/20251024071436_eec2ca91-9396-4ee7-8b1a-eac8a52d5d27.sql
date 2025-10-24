-- Add planned_quantities column to pm_service.schedules table
ALTER TABLE pm_service.schedules 
ADD COLUMN IF NOT EXISTS planned_quantities JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN pm_service.schedules.planned_quantities IS 
'Array of planned BOM item quantities: [{"bomItemId": "uuid", "quantity": 5}]';