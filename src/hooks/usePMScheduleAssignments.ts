import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { pmSchedulesApi } from "@/services/api-client";
import { useState } from "react";

/**
 * PM Schedule Assignment Interface
 */
export interface PMScheduleAssignment {
  id: string;
  pm_schedule_id: string;
  assigned_person_id: string;
  assignment_role: 'primary' | 'secondary' | 'reviewer' | 'assigned';
  organization_id: string;
  created_at: string;
  updated_at: string;
  person?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_number: string;
    email?: string;
    job_title?: string;
    hourly_rate?: number;
  };
}

/**
 * Hook to fetch assignments for a specific PM schedule
 */
export const usePMScheduleAssignments = (scheduleId?: string) => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useQuery({
    queryKey: ["pm_schedule_assignments", scheduleId],
    queryFn: async () => {
      if (!scheduleId) return [];

      if (useMicroservice) {
        try {
          return await pmSchedulesApi.assignments.getAll(scheduleId);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      let query = supabase
        .from("pm_schedule_assignments")
        .select("*")
        .eq("pm_schedule_id", scheduleId);

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch person details separately (cross-schema relationship)
      const enrichedData = await Promise.all(
        (data || []).map(async (assignment) => {
          const { data: personData } = await supabase
            .from("people")
            .select("id, first_name, last_name, employee_number, email, job_title, hourly_rate")
            .eq("id", assignment.assigned_person_id)
            .single();
          
          return {
            ...assignment,
            person: personData || {
              id: assignment.assigned_person_id,
              first_name: 'Unknown',
              last_name: '',
              employee_number: '',
              email: '',
              job_title: '',
              hourly_rate: 0
            }
          };
        })
      );
      
      return enrichedData as PMScheduleAssignment[];
    },
    enabled: !!scheduleId && (!!currentOrganization || hasCrossProjectAccess),
  });
};

/**
 * Hook to create a single assignment
 */
export const useCreatePMScheduleAssignment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async (assignment: {
      pm_schedule_id: string;
      assigned_person_id: string;
      assignment_role?: 'primary' | 'secondary' | 'reviewer' | 'assigned';
    }) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.assignments.create(assignment.pm_schedule_id, assignment);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("pm_schedule_assignments")
        .insert({
          ...assignment,
          organization_id: currentOrganization?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pm_schedule_assignments", variables.pm_schedule_id] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to assign person.",
      });
    },
  });
};

/**
 * Hook to delete an assignment
 */
export const useDeletePMScheduleAssignment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async ({ id, scheduleId }: { id: string; scheduleId: string }) => {
      if (useMicroservice) {
        try {
          await pmSchedulesApi.assignments.delete(id);
          return { scheduleId };
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { error } = await supabase
        .from("pm_schedule_assignments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { scheduleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pm_schedule_assignments", data.scheduleId] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove assignment.",
      });
    },
  });
};

/**
 * Hook to bulk update assignments for a schedule
 * Replaces all existing assignments with new ones
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
          await pmSchedulesApi.assignments.bulkUpdate(scheduleId, assignedPersonIds);
          return { scheduleId };
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from("pm_schedule_assignments")
        .delete()
        .eq("pm_schedule_id", scheduleId);

      if (deleteError) throw deleteError;

      // Insert new assignments if any
      if (assignedPersonIds.length > 0) {
        const newAssignments = assignedPersonIds.map((personId, index) => ({
          pm_schedule_id: scheduleId,
          assigned_person_id: personId,
          assignment_role: index === 0 ? 'primary' as const : 'assigned' as const,
          organization_id: currentOrganization?.id,
        }));

        const { error: insertError } = await supabase
          .from("pm_schedule_assignments")
          .insert(newAssignments);

        if (insertError) throw insertError;
      }

      return { scheduleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pm_schedule_assignments", data.scheduleId] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update assignments.",
      });
    },
  });
};
