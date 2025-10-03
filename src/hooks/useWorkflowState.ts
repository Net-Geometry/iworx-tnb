import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WorkflowState {
  id: string;
  work_order_id?: string;
  incident_id?: string;
  template_id: string | null;
  current_step_id: string | null;
  assigned_to_user_id: string | null;
  pending_approval_from_role: string | null;
  step_started_at: string;
  sla_due_at: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRecord {
  id: string;
  work_order_id?: string;
  incident_id?: string;
  step_id: string | null;
  approved_by_user_id: string | null;
  approved_at: string;
  comments: string | null;
  approval_action: string;
  organization_id: string | null;
  created_at: string;
}

/**
 * Hook for managing work order workflow state
 */
export const useWorkOrderWorkflow = (workOrderId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workflowState, isLoading } = useQuery({
    queryKey: ["work_order_workflow_state", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      
      const { data, error } = await supabase
        .from("work_order_workflow_state")
        .select("*")
        .eq("work_order_id", workOrderId)
        .maybeSingle();

      if (error) throw error;
      return data as WorkflowState | null;
    },
    enabled: !!workOrderId,
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["work_order_approvals", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      
      const { data, error } = await supabase
        .from("work_order_approvals")
        .select("*")
        .eq("work_order_id", workOrderId)
        .order("approved_at", { ascending: false });

      if (error) throw error;
      return data as ApprovalRecord[];
    },
    enabled: !!workOrderId,
  });

  const transitionStep = useMutation({
    mutationFn: async ({
      stepId,
      assignedToUserId,
      comments,
      approvalAction,
    }: {
      stepId: string;
      assignedToUserId?: string;
      comments?: string;
      approvalAction: "approved" | "rejected" | "reassigned";
    }) => {
      if (!workOrderId) throw new Error("Work order ID is required");

      // Get the step's work_order_status to update work order
      const { data: stepData, error: stepError } = await supabase
        .from("workflow_template_steps")
        .select("work_order_status")
        .eq("id", stepId)
        .single();

      if (stepError) throw stepError;

      // Update or create workflow state
      const { error: stateError } = await supabase
        .from("work_order_workflow_state")
        .upsert({
          work_order_id: workOrderId,
          current_step_id: stepId,
          assigned_to_user_id: assignedToUserId || null,
          step_started_at: new Date().toISOString(),
        });

      if (stateError) throw stateError;

      // Update work order status if step has a work_order_status configured
      if (stepData?.work_order_status) {
        const { error: woStatusError } = await supabase
          .from("work_orders")
          // @ts-expect-error - Types will regenerate after schema migration
          .update({ status: stepData.work_order_status })
          .eq("id", workOrderId);

        if (woStatusError) throw woStatusError;
      }

      // Create approval record
      const { error: approvalError } = await supabase
        .from("work_order_approvals")
        .insert({
          work_order_id: workOrderId,
          step_id: stepId,
          comments: comments || null,
          approval_action: approvalAction,
        });

      if (approvalError) throw approvalError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_order_workflow_state", workOrderId] });
      queryClient.invalidateQueries({ queryKey: ["work_order_approvals", workOrderId] });
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      
      toast({
        title: "Workflow Updated",
        description: "Work order workflow has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update workflow.",
      });
    },
  });

  return {
    workflowState,
    approvals,
    isLoading,
    transitionStep,
  };
};

/**
 * Hook for managing incident workflow state
 */
export const useIncidentWorkflow = (incidentId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workflowState, isLoading } = useQuery({
    queryKey: ["incident_workflow_state", incidentId],
    queryFn: async () => {
      if (!incidentId) return null;
      
      const { data, error } = await supabase
        .from("incident_workflow_state")
        .select("*")
        .eq("incident_id", incidentId)
        .maybeSingle();

      if (error) throw error;
      return data as WorkflowState | null;
    },
    enabled: !!incidentId,
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["incident_approvals", incidentId],
    queryFn: async () => {
      if (!incidentId) return [];
      
      const { data, error } = await supabase
        .from("incident_approvals")
        .select("*")
        .eq("incident_id", incidentId)
        .order("approved_at", { ascending: false });

      if (error) throw error;
      return data as ApprovalRecord[];
    },
    enabled: !!incidentId,
  });

  const transitionStep = useMutation({
    mutationFn: async ({
      stepId,
      assignedToUserId,
      comments,
      approvalAction,
    }: {
      stepId: string;
      assignedToUserId?: string;
      comments?: string;
      approvalAction: "approved" | "rejected" | "reassigned" | "escalated";
    }) => {
      if (!incidentId) throw new Error("Incident ID is required");

      // Get the step's incident_status to update incident
      const { data: stepData, error: stepError } = await supabase
        .from("workflow_template_steps")
        .select("incident_status")
        .eq("id", stepId)
        .single();

      if (stepError) throw stepError;

      // Update or create workflow state
      const { error: stateError } = await supabase
        .from("incident_workflow_state")
        .upsert({
          incident_id: incidentId,
          current_step_id: stepId,
          assigned_to_user_id: assignedToUserId || null,
          step_started_at: new Date().toISOString(),
        });

      if (stateError) throw stateError;

      // Update incident status if step has an incident_status configured
      if (stepData?.incident_status) {
        const { error: incidentStatusError } = await supabase
          .from("safety_incidents")
          .update({ status: stepData.incident_status as 'reported' | 'investigating' | 'resolved' | 'closed' })
          .eq("id", incidentId);

        if (incidentStatusError) throw incidentStatusError;
      }

      // Create approval record
      const { error: approvalError } = await supabase
        .from("incident_approvals")
        .insert({
          incident_id: incidentId,
          step_id: stepId,
          comments: comments || null,
          approval_action: approvalAction,
        });

      if (approvalError) throw approvalError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident_workflow_state", incidentId] });
      queryClient.invalidateQueries({ queryKey: ["incident_approvals", incidentId] });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      
      toast({
        title: "Workflow Updated",
        description: "Incident workflow has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update workflow.",
      });
    },
  });

  return {
    workflowState,
    approvals,
    isLoading,
    transitionStep,
  };
};
