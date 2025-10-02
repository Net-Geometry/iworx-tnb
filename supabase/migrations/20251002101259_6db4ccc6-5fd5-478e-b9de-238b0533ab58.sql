-- Create a secure database function to delete work orders from the workorder_service schema
-- This bypasses PostgREST schema limitations while maintaining security

CREATE OR REPLACE FUNCTION public.delete_work_order(
  _work_order_id uuid,
  _organization_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'workorder_service'
AS $$
DECLARE
  _deleted boolean := false;
BEGIN
  -- If organization_id is provided, ensure it matches for security
  IF _organization_id IS NOT NULL THEN
    DELETE FROM workorder_service.work_orders
    WHERE id = _work_order_id
      AND organization_id = _organization_id;
  ELSE
    -- Allow deletion without organization check (for admin operations with cross-project access)
    DELETE FROM workorder_service.work_orders
    WHERE id = _work_order_id;
  END IF;
  
  -- Check if deletion was successful
  GET DIAGNOSTICS _deleted = ROW_COUNT;
  RETURN _deleted > 0;
END;
$$;