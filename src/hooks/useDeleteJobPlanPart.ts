import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeleteJobPlanPartData {
  id: string;
  job_plan_id: string;
}

export function useDeleteJobPlanPart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteJobPlanPartData) => {
      const { error } = await supabase
        .from("job_plan_parts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job-plan", variables.job_plan_id] });
      toast({
        title: "Success",
        description: "Part deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete part: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}
