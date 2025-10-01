import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      const { data: newTool, error } = await supabase
        .from("job_plan_tools")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return newTool;
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
