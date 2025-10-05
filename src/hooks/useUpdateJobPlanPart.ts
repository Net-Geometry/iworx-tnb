import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { jobPlansApi } from "@/services/api-client";

interface UpdateJobPlanPartData {
  id: string;
  job_plan_id: string;
  part_name?: string;
  part_number?: string;
  quantity_required?: number;
  inventory_item_id?: string;
  notes?: string;
  is_critical_part?: boolean;
}

export function useUpdateJobPlanPart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, job_plan_id, ...data }: UpdateJobPlanPartData) => {
      try {
        // Try microservice first
        return await jobPlansApi.parts.update(id, data);
      } catch (error) {
        console.warn('Job Plans microservice unavailable, falling back to direct query', error);
        
        // Fallback to direct Supabase
        const { data: updatedPart, error: supabaseError } = await supabase
          .from("job_plan_parts")
          .update(data)
          .eq("id", id)
          .select()
          .single();

        if (supabaseError) throw supabaseError;
        return updatedPart;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job-plan", variables.job_plan_id] });
      toast({
        title: "Success",
        description: "Part updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update part: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}
