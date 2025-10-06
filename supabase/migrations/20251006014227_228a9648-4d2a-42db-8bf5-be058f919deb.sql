-- Phase 2.1: Workflow Service Database Migration
-- Create workflow service schema for logs & metadata

-- Create schema for workflow service
CREATE SCHEMA IF NOT EXISTS workflow_service;

-- Workflow execution logs (for audit & debugging)
CREATE TABLE workflow_service.execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_state_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'work_order' or 'incident'
  entity_id UUID NOT NULL,
  step_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'transition', 'approve', 'reject', 'reassign'
  performed_by UUID REFERENCES auth.users(id),
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB,
  organization_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for execution logs
CREATE INDEX idx_execution_logs_entity ON workflow_service.execution_logs(entity_type, entity_id);
CREATE INDEX idx_execution_logs_org ON workflow_service.execution_logs(organization_id);
CREATE INDEX idx_execution_logs_created ON workflow_service.execution_logs(created_at DESC);
CREATE INDEX idx_execution_logs_workflow_state ON workflow_service.execution_logs(workflow_state_id);

-- Enable RLS on execution logs
ALTER TABLE workflow_service.execution_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for execution logs
CREATE POLICY "Users can view logs for their organization"
ON workflow_service.execution_logs
FOR SELECT
TO authenticated
USING (
  has_cross_project_access(auth.uid()) OR 
  organization_id IN (SELECT unnest(get_user_organizations(auth.uid())))
);

CREATE POLICY "System can insert execution logs"
ON workflow_service.execution_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Performance indexes for existing workflow tables

-- Optimize workflow state queries
CREATE INDEX IF NOT EXISTS idx_wo_workflow_state_template 
  ON work_order_workflow_state(template_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_incident_workflow_state_template 
  ON incident_workflow_state(template_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_wo_workflow_state_current_step
  ON work_order_workflow_state(current_step_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_incident_workflow_state_current_step
  ON incident_workflow_state(current_step_id, organization_id);

-- Optimize approval queries
CREATE INDEX IF NOT EXISTS idx_wo_approvals_user 
  ON work_order_approvals(approved_by_user_id, approved_at DESC);

CREATE INDEX IF NOT EXISTS idx_incident_approvals_user 
  ON incident_approvals(approved_by_user_id, approved_at DESC);

CREATE INDEX IF NOT EXISTS idx_wo_approvals_wo
  ON work_order_approvals(work_order_id);

CREATE INDEX IF NOT EXISTS idx_incident_approvals_incident
  ON incident_approvals(incident_id);

-- Optimize template step lookups
CREATE INDEX IF NOT EXISTS idx_template_steps_order 
  ON workflow_template_steps(template_id, step_order);

CREATE INDEX IF NOT EXISTS idx_template_steps_template
  ON workflow_template_steps(template_id);

-- Optimize step role assignment lookups
CREATE INDEX IF NOT EXISTS idx_step_role_assignments_step
  ON workflow_step_role_assignments(step_id);

CREATE INDEX IF NOT EXISTS idx_step_role_assignments_role
  ON workflow_step_role_assignments(role_name);