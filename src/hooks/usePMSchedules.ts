import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types for PM Schedules
export interface PMSchedule {
  id: string;
  schedule_number: string;
  title: string;
  description?: string;
  asset_id: string;
  job_plan_id?: string;
  frequency_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  frequency_value: number;
  frequency_unit?: 'days' | 'weeks' | 'months' | 'years';
  start_date: string;
  next_due_date?: string;
  last_completed_date?: string;
  lead_time_days: number;
  assigned_to?: string;
  assigned_team_id?: string;
  priority: string;
  estimated_duration_hours?: number;
  is_active: boolean;
  status: 'active' | 'paused' | 'suspended' | 'completed';
  auto_generate_wo: boolean;
  notification_enabled: boolean;
  safety_precaution_ids?: string[] | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  asset?: {
    name: string;
    asset_number?: string;
  };
  job_plan?: {
    title: string;
    job_plan_number: string;
  };
  assigned_person?: {
    first_name: string;
    last_name: string;
  };
}

export interface PMScheduleInsert {
  schedule_number: string;
  title: string;
  description?: string;
  asset_id: string;
  job_plan_id?: string;
  frequency_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  frequency_value: number;
  frequency_unit?: 'days' | 'weeks' | 'months' | 'years';
  start_date: string;
  next_due_date?: string;
  lead_time_days?: number;
  assigned_to?: string;
  assigned_team_id?: string;
  priority?: string;
  estimated_duration_hours?: number;
  auto_generate_wo?: boolean;
  notification_enabled?: boolean;
  safety_precaution_ids?: string[];
  organization_id: string;
}

export interface PMScheduleStats {
  total_active: number;
  overdue: number;
  due_this_week: number;
  completed_this_month: number;
}

/**
 * Hook to fetch all PM schedules with asset and job plan details
 */
export const usePMSchedules = () => {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ["pm_schedules", currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pm_schedules")
        .select(`
          *,
          asset:assets(name, asset_number),
          job_plan:job_plans(title, job_plan_number),
          assigned_person:people(first_name, last_name)
        `)
        .eq("organization_id", currentOrganization?.id)
        .order("next_due_date", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as PMSchedule[];
    },
    enabled: !!currentOrganization?.id,
  });
};

/**
 * Hook to fetch a single PM schedule by ID
 */
export const usePMSchedule = (id: string) => {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ["pm_schedule", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pm_schedules")
        .select(`
          *,
          asset:assets(name, asset_number, manufacturer, model),
          job_plan:job_plans(title, job_plan_number, description),
          assigned_person:people(first_name, last_name, email)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PMSchedule;
    },
    enabled: !!id && !!currentOrganization?.id,
  });
};

/**
 * Hook to fetch PM schedules for a specific asset
 */
export const usePMSchedulesByAsset = (assetId: string) => {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ["pm_schedules_by_asset", assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pm_schedules")
        .select(`
          *,
          job_plan:job_plans(title, job_plan_number),
          assigned_person:people(first_name, last_name)
        `)
        .eq("asset_id", assetId)
        .eq("organization_id", currentOrganization?.id)
        .order("next_due_date", { ascending: true });

      if (error) throw error;
      return data as PMSchedule[];
    },
    enabled: !!assetId && !!currentOrganization?.id,
  });
};

/**
 * Hook to fetch PM schedule statistics
 */
export const usePMScheduleStats = () => {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ["pm_schedule_stats", currentOrganization?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Fetch all active schedules
      const { data: activeSchedules, error: activeError } = await supabase
        .from("pm_schedules")
        .select("id")
        .eq("organization_id", currentOrganization?.id)
        .eq("is_active", true);

      if (activeError) throw activeError;

      // Fetch overdue schedules
      const { data: overdueSchedules, error: overdueError } = await supabase
        .from("pm_schedules")
        .select("id")
        .eq("organization_id", currentOrganization?.id)
        .eq("is_active", true)
        .lt("next_due_date", today);

      if (overdueError) throw overdueError;

      // Fetch schedules due this week
      const { data: dueThisWeek, error: weekError } = await supabase
        .from("pm_schedules")
        .select("id")
        .eq("organization_id", currentOrganization?.id)
        .eq("is_active", true)
        .gte("next_due_date", today)
        .lte("next_due_date", weekFromNow);

      if (weekError) throw weekError;

      // Fetch completed this month
      const { data: completedThisMonth, error: monthError } = await supabase
        .from("pm_schedule_history")
        .select("id")
        .eq("organization_id", currentOrganization?.id)
        .eq("status", "completed")
        .gte("completed_date", monthStart);

      if (monthError) throw monthError;

      return {
        total_active: activeSchedules?.length || 0,
        overdue: overdueSchedules?.length || 0,
        due_this_week: dueThisWeek?.length || 0,
        completed_this_month: completedThisMonth?.length || 0,
      } as PMScheduleStats;
    },
    enabled: !!currentOrganization?.id,
  });
};

/**
 * Hook to create a new PM schedule
 */
export const useCreatePMSchedule = () => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (schedule: PMScheduleInsert) => {
      const { data, error } = await supabase
        .from("pm_schedules")
        .insert([schedule])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedule_stats"] });
      toast.success("PM schedule created successfully");
    },
    onError: (error: Error) => {
      console.error("Error creating PM schedule:", error);
      toast.error(`Failed to create PM schedule: ${error.message}`);
    },
  });
};

/**
 * Hook to update a PM schedule
 */
export const useUpdatePMSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PMScheduleInsert> }) => {
      const { data, error } = await supabase
        .from("pm_schedules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedule"] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedule_stats"] });
      toast.success("PM schedule updated successfully");
    },
    onError: (error: Error) => {
      console.error("Error updating PM schedule:", error);
      toast.error(`Failed to update PM schedule: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a PM schedule
 */
export const useDeletePMSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pm_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedule_stats"] });
      toast.success("PM schedule deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Error deleting PM schedule:", error);
      toast.error(`Failed to delete PM schedule: ${error.message}`);
    },
  });
};

/**
 * Hook to pause/resume a PM schedule
 */
export const usePausePMSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pause }: { id: string; pause: boolean }) => {
      const { data, error } = await supabase
        .from("pm_schedules")
        .update({ 
          status: pause ? 'paused' : 'active',
          is_active: !pause 
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pm_schedules"] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedule"] });
      queryClient.invalidateQueries({ queryKey: ["pm_schedule_stats"] });
      toast.success(variables.pause ? "PM schedule paused" : "PM schedule resumed");
    },
    onError: (error: Error) => {
      console.error("Error pausing/resuming PM schedule:", error);
      toast.error(`Failed to update PM schedule: ${error.message}`);
    },
  });
};
