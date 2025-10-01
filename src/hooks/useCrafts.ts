import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Craft {
  id: string;
  organization_id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook for managing crafts data
 */
export const useCrafts = () => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();
  const queryClient = useQueryClient();

  // Fetch crafts
  const { data: crafts = [], isLoading } = useQuery({
    queryKey: ["crafts", currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from("crafts")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Craft[];
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });

  // Create craft mutation
  const createCraft = useMutation({
    mutationFn: async (craft: Omit<Craft, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("crafts")
        .insert({
          ...craft,
          organization_id: currentOrganization?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crafts"] });
      toast.success("Craft created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create craft", {
        description: error.message,
      });
    },
  });

  // Update craft mutation
  const updateCraft = useMutation({
    mutationFn: async ({ id, ...craft }: Partial<Craft> & { id: string }) => {
      const { data, error } = await supabase
        .from("crafts")
        .update(craft)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crafts"] });
      toast.success("Craft updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update craft", {
        description: error.message,
      });
    },
  });

  // Delete craft mutation
  const deleteCraft = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crafts").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crafts"] });
      toast.success("Craft deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete craft", {
        description: error.message,
      });
    },
  });

  return {
    crafts,
    isLoading,
    createCraft,
    updateCraft,
    deleteCraft,
  };
};
