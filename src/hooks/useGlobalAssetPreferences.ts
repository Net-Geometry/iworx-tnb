import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Admin-only hook to save global default display preferences for an asset
 * These defaults apply to all users who haven't set personal preferences
 */
export const useGlobalAssetPreferences = (assetId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveGlobalDefaults = useMutation({
    mutationFn: async (data: {
      selected_sensor_types: string[];
      refresh_interval_seconds?: number;
      max_readings_shown?: number;
    }) => {
      if (!assetId) throw new Error("Asset ID required");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get organization_id
      const { data: orgData } = await supabase
        .from("user_organizations")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!orgData) throw new Error("Organization not found");

      const preferenceData = {
        asset_id: assetId,
        user_id: null, // Global default has no user_id
        organization_id: orgData.organization_id,
        selected_sensor_types: data.selected_sensor_types,
        is_global_default: true,
        refresh_interval_seconds: data.refresh_interval_seconds || 30,
        max_readings_shown: data.max_readings_shown || 50,
      };

      const { data: result, error } = await supabase
        .from("asset_display_preferences")
        .upsert(preferenceData, {
          onConflict: "asset_id,user_id",
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-display-preferences"] });
      toast({
        title: "Global defaults saved",
        description: "Global display preferences have been set for all users.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving global defaults",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    saveGlobalDefaults: saveGlobalDefaults.mutate,
    isSaving: saveGlobalDefaults.isPending,
  };
};
