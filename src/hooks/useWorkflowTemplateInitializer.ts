import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InitializeWorkflowParams {
  entityId: string;
  entityType: "work_order" | "incident";
  organizationId: string;
}

/**
 * Hook to initialize workflow state for a new entity (work order or incident)
 * Automatically assigns the default workflow template for the module
 */
export const useWorkflowTemplateInitializer = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityId, entityType, organizationId }: InitializeWorkflowParams) => {
      // Get the default workflow template for this entity type
      const module = entityType === "work_order" ? "work_orders" : "safety_incidents";
      
      const { data: template, error: templateError } = await supabase
        .from("workflow_templates")
        .select("id, workflow_template_steps(id, step_order)")
        .eq("module", module)
        .eq("is_default", true)
        .eq("is_active", true)
        .eq("organization_id", organizationId)
        .order("step_order", { foreignTable: "workflow_template_steps" })
        .single();

      if (templateError || !template) {
        console.warn("No default workflow template found for", module);
        return null;
      }

      // Get the first step
      const firstStep = template.workflow_template_steps?.[0];
      if (!firstStep) {
        console.warn("No workflow steps found in template");
        return null;
      }

      // Initialize workflow state
      const tableName = entityType === "work_order" 
        ? "work_order_workflow_state" 
        : "incident_workflow_state";
      
      const entityIdField = entityType === "work_order" 
        ? "work_order_id" 
        : "incident_id";

      const workflowData: any = {
        [entityIdField]: entityId,
        template_id: template.id,
        current_step_id: firstStep.id,
        organization_id: organizationId,
        step_started_at: new Date().toISOString(),
      };

      const { data: workflowState, error: stateError } = await supabase
        .from(tableName)
        .insert(workflowData)
        .select()
        .single();

      if (stateError) throw stateError;
      
      return workflowState;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_order_workflow"] });
      queryClient.invalidateQueries({ queryKey: ["incident_workflow"] });
    },
    onError: (error) => {
      console.error("Failed to initialize workflow:", error);
      toast({
        title: "Workflow Initialization Failed",
        description: "The workflow could not be initialized, but the entity was created.",
        variant: "destructive",
      });
    },
  });
};
