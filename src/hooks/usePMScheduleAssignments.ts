import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { pmSchedulesApi } from "@/services/api-client";
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
          console.warn('PM Schedules microservice unavailable, feature disabled:', error);
          setUseMicroservice(false);
          // Return empty array - table is in microservice schema
          return [];
        }
      }

      // No fallback - table is in microservice schema
      return [];
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
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async (assignment: Omit<PMScheduleAssignment, "id" | "created_at" | "updated_at" | "organization_id">) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.assignments.create(assignment.pm_schedule_id, assignment);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable:', error);
          setUseMicroservice(false);
          throw new Error('PM schedule assignments feature temporarily unavailable');
        }
      }
      
      throw new Error('PM schedule assignments feature requires microservice');
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
    mutationFn: async ({ assignmentId, scheduleId }: { assignmentId: string; scheduleId: string }) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.assignments.delete(assignmentId);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable:', error);
          setUseMicroservice(false);
          throw new Error('PM schedule assignments feature temporarily unavailable');
        }
      }
      
      throw new Error('PM schedule assignments feature requires microservice');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedule-assignments", variables.scheduleId] });
      toast({
        title: "Assignment deleted",
        description: "The person has been unassigned from the schedule.",
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
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async ({ 
      scheduleId, 
      assignedPersonIds 
    }: { 
      scheduleId: string; 
      assignedPersonIds: string[] 
    }) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.assignments.bulkUpdate(scheduleId, assignedPersonIds);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable:', error);
          setUseMicroservice(false);
          throw new Error('PM schedule assignments feature temporarily unavailable');
        }
      }
      
      throw new Error('PM schedule assignments feature requires microservice');
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
