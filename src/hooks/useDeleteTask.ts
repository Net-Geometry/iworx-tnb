import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { jobPlansApi } from "@/services/api-client";

/**
 * Hook to delete a task from a job plan
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      try {
        // Try microservice first
        return await jobPlansApi.tasks.delete(taskId);
      } catch (error) {
        console.warn('Job Plans microservice unavailable, falling back to direct query', error);
        
        // Fallback to direct Supabase
        const { error: supabaseError } = await supabase
          .from("job_plan_tasks")
          .delete()
          .eq("id", taskId);

        if (supabaseError) throw supabaseError;
      }
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["job-plans"] });
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    },
  });
}
