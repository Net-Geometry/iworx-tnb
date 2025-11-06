import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { pmSchedulesApi } from "@/services/api-client";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

/**
 * PM Schedule Assignment Interface
 * 
 * Note: This table is managed in the workorder_service microservice schema.
 * We access it through the microservice API with fallback to empty data.
 */
export interface PMScheduleAssignment {
  id: string;
  pm_schedule_id: string;
  assigned_person_id: string;
  assignment_role: "primary" | "assigned";
  assigned_by?: string;
  assigned_at: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Nested person details
  person?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

/**
 * Hook to fetch PM schedule assignments
 * Only uses microservice API since table is in workorder_service schema
 */
export const usePMScheduleAssignments = (scheduleId?: string) => {
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useQuery({
    queryKey: ["pm-schedule-assignments", scheduleId],
    queryFn: async () => {
      if (!scheduleId) return [];

      if (useMicroservice) {
        try {
          return await pmSchedulesApi.assignments.getAll(scheduleId);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
        }
      }

      // Fallback: Direct Supabase query
      const { data, error } = await supabase
        .from("pm_schedule_assignments")
        .select(`
          *,
          person:people(
            first_name,
            last_name,
            email
          )
        `)
        .eq("pm_schedule_id", scheduleId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!scheduleId,
  });
};

/**
 * Hook to create a PM schedule assignment
 */
export const useCreatePMScheduleAssignment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async (assignment: Omit<PMScheduleAssignment, "id" | "created_at" | "updated_at" | "person">) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.assignments.create(assignment.pm_schedule_id, assignment);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
        }
      }

      // Fallback: Direct Supabase insert
      const { data, error } = await supabase
        .from("pm_schedule_assignments")
        .insert({
          pm_schedule_id: assignment.pm_schedule_id,
          assigned_person_id: assignment.assigned_person_id,
          assignment_role: assignment.assignment_role,
          organization_id: currentOrganization?.id || assignment.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedule-assignments", variables.pm_schedule_id] });
      toast({
        title: "Assignment created",
        description: "The person has been assigned to the schedule.",
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

/**
 * Hook to delete a PM schedule assignment
 */
export const useDeletePMScheduleAssignment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async ({ id, pmScheduleId }: { id: string; pmScheduleId: string }) => {
      if (useMicroservice) {
        try {
          await pmSchedulesApi.assignments.delete(id);
          return { pmScheduleId };
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
        }
      }

      // Fallback: Direct Supabase delete
      const { error } = await supabase
        .from("pm_schedule_assignments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { pmScheduleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedule-assignments", data.pmScheduleId] });
      toast({
        title: "Assignment deleted",
        description: "Person has been removed from the PM schedule.",
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

/**
 * Hook to bulk update PM schedule assignments
 * Replaces all existing assignments with a new set
 */
export const useBulkUpdatePMScheduleAssignments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async ({
      scheduleId,
      assignedPersonIds,
    }: {
      scheduleId: string;
      assignedPersonIds: string[];
    }) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.assignments.bulkUpdate(scheduleId, assignedPersonIds);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
        }
      }

      // Fallback: Direct Supabase bulk update
      // 1. Delete all existing assignments for this schedule
      const { error: deleteError } = await supabase
        .from("pm_schedule_assignments")
        .delete()
        .eq("pm_schedule_id", scheduleId);

      if (deleteError) throw deleteError;

      // 2. Insert new assignments
      if (assignedPersonIds.length > 0) {
        const newAssignments = assignedPersonIds.map((personId, index) => ({
          pm_schedule_id: scheduleId,
          assigned_person_id: personId,
          assignment_role: index === 0 ? "primary" : "assigned",
          organization_id: currentOrganization?.id,
        }));

        const { error: insertError } = await supabase
          .from("pm_schedule_assignments")
          .insert(newAssignments);

        if (insertError) throw insertError;
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedule-assignments", variables.scheduleId] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
      toast({
        title: "Assignments updated",
        description: "Schedule assignments have been updated successfully.",
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
