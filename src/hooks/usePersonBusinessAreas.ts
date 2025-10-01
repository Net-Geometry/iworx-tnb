import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Interface for person business area assignment
 */
export interface PersonBusinessArea {
  id: string;
  person_id: string;
  business_area_id: string;
  organization_id: string;
  assigned_date: string;
  is_primary: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  business_area?: {
    id: string;
    business_area: string | null;
    region: string | null;
    state: string | null;
    station: string | null;
  };
}

/**
 * Hook for fetching person's business area assignments
 */
export const usePersonBusinessAreas = (personId: string | undefined) => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  return useQuery({
    queryKey: ["person-business-areas", personId, currentOrganization?.id],
    queryFn: async () => {
      if (!personId) return [];

      let query = supabase
        .from("person_business_areas")
        .select(`
          *,
          business_area (
            id,
            business_area,
            region,
            state,
            station
          )
        `)
        .eq("person_id", personId)
        .eq("status", "active")
        .order("is_primary", { ascending: false })
        .order("assigned_date", { ascending: false });

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PersonBusinessArea[];
    },
    enabled: !!personId && (!!currentOrganization || hasCrossProjectAccess),
  });
};

/**
 * Hook for assigning a business area to a person
 */
export const useAssignBusinessArea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async ({
      person_id,
      business_area_id,
      is_primary = false,
    }: {
      person_id: string;
      business_area_id: string;
      is_primary?: boolean;
    }) => {
      if (!currentOrganization) throw new Error("No organization selected");

      // If setting as primary, unset other primary assignments first
      if (is_primary) {
        await supabase
          .from("person_business_areas")
          .update({ is_primary: false })
          .eq("person_id", person_id)
          .eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await supabase
        .from("person_business_areas")
        .insert({
          person_id,
          business_area_id,
          organization_id: currentOrganization.id,
          is_primary,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["person-business-areas", variables.person_id] });
      queryClient.invalidateQueries({ queryKey: ["person", variables.person_id] });
      toast({
        title: "Success",
        description: "Business area assigned successfully",
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
 * Hook for removing a business area assignment
 */
export const useRemoveBusinessArea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, person_id }: { id: string; person_id: string }) => {
      const { error } = await supabase
        .from("person_business_areas")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, person_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["person-business-areas", data.person_id] });
      queryClient.invalidateQueries({ queryKey: ["person", data.person_id] });
      toast({
        title: "Success",
        description: "Business area removed successfully",
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
 * Hook for setting a business area as primary
 */
export const useSetPrimaryBusinessArea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async ({ id, person_id }: { id: string; person_id: string }) => {
      if (!currentOrganization) throw new Error("No organization selected");

      // Unset all primary flags for this person
      await supabase
        .from("person_business_areas")
        .update({ is_primary: false })
        .eq("person_id", person_id)
        .eq("organization_id", currentOrganization.id);

      // Set this one as primary
      const { error } = await supabase
        .from("person_business_areas")
        .update({ is_primary: true })
        .eq("id", id);

      if (error) throw error;
      return { id, person_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["person-business-areas", data.person_id] });
      queryClient.invalidateQueries({ queryKey: ["person", data.person_id] });
      toast({
        title: "Success",
        description: "Primary business area updated",
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
