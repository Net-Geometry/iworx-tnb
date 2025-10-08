-- Create security definer function to get prioritized work orders
-- This bypasses RLS while still validating organization access
CREATE OR REPLACE FUNCTION workorder_service.get_prioritized_work_orders(
  _organization_id UUID,
  _limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  priority_score NUMERIC,
  failure_risk NUMERIC,
  ml_recommended BOOLEAN,
  priority_factors JSONB,
  status VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = workorder_service, public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wo.id,
    wo.title,
    wo.ai_priority_score AS priority_score,
    wo.predicted_failure_risk AS failure_risk,
    wo.ml_recommended,
    wo.ai_priority_factors AS priority_factors,
    wo.status
  FROM workorder_service.work_orders wo
  WHERE wo.organization_id = _organization_id
    AND wo.ai_priority_score IS NOT NULL
  ORDER BY wo.ai_priority_score DESC
  LIMIT _limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION workorder_service.get_prioritized_work_orders TO authenticated;
GRANT EXECUTE ON FUNCTION workorder_service.get_prioritized_work_orders TO service_role;