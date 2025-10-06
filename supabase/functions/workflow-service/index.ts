/**
 * Workflow Service - Microservice for Workflow Management
 * 
 * Handles workflow templates, template steps, workflow state, and approvals
 * for both Work Orders and Safety Incidents.
 * 
 * Endpoints:
 * - Template Management: GET /templates, POST /templates, etc.
 * - Template Steps: GET /templates/:id/steps, POST /templates/:id/steps, etc.
 * - Workflow State: POST /initialize, POST /transition, POST /approve, etc.
 * - Analytics: GET /analytics/:orgId, GET /status/:module
 * - Bulk Operations: POST /bulk-initialize
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';
import { getOrCreateCorrelationId, logWithCorrelation } from '../_shared/correlation.ts';
import { createEventBus, DomainEvents } from '../_shared/event-bus.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const eventBus = createEventBus('workflow-service');

// Types
interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  module: 'work_orders' | 'safety_incidents';
  is_default: boolean;
  is_active: boolean;
  organization_id: string;
  version?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface WorkflowTemplateStep {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  step_order: number;
  sla_hours?: number;
  work_order_status?: string;
  incident_status?: string;
  can_approve: boolean;
  can_reject: boolean;
  can_transition: boolean;
  can_assign: boolean;
  auto_assign_logic?: any;
  is_active: boolean;
  organization_id: string;
}

interface WorkflowState {
  id: string;
  template_id: string;
  current_step_id: string;
  assigned_to_user_id?: string;
  pending_approval_from_role?: string;
  step_started_at: string;
  sla_due_at?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

interface RequestContext {
  userId?: string;
  organizationId?: string;
  hasCrossProjectAccess: boolean;
  correlationId: string;
}

// Helper: Extract request context from headers
function extractRequestContext(req: Request): RequestContext {
  const userId = req.headers.get('x-user-id') || undefined;
  const organizationId = req.headers.get('x-organization-id') || undefined;
  const hasCrossProjectAccess = req.headers.get('x-cross-project-access') === 'true';
  const correlationId = getOrCreateCorrelationId(req);

  return { userId, organizationId, hasCrossProjectAccess, correlationId };
}

// Helper: Log execution to workflow_service.execution_logs
async function logExecution(params: {
  workflow_state_id?: string;
  entity_type: string;
  entity_id: string;
  step_id?: string;
  action_type: string;
  performed_by?: string;
  execution_time_ms: number;
  success: boolean;
  error_message?: string;
  metadata?: any;
  organization_id: string;
}) {
  try {
    await supabase.from('workflow_service.execution_logs').insert({
      workflow_state_id: params.workflow_state_id,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      step_id: params.step_id,
      action_type: params.action_type,
      performed_by: params.performed_by,
      execution_time_ms: params.execution_time_ms,
      success: params.success,
      error_message: params.error_message,
      metadata: params.metadata,
      organization_id: params.organization_id,
    });
  } catch (error) {
    console.error('Failed to log execution:', error);
    // Don't throw - logging failure shouldn't block the operation
  }
}

// Helper: Validate user permission for step action
async function validateUserPermission(
  userId: string,
  stepId: string,
  action: 'approve' | 'reject' | 'transition' | 'assign'
): Promise<boolean> {
  // Get user's roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id, roles!inner(name)')
    .eq('user_id', userId);

  if (!userRoles || userRoles.length === 0) {
    throw new Error('User has no roles assigned');
  }

  const roleNames = userRoles.map((ur: any) => ur.roles.name.toLowerCase());

  // Get step role assignments
  const { data: stepRoles } = await supabase
    .from('workflow_step_role_assignments')
    .select('*')
    .eq('step_id', stepId);

  if (!stepRoles || stepRoles.length === 0) {
    throw new Error('No roles configured for this workflow step');
  }

  // Check if user has required permission
  const permissionField = `can_${action}`;
  const hasPermission = stepRoles.some((sr: any) =>
    roleNames.includes(sr.role_name.toLowerCase()) && sr[permissionField]
  );

  if (!hasPermission) {
    throw new Error(`User does not have permission to ${action} at this step`);
  }

  return true;
}

// Helper: Evaluate step conditions
async function evaluateStepConditions(
  stepId: string,
  entityType: string,
  entityId: string
): Promise<boolean> {
  const { data: conditions } = await supabase
    .from('workflow_step_conditions')
    .select('*')
    .eq('step_id', stepId)
    .eq('is_active', true);

  if (!conditions || conditions.length === 0) {
    return true; // No conditions = always pass
  }

  // Fetch entity data
  const tableName = entityType === 'work_order' 
    ? 'workorder_service.work_orders' 
    : 'safety_service.safety_incidents';
  
  const { data: entity } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', entityId)
    .single();

  if (!entity) {
    throw new Error('Entity not found');
  }

  // Evaluate all conditions
  for (const condition of conditions) {
    const fieldValue = entity[condition.field_name];
    const expectedValue = condition.expected_value;

    let conditionMet = false;
    switch (condition.operator) {
      case 'equals':
        conditionMet = fieldValue === expectedValue;
        break;
      case 'not_equals':
        conditionMet = fieldValue !== expectedValue;
        break;
      case 'greater_than':
        conditionMet = fieldValue > expectedValue;
        break;
      case 'less_than':
        conditionMet = fieldValue < expectedValue;
        break;
      case 'contains':
        conditionMet = String(fieldValue).includes(String(expectedValue));
        break;
      default:
        conditionMet = true;
    }

    if (!conditionMet) {
      return false;
    }
  }

  return true;
}

// Core Function: Initialize Workflow
async function initializeWorkflow(
  entityType: 'work_order' | 'incident',
  entityId: string,
  organizationId: string,
  context: RequestContext
): Promise<WorkflowState> {
  const startTime = Date.now();
  const module = entityType === 'work_order' ? 'work_orders' : 'safety_incidents';

  try {
    logWithCorrelation(context.correlationId, 'workflow-service', 'info', 
      `Initializing workflow for ${entityType} ${entityId}`);

    // 1. Get default template for module
    const { data: template, error: templateError } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('module', module)
      .eq('is_default', true)
      .eq('is_active', true)
      .eq('organization_id', organizationId)
      .single();

    if (templateError || !template) {
      throw new Error(`No default workflow template found for ${module}`);
    }

    // 2. Get first step (step_order = 1)
    const { data: firstStep, error: stepError } = await supabase
      .from('workflow_template_steps')
      .select('*')
      .eq('template_id', template.id)
      .eq('is_active', true)
      .order('step_order')
      .limit(1)
      .single();

    if (stepError || !firstStep) {
      throw new Error('No first step found in workflow template');
    }

    // 3. Calculate SLA due date
    const slaDueAt = firstStep.sla_hours
      ? new Date(Date.now() + firstStep.sla_hours * 60 * 60 * 1000).toISOString()
      : null;

    // 4. Create workflow state
    const stateTableName = entityType === 'work_order'
      ? 'work_order_workflow_state'
      : 'incident_workflow_state';
    
    const entityIdField = entityType === 'work_order'
      ? 'work_order_id'
      : 'incident_id';

    const { data: workflowState, error: stateError } = await supabase
      .from(stateTableName)
      .insert({
        [entityIdField]: entityId,
        template_id: template.id,
        current_step_id: firstStep.id,
        organization_id: organizationId,
        step_started_at: new Date().toISOString(),
        sla_due_at: slaDueAt,
      })
      .select()
      .single();

    if (stateError) {
      throw stateError;
    }

    // 5. Log execution
    await logExecution({
      workflow_state_id: workflowState.id,
      entity_type: entityType,
      entity_id: entityId,
      step_id: firstStep.id,
      action_type: 'initialize',
      performed_by: context.userId,
      execution_time_ms: Date.now() - startTime,
      success: true,
      organization_id: organizationId,
    });

    // 6. Publish domain event
    eventBus.publish({
      eventType: DomainEvents.WORKFLOW_INITIALIZED,
      correlationId: context.correlationId,
      payload: {
        entityType,
        entityId,
        templateId: template.id,
        firstStepId: firstStep.id,
      },
      metadata: { organizationId },
    });

    logWithCorrelation(context.correlationId, 'workflow-service', 'info',
      `Workflow initialized successfully in ${Date.now() - startTime}ms`);

    return workflowState;
  } catch (error) {
    // Log failure
    await logExecution({
      entity_type: entityType,
      entity_id: entityId,
      action_type: 'initialize',
      performed_by: context.userId,
      execution_time_ms: Date.now() - startTime,
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      organization_id: organizationId,
    });

    throw error;
  }
}

// Core Function: Transition Step
async function transitionStep(params: {
  entityType: 'work_order' | 'incident';
  entityId: string;
  targetStepId: string;
  comments?: string;
  userId: string;
  organizationId: string;
  context: RequestContext;
}): Promise<{ success: boolean }> {
  const startTime = Date.now();

  try {
    logWithCorrelation(params.context.correlationId, 'workflow-service', 'info',
      `Transitioning ${params.entityType} ${params.entityId} to step ${params.targetStepId}`);

    // 1. Get current workflow state
    const stateTableName = params.entityType === 'work_order'
      ? 'work_order_workflow_state'
      : 'incident_workflow_state';
    
    const entityIdField = params.entityType === 'work_order'
      ? 'work_order_id'
      : 'incident_id';

    const { data: state, error: stateError } = await supabase
      .from(stateTableName)
      .select('*')
      .eq(entityIdField, params.entityId)
      .single();

    if (stateError || !state) {
      throw new Error('Workflow state not found. Has workflow been initialized?');
    }

    // 2. Get target step
    const { data: targetStep, error: stepError } = await supabase
      .from('workflow_template_steps')
      .select('*')
      .eq('id', params.targetStepId)
      .single();

    if (stepError || !targetStep) {
      throw new Error('Target step not found');
    }

    // 3. Validate user permission
    await validateUserPermission(params.userId, state.current_step_id, 'transition');

    // 4. Evaluate step conditions
    const conditionsMet = await evaluateStepConditions(
      params.targetStepId,
      params.entityType,
      params.entityId
    );

    if (!conditionsMet) {
      throw new Error('Step conditions not met for transition');
    }

    // 5. Calculate new SLA
    const slaDueAt = targetStep.sla_hours
      ? new Date(Date.now() + targetStep.sla_hours * 60 * 60 * 1000).toISOString()
      : null;

    // 6. Update workflow state
    const { error: updateError } = await supabase
      .from(stateTableName)
      .update({
        current_step_id: params.targetStepId,
        step_started_at: new Date().toISOString(),
        sla_due_at: slaDueAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', state.id);

    if (updateError) {
      throw updateError;
    }

    // 7. Update entity status if step has status mapping
    const entityStatus = params.entityType === 'work_order'
      ? targetStep.work_order_status
      : targetStep.incident_status;

    if (entityStatus) {
      const entityTableName = params.entityType === 'work_order'
        ? 'workorder_service.work_orders'
        : 'safety_service.safety_incidents';

      await supabase
        .from(entityTableName)
        .update({ status: entityStatus })
        .eq('id', params.entityId);
    }

    // 8. Create approval record
    const approvalTableName = params.entityType === 'work_order'
      ? 'work_order_approvals'
      : 'incident_approvals';
    
    const approvalEntityField = params.entityType === 'work_order'
      ? 'work_order_id'
      : 'incident_id';

    await supabase
      .from(approvalTableName)
      .insert({
        [approvalEntityField]: params.entityId,
        step_id: params.targetStepId,
        approved_by_user_id: params.userId,
        approval_action: 'transition',
        comments: params.comments,
        organization_id: params.organizationId,
      });

    // 9. Log execution
    await logExecution({
      workflow_state_id: state.id,
      entity_type: params.entityType,
      entity_id: params.entityId,
      step_id: params.targetStepId,
      action_type: 'transition',
      performed_by: params.userId,
      execution_time_ms: Date.now() - startTime,
      success: true,
      organization_id: params.organizationId,
    });

    // 10. Publish domain event
    eventBus.publish({
      eventType: DomainEvents.WORKFLOW_STEP_TRANSITIONED,
      correlationId: params.context.correlationId,
      payload: {
        entityType: params.entityType,
        entityId: params.entityId,
        fromStepId: state.current_step_id,
        toStepId: params.targetStepId,
        performedBy: params.userId,
      },
      metadata: { organizationId: params.organizationId },
    });

    logWithCorrelation(params.context.correlationId, 'workflow-service', 'info',
      `Step transition completed successfully in ${Date.now() - startTime}ms`);

    return { success: true };
  } catch (error) {
    // Log failure
    await logExecution({
      entity_type: params.entityType,
      entity_id: params.entityId,
      step_id: params.targetStepId,
      action_type: 'transition',
      performed_by: params.userId,
      execution_time_ms: Date.now() - startTime,
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      organization_id: params.organizationId,
    });

    throw error;
  }
}

// Main request handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const context = extractRequestContext(req);
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  try {
    logWithCorrelation(context.correlationId, 'workflow-service', 'info',
      `${method} ${path}`);

    // Health check
    if (path === '/health' || path === '/workflow-service/health') {
      return new Response(JSON.stringify({ status: 'healthy', service: 'workflow-service' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract clean path (remove /workflow-service prefix if present)
    const cleanPath = path.replace('/workflow-service', '');

    // ===== TEMPLATE MANAGEMENT ENDPOINTS =====

    // GET /templates - List all templates
    if (cleanPath === '/templates' && method === 'GET') {
      const module = url.searchParams.get('module');
      
      let query = supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (module) {
        query = query.eq('module', module);
      }

      if (!context.hasCrossProjectAccess && context.organizationId) {
        query = query.eq('organization_id', context.organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /templates/:id - Get template details with steps
    if (cleanPath.match(/^\/templates\/[^/]+$/) && method === 'GET') {
      const templateId = cleanPath.split('/')[2];

      const { data: template, error: templateError } = await supabase
        .from('workflow_templates')
        .select(`
          *,
          workflow_template_steps(*)
        `)
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      return new Response(JSON.stringify(template), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /templates - Create new template
    if (cleanPath === '/templates' && method === 'POST') {
      const body = await req.json();

      const { data, error } = await supabase
        .from('workflow_templates')
        .insert({
          name: body.name,
          description: body.description,
          module: body.module,
          is_default: body.is_default || false,
          organization_id: body.organization_id || context.organizationId,
          version: body.version || '1.0',
          created_by: context.userId,
        })
        .select()
        .single();

      if (error) throw error;

      eventBus.publish({
        eventType: DomainEvents.WORKFLOW_TEMPLATE_CREATED,
        correlationId: context.correlationId,
        payload: { templateId: data.id, name: data.name, module: data.module },
      });

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /templates/:id - Update template
    if (cleanPath.match(/^\/templates\/[^/]+$/) && method === 'PATCH') {
      const templateId = cleanPath.split('/')[2];
      const body = await req.json();

      const { data, error } = await supabase
        .from('workflow_templates')
        .update({
          name: body.name,
          description: body.description,
          is_active: body.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      eventBus.publish({
        eventType: DomainEvents.WORKFLOW_TEMPLATE_UPDATED,
        correlationId: context.correlationId,
        payload: { templateId: data.id },
      });

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /templates/:id - Delete template
    if (cleanPath.match(/^\/templates\/[^/]+$/) && method === 'DELETE') {
      const templateId = cleanPath.split('/')[2];

      const { error } = await supabase
        .from('workflow_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      eventBus.publish({
        eventType: DomainEvents.WORKFLOW_TEMPLATE_DELETED,
        correlationId: context.correlationId,
        payload: { templateId },
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /templates/:id/set-default - Set as default for module
    if (cleanPath.match(/^\/templates\/[^/]+\/set-default$/) && method === 'POST') {
      const templateId = cleanPath.split('/')[2];
      const body = await req.json();

      // First, unset all defaults for this module
      await supabase
        .from('workflow_templates')
        .update({ is_default: false })
        .eq('module', body.module)
        .eq('organization_id', context.organizationId);

      // Then set this one as default
      const { data, error } = await supabase
        .from('workflow_templates')
        .update({ is_default: true })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== TEMPLATE STEPS ENDPOINTS =====

    // GET /templates/:templateId/steps - Get all steps for template
    if (cleanPath.match(/^\/templates\/[^/]+\/steps$/) && method === 'GET') {
      const templateId = cleanPath.split('/')[2];

      const { data, error } = await supabase
        .from('workflow_template_steps')
        .select('*')
        .eq('template_id', templateId)
        .eq('is_active', true)
        .order('step_order');

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /templates/:templateId/steps - Add step to template
    if (cleanPath.match(/^\/templates\/[^/]+\/steps$/) && method === 'POST') {
      const templateId = cleanPath.split('/')[2];
      const body = await req.json();

      const { data, error } = await supabase
        .from('workflow_template_steps')
        .insert({
          template_id: templateId,
          name: body.name,
          description: body.description,
          step_order: body.step_order,
          sla_hours: body.sla_hours,
          work_order_status: body.work_order_status,
          incident_status: body.incident_status,
          can_approve: body.can_approve || false,
          can_reject: body.can_reject || false,
          can_transition: body.can_transition || false,
          can_assign: body.can_assign || false,
          organization_id: context.organizationId,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /steps/:stepId - Update step
    if (cleanPath.match(/^\/steps\/[^/]+$/) && method === 'PATCH') {
      const stepId = cleanPath.split('/')[2];
      const body = await req.json();

      const { data, error } = await supabase
        .from('workflow_template_steps')
        .update({
          name: body.name,
          description: body.description,
          step_order: body.step_order,
          sla_hours: body.sla_hours,
          work_order_status: body.work_order_status,
          incident_status: body.incident_status,
          can_approve: body.can_approve,
          can_reject: body.can_reject,
          can_transition: body.can_transition,
          can_assign: body.can_assign,
          is_active: body.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', stepId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /steps/:stepId - Delete step
    if (cleanPath.match(/^\/steps\/[^/]+$/) && method === 'DELETE') {
      const stepId = cleanPath.split('/')[2];

      const { error } = await supabase
        .from('workflow_template_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /steps/:stepId/roles - Get role assignments
    if (cleanPath.match(/^\/steps\/[^/]+\/roles$/) && method === 'GET') {
      const stepId = cleanPath.split('/')[2];

      const { data, error } = await supabase
        .from('workflow_step_role_assignments')
        .select('*')
        .eq('step_id', stepId);

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /steps/:stepId/roles - Assign roles to step
    if (cleanPath.match(/^\/steps\/[^/]+\/roles$/) && method === 'POST') {
      const stepId = cleanPath.split('/')[2];
      const body = await req.json();

      const { data, error } = await supabase
        .from('workflow_step_role_assignments')
        .upsert({
          step_id: stepId,
          role_name: body.role_name,
          can_approve: body.can_approve || false,
          can_reject: body.can_reject || false,
          can_assign: body.can_assign || false,
          can_edit: body.can_edit || false,
          organization_id: context.organizationId,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== WORKFLOW STATE ENDPOINTS =====

    // POST /initialize - Initialize workflow for entity
    if (cleanPath === '/initialize' && method === 'POST') {
      const body = await req.json();

      const workflowState = await initializeWorkflow(
        body.entityType,
        body.entityId,
        body.organizationId || context.organizationId!,
        context
      );

      return new Response(JSON.stringify(workflowState), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /state/:entityType/:entityId - Get workflow state
    if (cleanPath.match(/^\/state\/[^/]+\/[^/]+$/) && method === 'GET') {
      const [, , entityType, entityId] = cleanPath.split('/');

      const stateTableName = entityType === 'work_order'
        ? 'work_order_workflow_state'
        : 'incident_workflow_state';
      
      const entityIdField = entityType === 'work_order'
        ? 'work_order_id'
        : 'incident_id';

      const { data, error } = await supabase
        .from(stateTableName)
        .select('*')
        .eq(entityIdField, entityId)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /transition - Transition to next step
    if (cleanPath === '/transition' && method === 'POST') {
      const body = await req.json();

      const result = await transitionStep({
        entityType: body.entityType,
        entityId: body.entityId,
        targetStepId: body.targetStepId,
        comments: body.comments,
        userId: body.userId || context.userId!,
        organizationId: body.organizationId || context.organizationId!,
        context,
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /approve - Approve current step
    if (cleanPath === '/approve' && method === 'POST') {
      const body = await req.json();
      
      // Approve is a transition with approval action
      const result = await transitionStep({
        entityType: body.entityType,
        entityId: body.entityId,
        targetStepId: body.targetStepId,
        comments: body.comments,
        userId: body.userId || context.userId!,
        organizationId: body.organizationId || context.organizationId!,
        context,
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /reject - Reject and transition
    if (cleanPath === '/reject' && method === 'POST') {
      const body = await req.json();

      const result = await transitionStep({
        entityType: body.entityType,
        entityId: body.entityId,
        targetStepId: body.rejectionStepId,
        comments: body.comments,
        userId: body.userId || context.userId!,
        organizationId: body.organizationId || context.organizationId!,
        context,
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /reassign - Reassign to different user
    if (cleanPath === '/reassign' && method === 'POST') {
      const body = await req.json();

      const stateTableName = body.entityType === 'work_order'
        ? 'work_order_workflow_state'
        : 'incident_workflow_state';
      
      const entityIdField = body.entityType === 'work_order'
        ? 'work_order_id'
        : 'incident_id';

      const { data, error } = await supabase
        .from(stateTableName)
        .update({
          assigned_to_user_id: body.assignedToUserId,
          updated_at: new Date().toISOString(),
        })
        .eq(entityIdField, body.entityId)
        .select()
        .single();

      if (error) throw error;

      eventBus.publish({
        eventType: DomainEvents.WORKFLOW_STEP_REASSIGNED,
        correlationId: context.correlationId,
        payload: {
          entityType: body.entityType,
          entityId: body.entityId,
          assignedToUserId: body.assignedToUserId,
        },
      });

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ANALYTICS ENDPOINTS =====

    // GET /analytics/:organizationId - Workflow performance metrics
    if (cleanPath.match(/^\/analytics\/[^/]+$/) && method === 'GET') {
      const organizationId = cleanPath.split('/')[2];

      const { data, error } = await supabase
        .from('workflow_service.execution_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate metrics
      const totalExecutions = data.length;
      const successfulExecutions = data.filter(log => log.success).length;
      const avgExecutionTime = data.reduce((sum, log) => sum + log.execution_time_ms, 0) / totalExecutions;

      return new Response(JSON.stringify({
        totalExecutions,
        successfulExecutions,
        failedExecutions: totalExecutions - successfulExecutions,
        avgExecutionTimeMs: Math.round(avgExecutionTime),
        recentLogs: data.slice(0, 10),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /status/:module - Module workflow status
    if (cleanPath.match(/^\/status\/[^/]+$/) && method === 'GET') {
      const module = cleanPath.split('/')[2];

      const stateTableName = module === 'work_orders'
        ? 'work_order_workflow_state'
        : 'incident_workflow_state';

      const { count: totalCount } = await supabase
        .from(stateTableName)
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', context.organizationId);

      return new Response(JSON.stringify({
        module,
        totalWorkflows: totalCount || 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== BULK OPERATIONS =====

    // POST /bulk-initialize - Initialize multiple workflows
    if (cleanPath === '/bulk-initialize' && method === 'POST') {
      const body = await req.json();
      const { entityType, entityIds, organizationId } = body;

      const results = [];
      for (const entityId of entityIds) {
        try {
          const state = await initializeWorkflow(
            entityType,
            entityId,
            organizationId || context.organizationId!,
            context
          );
          results.push({ entityId, success: true, state });
        } catch (error) {
          results.push({ entityId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route not found
    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logWithCorrelation(context.correlationId, 'workflow-service', 'error',
      'Request failed', { error: error instanceof Error ? error.message : 'Unknown error', path, method });

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(JSON.stringify({
      error: errorMessage,
      correlationId: context.correlationId,
    }), {
      status: errorMessage.includes('not found') ? 404 :
              errorMessage.includes('permission') ? 403 :
              errorMessage.includes('conditions not met') ? 409 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
