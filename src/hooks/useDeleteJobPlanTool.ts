import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeleteJobPlanToolData {
  id: string;
  job_plan_id: string;
}

export function useDeleteJobPlanTool() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteJobPlanToolData) => {
      const { error } = await supabase
        .from("job_plan_tools")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job-plan", variables.job_plan_id] });
      toast({
        title: "Success",
        description: "Tool deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete tool: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}
