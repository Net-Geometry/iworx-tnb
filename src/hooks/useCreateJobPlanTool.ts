import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { jobPlansApi } from "@/services/api-client";

interface CreateJobPlanToolData {
  job_plan_id: string;
  tool_name: string;
  tool_description?: string;
  quantity_required?: number;
  notes?: string;
  is_specialized_tool?: boolean;
  organization_id: string;
}

export function useCreateJobPlanTool() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobPlanToolData) => {
      try {
        // Try microservice first
        return await jobPlansApi.tools.create(data);
      } catch (error) {
        console.warn('Job Plans microservice unavailable, falling back to direct query', error);
        
        // Fallback to direct Supabase
        const { data: newTool, error: supabaseError } = await supabase
          .from("job_plan_tools")
          .insert(data)
          .select()
          .single();

        if (supabaseError) throw supabaseError;
        return newTool;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job-plan", variables.job_plan_id] });
      toast({
        title: "Success",
        description: "Tool added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add tool: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}
