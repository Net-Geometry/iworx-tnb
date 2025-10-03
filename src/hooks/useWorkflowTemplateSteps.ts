import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WorkflowTemplateStep {
  id: string;
  template_id: string;
  name: string;
  description: string | null;
  step_order: number;
  step_type: string;
  sla_hours: number | null;
  is_required: boolean;
  approval_type: string;
  auto_assign_enabled: boolean;
  auto_assign_logic: any;
  form_fields: any;
  work_order_status: string | null;
  incident_status: string | null;
  allows_work_order_creation: boolean | null;
  reject_target_step_id: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface StepRoleAssignment {
  id: string;
  step_id: string;
  role_name: string;
  can_approve: boolean;
  can_reject: boolean;
  can_assign: boolean;
  can_view: boolean;
  can_edit: boolean;
  is_primary_assignee: boolean;
  is_backup_assignee: boolean;
  assignment_logic: any;
  organization_id: string;
  created_at: string;
}

export interface StepCondition {
  id: string;
  step_id: string;
  condition_type: string;
  field_name: string | null;
  operator: string | null;
  value: any;
  action: string;
  target_step_id: string | null;
  priority: number;
  organization_id: string;
  created_at: string;
}

/**
 * Hook to fetch workflow template steps
 */
export const useWorkflowTemplateSteps = (templateId: string | undefined) => {
  return useQuery({
    queryKey: ["workflow_template_steps", templateId],
    queryFn: async () => {
      if (!templateId) return [];

      const { data, error } = await supabase
        .from("workflow_template_steps")
        .select("*")
        .eq("template_id", templateId)
        .order("step_order");

      if (error) throw error;
      return data as WorkflowTemplateStep[];
    },
    enabled: !!templateId,
  });
};

/**
 * Hook to create a new workflow step
 */
export const useCreateWorkflowStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (step: Omit<WorkflowTemplateStep, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("workflow_template_steps")
        .insert([step])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workflow_template_steps", data.template_id] });
      toast.success("Workflow step created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create step: ${error.message}`);
    },
  });
};

/**
 * Hook to update a workflow step
 */
export const useUpdateWorkflowStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkflowTemplateStep> & { id: string }) => {
      const { data, error } = await supabase
        .from("workflow_template_steps")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workflow_template_steps", data.template_id] });
      toast.success("Workflow step updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update step: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a workflow step
 */
export const useDeleteWorkflowStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stepId, templateId }: { stepId: string; templateId: string }) => {
      const { error } = await supabase
        .from("workflow_template_steps")
        .delete()
        .eq("id", stepId);

      if (error) throw error;
      return templateId;
    },
    onSuccess: (templateId) => {
      queryClient.invalidateQueries({ queryKey: ["workflow_template_steps", templateId] });
      toast.success("Workflow step deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete step: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch step role assignments
 */
export const useStepRoleAssignments = (stepId: string | undefined) => {
  return useQuery({
    queryKey: ["workflow_step_roles", stepId],
    queryFn: async () => {
      if (!stepId) return [];

      const { data, error } = await supabase
        .from("workflow_step_role_assignments")
        .select("*")
        .eq("step_id", stepId);

      if (error) throw error;
      return data as StepRoleAssignment[];
    },
    enabled: !!stepId,
  });
};

/**
 * Hook to create/update step role assignments
 */
export const useUpsertStepRoleAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: Omit<StepRoleAssignment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from("workflow_step_role_assignments")
        .upsert([assignment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workflow_step_roles", data.step_id] });
    },
  });
};

/**
 * Hook to fetch step conditions
 */
export const useStepConditions = (stepId: string | undefined) => {
  return useQuery({
    queryKey: ["workflow_step_conditions", stepId],
    queryFn: async () => {
      if (!stepId) return [];

      const { data, error } = await supabase
        .from("workflow_step_conditions")
        .select("*")
        .eq("step_id", stepId)
        .order("priority");

      if (error) throw error;
      return data as StepCondition[];
    },
    enabled: !!stepId,
  });
};

/**
 * Hook to create a step condition
 */
export const useCreateStepCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (condition: Omit<StepCondition, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from("workflow_step_conditions")
        .insert([condition])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workflow_step_conditions", data.step_id] });
      toast.success("Condition added");
    },
  });
};

/**
 * Hook to delete a step condition
 */
export const useDeleteStepCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conditionId, stepId }: { conditionId: string; stepId: string }) => {
      const { error } = await supabase
        .from("workflow_step_conditions")
        .delete()
        .eq("id", conditionId);

      if (error) throw error;
      return stepId;
    },
    onSuccess: (stepId) => {
      queryClient.invalidateQueries({ queryKey: ["workflow_step_conditions", stepId] });
      toast.success("Condition removed");
    },
  });
};
