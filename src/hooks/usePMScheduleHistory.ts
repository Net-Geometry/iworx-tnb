import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { pmSchedulesApi } from "@/services/api-client";
import { useState } from "react";

/**
 * PM Schedule History Interface
 */
export interface PMScheduleHistory {
  id: string;
  pm_schedule_id: string;
  work_order_id?: string;
  completed_date: string;
  completed_by?: string;
  notes?: string;
  actual_duration_hours?: number;
  organization_id: string;
  created_at: string;
}

/**
 * Hook to fetch completion history for a PM schedule
 */
export const usePMScheduleHistory = (scheduleId?: string) => {
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useQuery({
    queryKey: ["pm-schedule-history", scheduleId],
    queryFn: async () => {
      if (!scheduleId) return [];

      if (useMicroservice) {
        try {
          return await pmSchedulesApi.history.getAll(scheduleId);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("pm_schedule_history")
        .select("*")
        .eq("pm_schedule_id", scheduleId)
        .order("completed_date", { ascending: false });

      if (error) throw error;
      return data as PMScheduleHistory[];
    },
    enabled: !!scheduleId,
  });
};

/**
 * Hook to record a completion in history
 */
export const useCreatePMScheduleHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async (history: Omit<PMScheduleHistory, "id" | "created_at">) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.history.create(history.pm_schedule_id, history);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("pm_schedule_history")
        .insert(history)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedule-history", variables.pm_schedule_id] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
      toast({
        title: "History recorded",
        description: "PM schedule completion has been recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
