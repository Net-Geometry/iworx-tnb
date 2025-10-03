-- Add incident_status column to workflow_template_steps table
ALTER TABLE workflow_template_steps 
ADD COLUMN IF NOT EXISTS incident_status VARCHAR(50);

-- Create default Safety Incident Standard Flow workflow template
DO $$
DECLARE
  v_template_id UUID;
  v_step1_id UUID;
  v_step2_id UUID;
  v_step3_id UUID;
  v_step4_id UUID;
  v_step5_id UUID;
  v_org_id UUID;
BEGIN
  -- Get the first organization ID
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  
  -- Insert workflow template
  INSERT INTO workflow_templates (
    name,
    description,
    module,
    organization_id,
    is_default,
    is_active
  ) VALUES (
    'Safety Incident Standard Flow',
    'Standard workflow for managing safety incidents from report to resolution with mandatory 5-step approval process',
    'safety_incidents',
    v_org_id,
    true,
    true
  ) RETURNING id INTO v_template_id;

  -- Step 1: Initial Report
  INSERT INTO workflow_template_steps (
    template_id,
    name,
    step_order,
    step_type,
    description,
    approval_type,
    is_required,
    incident_status,
    organization_id
  ) VALUES (
    v_template_id,
    'Initial Report',
    1,
    'start',
    'Incident reported by technician',
    'none',
    true,
    'reported',
    v_org_id
  ) RETURNING id INTO v_step1_id;

  -- Step 2: Planner Review
  INSERT INTO workflow_template_steps (
    template_id,
    name,
    step_order,
    step_type,
    description,
    approval_type,
    sla_hours,
    is_required,
    incident_status,
    organization_id
  ) VALUES (
    v_template_id,
    'Planner Review',
    2,
    'approval',
    'Maintenance planner reviews incident and assigns investigator',
    'single',
    24,
    true,
    'under_review',
    v_org_id
  ) RETURNING id INTO v_step2_id;

  -- Step 3: Investigation
  INSERT INTO workflow_template_steps (
    template_id,
    name,
    step_order,
    step_type,
    description,
    approval_type,
    sla_hours,
    is_required,
    incident_status,
    organization_id
  ) VALUES (
    v_template_id,
    'Investigation',
    3,
    'task',
    'Investigator conducts root cause analysis',
    'single',
    72,
    true,
    'investigating',
    v_org_id
  ) RETURNING id INTO v_step3_id;

  -- Step 4: Corrective Actions
  INSERT INTO workflow_template_steps (
    template_id,
    name,
    step_order,
    step_type,
    description,
    approval_type,
    sla_hours,
    is_required,
    incident_status,
    organization_id
  ) VALUES (
    v_template_id,
    'Corrective Actions',
    4,
    'task',
    'Implement and document corrective actions',
    'single',
    168,
    true,
    'investigating',
    v_org_id
  ) RETURNING id INTO v_step4_id;

  -- Step 5: Manager Approval
  INSERT INTO workflow_template_steps (
    template_id,
    name,
    step_order,
    step_type,
    description,
    approval_type,
    is_required,
    incident_status,
    organization_id
  ) VALUES (
    v_template_id,
    'Manager Approval',
    5,
    'approval',
    'Final manager approval to close incident',
    'single',
    true,
    'resolved',
    v_org_id
  ) RETURNING id INTO v_step5_id;

  -- Create role assignments for Step 1 (Initial Report)
  INSERT INTO workflow_step_role_assignments (
    step_id,
    role_name,
    is_primary_assignee,
    can_approve,
    can_reject,
    can_assign,
    can_view,
    can_edit,
    organization_id
  ) VALUES (
    v_step1_id,
    'technician',
    true,
    false,
    false,
    false,
    true,
    true,
    v_org_id
  );

  -- Create role assignments for Step 2 (Planner Review)
  INSERT INTO workflow_step_role_assignments (
    step_id,
    role_name,
    is_primary_assignee,
    can_approve,
    can_reject,
    can_assign,
    can_view,
    can_edit,
    organization_id
  ) VALUES 
  (
    v_step2_id,
    'Planner',
    true,
    true,
    true,
    true,
    true,
    true,
    v_org_id
  ),
  (
    v_step2_id,
    'manager',
    false,
    true,
    true,
    true,
    true,
    false,
    v_org_id
  );

  -- Create role assignments for Step 3 (Investigation)
  INSERT INTO workflow_step_role_assignments (
    step_id,
    role_name,
    is_primary_assignee,
    can_approve,
    can_reject,
    can_assign,
    can_view,
    can_edit,
    organization_id
  ) VALUES 
  (
    v_step3_id,
    'Engineer',
    true,
    true,
    false,
    false,
    true,
    true,
    v_org_id
  ),
  (
    v_step3_id,
    'technician',
    false,
    true,
    false,
    false,
    true,
    true,
    v_org_id
  );

  -- Create role assignments for Step 4 (Corrective Actions)
  INSERT INTO workflow_step_role_assignments (
    step_id,
    role_name,
    is_primary_assignee,
    can_approve,
    can_reject,
    can_assign,
    can_view,
    can_edit,
    organization_id
  ) VALUES 
  (
    v_step4_id,
    'technician',
    true,
    true,
    false,
    false,
    true,
    true,
    v_org_id
  ),
  (
    v_step4_id,
    'Engineer',
    false,
    true,
    false,
    false,
    true,
    true,
    v_org_id
  );

  -- Create role assignments for Step 5 (Manager Approval)
  INSERT INTO workflow_step_role_assignments (
    step_id,
    role_name,
    is_primary_assignee,
    can_approve,
    can_reject,
    can_assign,
    can_view,
    can_edit,
    organization_id
  ) VALUES 
  (
    v_step5_id,
    'manager',
    true,
    true,
    true,
    false,
    true,
    false,
    v_org_id
  ),
  (
    v_step5_id,
    'admin',
    false,
    true,
    true,
    false,
    true,
    false,
    v_org_id
  );

END $$;