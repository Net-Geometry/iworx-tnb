-- Add index if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'workorder_service' 
    AND tablename = 'work_orders' 
    AND indexname = 'idx_work_orders_location'
  ) THEN
    CREATE INDEX idx_work_orders_location ON workorder_service.work_orders(location_node_id);
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN workorder_service.work_orders.location_node_id IS 'Reference to the location (Level 4) hierarchy node for this work order. Used for location-based notifications and filtering.';

-- Add validation trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'validate_work_order_location_level'
    AND tgrelid = 'workorder_service.work_orders'::regclass
  ) THEN
    CREATE TRIGGER validate_work_order_location_level
      BEFORE INSERT OR UPDATE ON workorder_service.work_orders
      FOR EACH ROW 
      WHEN (NEW.location_node_id IS NOT NULL)
      EXECUTE FUNCTION public.validate_location_level();
  END IF;
END $$;