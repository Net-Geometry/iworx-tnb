import { useIncidentWorkflow } from "@/hooks/useWorkflowState";
import { useWorkflowTemplateSteps, useStepRoleAssignments } from "@/hooks/useWorkflowTemplateSteps";
import { useCurrentUserRoles } from "@/hooks/useCurrentUserRoles";

/**
 * Determines if the current user can edit the incident
 * based on their role assignments for the current workflow step
 */
export const useCanEditIncident = (incidentId: string | undefined) => {
  const { workflowState } = useIncidentWorkflow(incidentId);
  const { data: steps } = useWorkflowTemplateSteps(workflowState?.template_id || undefined);
  const currentStep = steps?.find((s) => s.id === workflowState?.current_step_id);
  const { data: stepRoleAssignments } = useStepRoleAssignments(currentStep?.id);
  const { roles } = useCurrentUserRoles();

  if (!workflowState || !currentStep || !stepRoleAssignments || !roles) {
    return false;
  }

  const userRoleNames = roles.map((r) => r.role_name.toLowerCase());
  
  // User can edit if they have ANY workflow permission on this step
  const canEdit = stepRoleAssignments.some((assignment) =>
    userRoleNames.includes(assignment.role_name.toLowerCase()) &&
    (assignment.can_approve || 
     assignment.can_reject || 
     assignment.can_assign || 
     assignment.can_edit)
  );

  return canEdit;
};
