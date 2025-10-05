import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { jobPlansApi } from "@/services/api-client";

interface UpdateJobPlanToolData {
  id: string;
  job_plan_id: string;
  tool_name?: string;
  tool_description?: string;
  quantity_required?: number;
  notes?: string;
  is_specialized_tool?: boolean;
}

export function useUpdateJobPlanTool() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, job_plan_id, ...data }: UpdateJobPlanToolData) => {
      try {
        // Try microservice first
        return await jobPlansApi.tools.update(id, data);
      } catch (error) {
        console.warn('Job Plans microservice unavailable, falling back to direct query', error);
        
        // Fallback to direct Supabase
        const { data: updatedTool, error: supabaseError } = await supabase
          .from("job_plan_tools")
          .update(data)
          .eq("id", id)
          .select()
          .single();

        if (supabaseError) throw supabaseError;
        return updatedTool;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job-plan", variables.job_plan_id] });
      toast({
        title: "Success",
        description: "Tool updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update tool: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}
