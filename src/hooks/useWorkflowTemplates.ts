import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
  module: string;
  organization_id: string;
  is_active: boolean;
  is_default: boolean;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch workflow templates for a specific module
 */
export const useWorkflowTemplates = (module?: string) => {
  return useQuery({
    queryKey: ["workflow_templates", module],
    queryFn: async () => {
      let query = supabase
        .from("workflow_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (module) {
        query = query.eq("module", module);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as WorkflowTemplate[];
    },
  });
};

/**
 * Hook to fetch a single workflow template by ID
 */
export const useWorkflowTemplate = (templateId: string | undefined) => {
  return useQuery({
    queryKey: ["workflow_template", templateId],
    queryFn: async () => {
      if (!templateId) return null;

      const { data, error } = await supabase
        .from("workflow_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (error) throw error;
      return data as WorkflowTemplate;
    },
    enabled: !!templateId,
  });
};

/**
 * Hook to create a new workflow template
 */
export const useCreateWorkflowTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("workflow_templates")
        .insert([{ ...template, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow_templates"] });
      toast.success("Workflow template created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
};

/**
 * Hook to update a workflow template
 */
export const useUpdateWorkflowTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkflowTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("workflow_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workflow_templates"] });
      queryClient.invalidateQueries({ queryKey: ["workflow_template", data.id] });
      toast.success("Workflow template updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a workflow template
 */
export const useDeleteWorkflowTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("workflow_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow_templates"] });
      toast.success("Workflow template deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
};

/**
 * Hook to set a template as default for a module
 */
export const useSetDefaultTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, module }: { templateId: string; module: string }) => {
      // First, unset any existing default for this module
      await supabase
        .from("workflow_templates")
        .update({ is_default: false })
        .eq("module", module);

      // Then set the new default
      const { data, error } = await supabase
        .from("workflow_templates")
        .update({ is_default: true })
        .eq("id", templateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow_templates"] });
      toast.success("Default template updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to set default: ${error.message}`);
    },
  });
};
