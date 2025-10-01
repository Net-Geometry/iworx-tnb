-- Remove scheduling-related columns from maintenance_routes
-- Routes should only define "what assets" and "in what order"
-- Scheduling is handled by PM Schedules

ALTER TABLE public.maintenance_routes 
DROP COLUMN IF EXISTS frequency_type,
DROP COLUMN IF EXISTS frequency_interval,
DROP COLUMN IF EXISTS estimated_duration_hours;