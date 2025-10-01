import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Hook for managing route asset assignments
 * Handles adding, removing, and reordering assets in routes
 */

export interface RouteAsset {
  id: string;
  route_id: string;
  asset_id: string;
  sequence_order: number;
  estimated_time_minutes?: number;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  asset?: {
    id: string;
    name: string;
    asset_number?: string;
    category?: string;
    status?: string;
  };
}

export const useRouteAssets = (routeId: string | undefined) => {
  const { currentOrganization } = useAuth();
  const queryClient = useQueryClient();

  // Fetch route assets
  const { data: routeAssets = [], isLoading } = useQuery({
    queryKey: ["route-assets", routeId],
    queryFn: async () => {
      if (!routeId) return [];

      const { data, error } = await supabase
        .from("route_assets")
        .select("*")
        .eq("route_id", routeId)
        .order("sequence_order", { ascending: true });

      if (error) throw error;
      
      // Fetch asset details separately (cross-schema relationship)
      const enrichedData = await Promise.all(
        (data || []).map(async (routeAsset) => {
          const { data: assetData } = await supabase
            .from("assets")
            .select("id, name, asset_number, category, status, hierarchy_node_id")
            .eq("id", routeAsset.asset_id)
            .single();
          
          return {
            ...routeAsset,
            asset: assetData || {
              id: routeAsset.asset_id,
              name: 'Unknown Asset',
              asset_number: '',
              category: '',
              status: ''
            }
          };
        })
      );
      
      return enrichedData as RouteAsset[];
    },
    enabled: !!routeId && !!currentOrganization,
  });

  // Add asset to route
  const addAsset = useMutation({
    mutationFn: async (assetData: {
      asset_id: string;
      sequence_order: number;
      estimated_time_minutes?: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("route_assets")
        .insert([
          {
            route_id: routeId,
            organization_id: currentOrganization?.id,
            ...assetData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-assets", routeId] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-routes"] });
      toast.success("Asset added to route");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add asset");
    },
  });

  // Remove asset from route
  const removeAsset = useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await supabase
        .from("route_assets")
        .delete()
        .eq("id", assetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-assets", routeId] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-routes"] });
      toast.success("Asset removed from route");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove asset");
    },
  });

  // Update asset in route
  const updateAsset = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<RouteAsset>;
    }) => {
      const { data, error } = await supabase
        .from("route_assets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-assets", routeId] });
      toast.success("Asset updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update asset");
    },
  });

  // Reorder assets (bulk update)
  const reorderAssets = useMutation({
    mutationFn: async (
      reorderedAssets: Array<{ id: string; sequence_order: number }>
    ) => {
      const updates = reorderedAssets.map((asset) =>
        supabase
          .from("route_assets")
          .update({ sequence_order: asset.sequence_order })
          .eq("id", asset.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-assets", routeId] });
      toast.success("Asset order updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reorder assets");
    },
  });

  return {
    routeAssets,
    isLoading,
    addAsset: addAsset.mutate,
    removeAsset: removeAsset.mutate,
    updateAsset: updateAsset.mutate,
    reorderAssets: reorderAssets.mutate,
  };
};
