-- Fix Step 2: Update 'under_review' to 'investigating'
UPDATE workflow_template_steps 
SET incident_status = 'investigating',
    updated_at = now()
WHERE id = '48afa65c-7b97-45b8-894e-30ffd4df7c3d';

-- Add missing Step 3: Investigation
INSERT INTO workflow_template_steps (
  template_id,
  name,
  step_order,
  step_type,
  description,
  approval_type,
  sla_hours,
  incident_status,
  is_required,
  organization_id
)
SELECT 
  template_id,
  'Investigation',
  3,
  'approval',
  'Conduct detailed investigation of the incident',
  'single',
  72,
  'investigating',
  true,
  organization_id
FROM workflow_template_steps
WHERE id = '48afa65c-7b97-45b8-894e-30ffd4df7c3d'
LIMIT 1;

-- Add missing Step 4: Root Cause Analysis
INSERT INTO workflow_template_steps (
  template_id,
  name,
  step_order,
  step_type,
  description,
  approval_type,
  sla_hours,
  incident_status,
  is_required,
  organization_id
)
SELECT 
  template_id,
  'Root Cause Analysis',
  4,
  'approval',
  'Identify root causes and contributing factors',
  'single',
  48,
  'investigating',
  true,
  organization_id
FROM workflow_template_steps
WHERE id = '48afa65c-7b97-45b8-894e-30ffd4df7c3d'
LIMIT 1;

-- Update existing Step 3 (Manager Approval) to Step 5
UPDATE workflow_template_steps 
SET step_order = 5,
    updated_at = now()
WHERE template_id = (SELECT template_id FROM workflow_template_steps WHERE id = '48afa65c-7b97-45b8-894e-30ffd4df7c3d')
  AND step_order = 3
  AND name = 'Manager Approval';

-- Add missing Step 6: Closure
INSERT INTO workflow_template_steps (
  template_id,
  name,
  step_order,
  step_type,
  description,
  approval_type,
  sla_hours,
  incident_status,
  is_required,
  organization_id
)
SELECT 
  template_id,
  'Closure',
  6,
  'approval',
  'Final review and incident closure',
  'single',
  24,
  'closed',
  true,
  organization_id
FROM workflow_template_steps
WHERE id = '48afa65c-7b97-45b8-894e-30ffd4df7c3d'
LIMIT 1;