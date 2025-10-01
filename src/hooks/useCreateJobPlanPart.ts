import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateJobPlanPartData {
  job_plan_id: string;
  part_name: string;
  part_number?: string;
  quantity_required: number;
  inventory_item_id?: string;
  notes?: string;
  is_critical_part?: boolean;
  organization_id: string;
}

export function useCreateJobPlanPart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobPlanPartData) => {
      const { data: newPart, error } = await supabase
        .from("job_plan_parts")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return newPart;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job-plan", variables.job_plan_id] });
      toast({
        title: "Success",
        description: "Part added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add part: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}
