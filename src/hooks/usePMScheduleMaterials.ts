import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { pmSchedulesApi } from "@/services/api-client";
import { useState } from "react";

/**
 * Hook for managing PM Schedule Materials
 * Handles CRUD operations for materials planned for specific PM schedules
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
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("pm_schedule_materials")
        .select("*")
        .eq("pm_schedule_id", pmScheduleId);

      if (error) throw error;
      
      // Fetch BOM item details separately (cross-schema relationship)
      const enrichedData = await Promise.all(
        (data || []).map(async (material) => {
          const { data: bomItemData } = await supabase
            .from("bom_items")
            .select("item_name, item_number, unit, cost_per_unit, inventory_item_id")
            .eq("id", material.bom_item_id)
            .single();
          
          return {
            ...material,
            bom_items: bomItemData || {
              item_name: 'Unknown Item',
              item_number: '',
              unit: 'EA',
              cost_per_unit: 0,
              inventory_item_id: null
            }
          };
        })
      );
      
      return enrichedData as PMScheduleMaterial[];
    },
    enabled: !!pmScheduleId,
  });
};

// Create PM schedule material
export const useCreatePMScheduleMaterial = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useMutation({
    mutationFn: async (material: Omit<PMScheduleMaterial, "id" | "created_at" | "updated_at">) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.materials.create(material.pm_schedule_id, material);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("pm_schedule_materials")
        .insert(material)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedule-materials", variables.pm_schedule_id] });
      toast({
        title: "Material added",
        description: "PM schedule material has been added successfully.",
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PMScheduleMaterial> }) => {
      if (useMicroservice) {
        try {
          return await pmSchedulesApi.materials.update(id, updates);
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("pm_schedule_materials")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedule-materials", data.pm_schedule_id] });
      toast({
        title: "Material updated",
        description: "PM schedule material has been updated successfully.",
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
          return { id, pmScheduleId };
        } catch (error) {
          console.warn('PM Schedules microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { error } = await supabase
        .from("pm_schedule_materials")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, pmScheduleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedule-materials", data.pmScheduleId] });
      toast({
        title: "Material removed",
        description: "PM schedule material has been removed successfully.",
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
