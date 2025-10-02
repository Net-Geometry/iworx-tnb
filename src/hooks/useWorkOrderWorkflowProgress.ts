import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkOrderWorkflow } from "@/hooks/useWorkflowState";
import { useWorkflowTemplateSteps } from "@/hooks/useWorkflowTemplateSteps";

/**
 * Hook to fetch and combine work order workflow progress
 * Connects workflow state with template steps for progress tracking
 */
export const useWorkOrderWorkflowProgress = (workOrderId: string | undefined) => {
  // Fetch workflow state and approvals for this work order
  const { 
    workflowState, 
    approvals, 
    isLoading: workflowLoading 
  } = useWorkOrderWorkflow(workOrderId);

  // Fetch template steps if we have a template_id
  const { 
    data: templateSteps = [], 
    isLoading: stepsLoading 
  } = useWorkflowTemplateSteps(workflowState?.template_id);

  // Find current step details
  const currentStep = templateSteps.find(
    step => step.id === workflowState?.current_step_id
  );

  return {
    workflowState,
    templateSteps,
    currentStep,
    approvals,
    isLoading: workflowLoading || stepsLoading,
    hasWorkflow: !!workflowState,
  };
};
