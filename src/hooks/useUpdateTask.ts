import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateTaskData {
  id: string;
  task_title?: string;
  task_description?: string;
  estimated_duration_minutes?: number;
  skill_required?: string;
  is_critical_step?: boolean;
  completion_criteria?: string;
  notes?: string;
}

/**
 * Hook to update individual task details
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTaskData) => {
      const { id, ...updates } = data;
      
      const { data: result, error } = await supabase
        .from("job_plan_tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("Task updated successfully");
      queryClient.invalidateQueries({ queryKey: ["job-plans"] });
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    },
  });
}
