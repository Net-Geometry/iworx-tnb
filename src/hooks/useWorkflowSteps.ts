import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorkflowStep {
  id: string;
  name: string;
  description: string | null;
  module: string;
  step_order: number;
  required_role: string;
  can_approve: boolean;
  can_assign: boolean;
  can_transition_to: string[] | null;
  auto_assign_logic: any;
  sla_hours: number | null;
  is_active: boolean;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch workflow steps for a specific module
 * @param module - 'work_orders' or 'safety_incidents'
 */
export const useWorkflowSteps = (module: string) => {
  return useQuery({
    queryKey: ["workflow_steps", module],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_steps")
        .select("*")
        .eq("module", module)
        .eq("is_active", true)
        .order("step_order");

      if (error) throw error;
      return data as WorkflowStep[];
    },
  });
};
