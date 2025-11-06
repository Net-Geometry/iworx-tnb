import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { pmSchedulesApi } from "@/services/api-client";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

/**
 * PM Schedule History Interface
 * 
 * Note: This table is in public schema but we use the microservice API
 * for consistency with other PM schedule operations.
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
        }
      }

      // Fallback: Direct Supabase query
      const { data, error } = await supabase
        .from("pm_schedule_history")
        .select("*")
        .eq("pm_schedule_id", scheduleId)
        .order("completed_date", { ascending: false });

      if (error) throw error;
      return data || [];
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
  const { currentOrganization } = useAuth();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async (history: Omit<PMScheduleHistory, "id" | "created_at">) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.history.create(history.pm_schedule_id, history);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
        }
      }

      // Fallback: Direct Supabase insert
      const { data, error } = await supabase
        .from("pm_schedule_history")
        .insert({
          pm_schedule_id: history.pm_schedule_id,
          work_order_id: history.work_order_id,
          completed_date: history.completed_date,
          completed_by: history.completed_by,
          notes: history.notes,
          actual_duration_hours: history.actual_duration_hours,
          organization_id: currentOrganization?.id || history.organization_id,
        })
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
