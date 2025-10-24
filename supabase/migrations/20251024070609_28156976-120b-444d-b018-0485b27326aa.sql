-- Fix orphaned PM schedule references before updating foreign key
-- Set pm_schedule_id to NULL for work orders referencing non-existent schedules
UPDATE workorder_service.work_orders
SET pm_schedule_id = NULL
WHERE pm_schedule_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM pm_service.schedules 
    WHERE schedules.id = work_orders.pm_schedule_id
  );

-- Drop the existing foreign key that points to wrong table
ALTER TABLE workorder_service.work_orders 
DROP CONSTRAINT IF EXISTS work_orders_pm_schedule_id_fkey;

-- Create new foreign key pointing to the correct table in pm_service schema
ALTER TABLE workorder_service.work_orders 
ADD CONSTRAINT work_orders_pm_schedule_id_fkey 
FOREIGN KEY (pm_schedule_id) 
REFERENCES pm_service.schedules(id) 
ON DELETE SET NULL;