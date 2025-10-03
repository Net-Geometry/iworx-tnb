-- Clean up duplicate incident workflow states
-- Keep only the record with valid template_id and organization_id, or the most recent one
WITH ranked_states AS (
  SELECT 
    id,
    incident_id,
    ROW_NUMBER() OVER (
      PARTITION BY incident_id 
      ORDER BY 
        CASE WHEN template_id IS NOT NULL AND organization_id IS NOT NULL THEN 0 ELSE 1 END,
        created_at DESC
    ) as rn
  FROM incident_workflow_state
)
DELETE FROM incident_workflow_state
WHERE id IN (
  SELECT id FROM ranked_states WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE incident_workflow_state
ADD CONSTRAINT incident_workflow_state_incident_id_key UNIQUE (incident_id);