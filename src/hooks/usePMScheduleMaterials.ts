import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { pmSchedulesApi } from "@/services/api-client";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

/**
 * Hook for managing PM Schedule Materials
 * Handles CRUD operations for materials planned for specific PM schedules
 * 
 * Note: This table is in public schema but we use the microservice API
 * for consistency with other PM schedule operations.
 */

export interface PMScheduleMaterial {
  id: string;
  pm_schedule_id: string;
  bom_item_id: string;
  planned_quantity: number;
  estimated_unit_cost?: number;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  bom_items?: {
    item_name: string;
    item_number?: string;
    unit: string;
    cost_per_unit?: number;
    inventory_item_id?: string;
  };
}

// Fetch materials for a PM schedule
export const usePMScheduleMaterials = (pmScheduleId?: string) => {
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useQuery({
    queryKey: ["pm-schedule-materials", pmScheduleId],
    queryFn: async () => {
      if (!pmScheduleId) return [];

      if (useMicroservice) {
        try {
          return await pmSchedulesApi.materials.getAll(pmScheduleId);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
        }
      }

      // Fallback: Direct Supabase query
      const { data, error } = await supabase
        .from("pm_schedule_materials")
        .select(`
          *,
          bom_items(
            item_name,
            item_number,
            unit,
            cost_per_unit,
            inventory_item_id
          )
        `)
        .eq("pm_schedule_id", pmScheduleId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!pmScheduleId,
  });
};

// Create PM schedule material
export const useCreatePMScheduleMaterial = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async (material: Omit<PMScheduleMaterial, "id" | "created_at" | "updated_at">) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.materials.create(material.pm_schedule_id, material);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
        }
      }

      // Fallback: Direct Supabase insert
      const { data, error } = await supabase
        .from("pm_schedule_materials")
        .insert({
          pm_schedule_id: material.pm_schedule_id,
          bom_item_id: material.bom_item_id,
          planned_quantity: material.planned_quantity,
          estimated_unit_cost: material.estimated_unit_cost,
          notes: material.notes,
          organization_id: currentOrganization?.id || material.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedule-materials", variables.pm_schedule_id] });
      toast({
        title: "Material added",
        description: "Material has been added to the PM schedule.",
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

// Update PM schedule material
export const useUpdatePMScheduleMaterial = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async ({ id, pmScheduleId, ...updates }: Partial<PMScheduleMaterial> & { id: string; pmScheduleId: string }) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.materials.update(id, updates);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
        }
      }

      // Fallback: Direct Supabase update
      const { data, error } = await supabase
        .from("pm_schedule_materials")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedule-materials", variables.pmScheduleId] });
      toast({
        title: "Material updated",
        description: "Material has been updated successfully.",
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

// Delete PM schedule material
export const useDeletePMScheduleMaterial = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async ({ id, pmScheduleId }: { id: string; pmScheduleId: string }) => {
      if (useMicroservice) {
        try {
          await pmSchedulesApi.materials.delete(id);
          return { pmScheduleId };
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
        }
      }

      // Fallback: Direct Supabase delete
      const { error } = await supabase
        .from("pm_schedule_materials")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { pmScheduleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedule-materials", data.pmScheduleId] });
      toast({
        title: "Material deleted",
        description: "Material has been removed from the PM schedule.",
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
