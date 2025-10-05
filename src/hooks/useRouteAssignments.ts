import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PMSchedule } from "./usePMSchedules";
import { routesApi } from "@/services/api-client";
import { useState } from "react";

/**
 * Hook to fetch PM schedules assigned to a specific route
 */
export const useRouteAssignments = (routeId?: string) => {
  const { currentOrganization } = useAuth();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useQuery({
    queryKey: ["route_assignments", routeId],
    queryFn: async () => {
      if (!routeId) return [];

      if (useMicroservice) {
        try {
          return await routesApi.getAssignments(routeId);
        } catch (error) {
          console.warn('Routes microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("pm_schedules")
        .select("*")
        .eq("route_id", routeId)
        .eq("organization_id", currentOrganization?.id)
        .order("next_due_date", { ascending: true, nullsFirst: false });

      if (error) throw error;

      // Fetch related data separately (cross-schema relationships)
      const enrichedData = await Promise.all(
        (data || []).map(async (schedule) => {
          const [assetData, jobPlanData, personData] = await Promise.all([
            schedule.asset_id
              ? supabase.from("assets").select("name, asset_number").eq("id", schedule.asset_id).maybeSingle()
              : Promise.resolve(null),
            schedule.job_plan_id
              ? supabase.from("job_plans").select("title, job_plan_number").eq("id", schedule.job_plan_id).maybeSingle()
              : Promise.resolve(null),
            schedule.assigned_to
              ? supabase.from("people").select("first_name, last_name").eq("id", schedule.assigned_to).maybeSingle()
              : Promise.resolve(null),
          ]);

          return {
            ...schedule,
            asset: assetData?.data || null,
            job_plan: jobPlanData?.data || null,
            assigned_person: personData?.data || null,
          };
        })
      );

      return enrichedData as PMSchedule[];
    },
    enabled: !!routeId && !!currentOrganization?.id,
  });
};

/**
 * Hook to fetch unassigned PM schedules (available for assignment to routes)
 */
export const useUnassignedPMSchedules = () => {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ["unassigned_pm_schedules", currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pm_schedules")
        .select("*")
        .is("route_id", null)
        .eq("organization_id", currentOrganization?.id)
        .eq("is_active", true)
        .order("title", { ascending: true });

      if (error) throw error;

      // Fetch related data separately
      const enrichedData = await Promise.all(
        (data || []).map(async (schedule) => {
          const [assetData, jobPlanData] = await Promise.all([
            schedule.asset_id
              ? supabase.from("assets").select("name, asset_number").eq("id", schedule.asset_id).maybeSingle()
              : Promise.resolve(null),
            schedule.job_plan_id
              ? supabase.from("job_plans").select("title, job_plan_number").eq("id", schedule.job_plan_id).maybeSingle()
              : Promise.resolve(null),
          ]);

          return {
            ...schedule,
            asset: assetData?.data || null,
            job_plan: jobPlanData?.data || null,
          };
        })
      );

      return enrichedData as PMSchedule[];
    },
    enabled: !!currentOrganization?.id,
  });
};

/**
 * Hook to assign a PM schedule to a route
 */
export const useAssignPMScheduleToRoute = () => {
  const queryClient = useQueryClient();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async ({ scheduleId, routeId }: { scheduleId: string; routeId: string }) => {
      if (useMicroservice) {
        try {
          return await routesApi.assignPMSchedule(routeId, scheduleId);
        } catch (error) {
          console.warn('Routes microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("pm_schedules")
        .update({ route_id: routeId })
        .eq("id", scheduleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["route_assignments", variables.routeId] });
      queryClient.invalidateQueries({ queryKey: ["unassigned_pm_schedules"] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
      toast.success("PM schedule assigned to route successfully");
    },
    onError: (error: Error) => {
      console.error("Error assigning PM schedule to route:", error);
      toast.error(`Failed to assign PM schedule: ${error.message}`);
    },
  });
};

/**
 * Hook to unassign a PM schedule from a route
 */
export const useUnassignPMScheduleFromRoute = () => {
  const queryClient = useQueryClient();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async ({ scheduleId, routeId }: { scheduleId: string; routeId: string }) => {
      if (useMicroservice) {
        try {
          return await routesApi.unassignPMSchedule(scheduleId);
        } catch (error) {
          console.warn('Routes microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("pm_schedules")
        .update({ route_id: null })
        .eq("id", scheduleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["route_assignments", variables.routeId] });
      queryClient.invalidateQueries({ queryKey: ["unassigned_pm_schedules"] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
      toast.success("PM schedule unassigned from route");
    },
    onError: (error: Error) => {
      console.error("Error unassigning PM schedule from route:", error);
      toast.error(`Failed to unassign PM schedule: ${error.message}`);
    },
  });
};

/**
 * Hook to bulk assign multiple PM schedules to a route
 */
export const useBulkAssignPMSchedulesToRoute = () => {
  const queryClient = useQueryClient();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async ({ scheduleIds, routeId }: { scheduleIds: string[]; routeId: string }) => {
      if (useMicroservice) {
        try {
          return await routesApi.bulkAssignPMSchedules(routeId, scheduleIds);
        } catch (error) {
          console.warn('Routes microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const updates = scheduleIds.map((scheduleId) =>
        supabase.from("pm_schedules").update({ route_id: routeId }).eq("id", scheduleId)
      );

      const results = await Promise.all(updates);

      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to assign ${errors.length} schedule(s)`);
      }

      return results;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["route_assignments", variables.routeId] });
      queryClient.invalidateQueries({ queryKey: ["unassigned_pm_schedules"] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
      toast.success(`${variables.scheduleIds.length} PM schedule(s) assigned successfully`);
    },
    onError: (error: Error) => {
      console.error("Error bulk assigning PM schedules:", error);
      toast.error(`Failed to assign PM schedules: ${error.message}`);
    },
  });
};
