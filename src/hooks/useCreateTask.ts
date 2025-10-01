import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateTaskData {
  job_plan_id: string;
  task_title: string;
  task_description?: string;
  estimated_duration_minutes?: number;
  skill_required?: string;
  is_critical_step?: boolean;
  completion_criteria?: string;
  notes?: string;
  task_sequence: number;
  organization_id: string;
}

/**
 * Hook to create a new task for a job plan
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const { data: result, error } = await supabase
        .from("job_plan_tasks")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("Task created successfully");
      queryClient.invalidateQueries({ queryKey: ["job-plans"] });
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    },
  });
}
