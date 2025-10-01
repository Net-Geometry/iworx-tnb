import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PersonCraft {
  id: string;
  person_id: string;
  craft_id: string;
  organization_id: string;
  proficiency_level: string;
  certification_status: string;
  assigned_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  crafts: {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
  } | null;
}

/**
 * Hook for managing person craft assignments
 */
export const usePersonCrafts = (personId?: string) => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();
  const queryClient = useQueryClient();

  // Fetch person crafts
  const { data: personCrafts = [], isLoading } = useQuery({
    queryKey: ["person-crafts", personId, currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from("person_crafts")
        .select(`
          *,
          crafts (
            id,
            name,
            code,
            description
          )
        `);

      if (personId) {
        query = query.eq("person_id", personId);
      }

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as any as PersonCraft[];
    },
    enabled: !!personId && (!!currentOrganization || hasCrossProjectAccess),
  });

  // Add craft to person
  const addPersonCraft = useMutation({
    mutationFn: async (
      personCraft: Omit<PersonCraft, "id" | "created_at" | "updated_at" | "crafts">
    ) => {
      const { data, error } = await supabase
        .from("person_crafts")
        .insert({
          ...personCraft,
          organization_id: currentOrganization?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["person-crafts"] });
      toast.success("Craft assigned successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to assign craft", {
        description: error.message,
      });
    },
  });

  // Update person craft
  const updatePersonCraft = useMutation({
    mutationFn: async ({
      id,
      ...personCraft
    }: Partial<PersonCraft> & { id: string }) => {
      const { data, error } = await supabase
        .from("person_crafts")
        .update(personCraft)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["person-crafts"] });
      toast.success("Craft assignment updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update craft assignment", {
        description: error.message,
      });
    },
  });

  // Remove craft from person
  const removePersonCraft = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("person_crafts").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["person-crafts"] });
      toast.success("Craft removed successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove craft", {
        description: error.message,
      });
    },
  });

  return {
    personCrafts,
    isLoading,
    addPersonCraft,
    updatePersonCraft,
    removePersonCraft,
  };
};
