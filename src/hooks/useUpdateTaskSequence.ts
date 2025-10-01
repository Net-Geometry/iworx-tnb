import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook to update task sequences in batch
 * Used for reordering tasks via drag-and-drop
 */
export function useUpdateTaskSequence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ updates }: { updates: Array<{ id: string; task_sequence: number }> }) => {
      // Update all tasks in parallel
      const updatePromises = updates.map(({ id, task_sequence }) =>
        supabase
          .from("job_plan_tasks")
          .update({ task_sequence, updated_at: new Date().toISOString() })
          .eq("id", id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error("Failed to update task sequence");
      }

      return results;
    },
    onSuccess: () => {
      toast.success("Task order updated successfully");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["job-plans"] });
    },
    onError: (error) => {
      console.error("Error updating task sequence:", error);
      toast.error("Failed to update task order");
    },
  });
}
