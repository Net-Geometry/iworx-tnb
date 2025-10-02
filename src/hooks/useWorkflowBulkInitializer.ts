import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook to get workflow status statistics for a module
 */
export const useWorkflowStatus = (module: 'work_orders' | 'safety_incidents') => {
  return useQuery({
    queryKey: ["workflow_status", module],
    queryFn: async () => {
      // Get the default template for this module
      const { data: template } = await supabase
        .from("workflow_templates")
        .select("id")
        .eq("module", module)
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();

      if (!template) {
        return {
          totalEntities: 0,
          withWorkflow: 0,
          withoutWorkflow: 0,
          hasDefaultTemplate: false,
        };
      }

      const tableName = module === 'work_orders' ? 'work_orders' : 'safety_incidents';
      const stateTable = module === 'work_orders' ? 'work_order_workflow_state' : 'incident_workflow_state';
      const foreignKey = module === 'work_orders' ? 'work_order_id' : 'incident_id';

      // Get total entities
      const { count: totalCount } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true });

      // Get entities with workflow
      const { count: withWorkflowCount } = await supabase
        .from(stateTable)
        .select("*", { count: "exact", head: true });

      return {
        totalEntities: totalCount || 0,
        withWorkflow: withWorkflowCount || 0,
        withoutWorkflow: (totalCount || 0) - (withWorkflowCount || 0),
        hasDefaultTemplate: true,
      };
    },
  });
};

/**
 * Hook to bulk initialize workflows for entities missing them
 */
export const useWorkflowBulkInitializer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ module }: { module: 'work_orders' | 'safety_incidents' }) => {
      // Get the default template
      const { data: template, error: templateError } = await supabase
        .from("workflow_templates")
        .select("id, organization_id")
        .eq("module", module)
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();

      if (templateError) throw templateError;
      if (!template) {
        throw new Error(`No default workflow template found for ${module}`);
      }

      // Get the first step of the template
      const { data: firstStep, error: stepError } = await supabase
        .from("workflow_template_steps")
        .select("id")
        .eq("template_id", template.id)
        .order("step_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (stepError) throw stepError;
      if (!firstStep) {
        throw new Error(`No steps found for the default workflow template`);
      }

      // Get entities without workflow
      const tableName = module === 'work_orders' ? 'work_orders' : 'safety_incidents';
      const stateTable = module === 'work_orders' ? 'work_order_workflow_state' : 'incident_workflow_state';
      const foreignKey = module === 'work_orders' ? 'work_order_id' : 'incident_id';

      // Find entities without workflow states
      const { data: allEntities, error: entitiesError } = await supabase
        .from(tableName)
        .select("id, organization_id");

      if (entitiesError) throw entitiesError;

      const { data: existingStates, error: statesError } = await supabase
        .from(stateTable)
        .select(foreignKey);

      if (statesError) throw statesError;

      const existingIds = new Set(existingStates?.map((s: any) => s[foreignKey]) || []);
      const entitiesWithoutWorkflow = allEntities?.filter(e => !existingIds.has(e.id)) || [];

      if (entitiesWithoutWorkflow.length === 0) {
        return { initialized: 0, failed: 0 };
      }

      // Bulk insert workflow states
      const workflowStates = entitiesWithoutWorkflow.map(entity => {
        const baseState = {
          template_id: template.id,
          current_step_id: firstStep.id,
          organization_id: entity.organization_id,
        };

        if (module === 'work_orders') {
          return { ...baseState, work_order_id: entity.id };
        } else {
          return { ...baseState, incident_id: entity.id };
        }
      });

      const { error: insertError } = await supabase
        .from(stateTable)
        .insert(workflowStates as any);

      if (insertError) throw insertError;

      return {
        initialized: entitiesWithoutWorkflow.length,
        failed: 0,
      };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflow_status", variables.module] });
      
      if (variables.module === 'work_orders') {
        queryClient.invalidateQueries({ queryKey: ["work_order_workflow"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["incident_workflow"] });
      }

      toast.success(`Successfully initialized workflows for ${data.initialized} ${variables.module.replace('_', ' ')}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to initialize workflows: ${error.message}`);
    },
  });
};
