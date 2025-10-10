import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AssetDisplayPreferences {
  id: string;
  asset_id: string;
  user_id: string | null;
  organization_id: string;
  selected_sensor_types: string[];
  is_global_default: boolean;
  refresh_interval_seconds: number;
  max_readings_shown: number;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch and manage asset-specific display preferences
 * Priority order:
 * 1. User's personal preferences for this asset
 * 2. Global default preferences for this asset  
 * 3. System defaults (show all sensor types)
 */
export const useAssetDisplayPreferences = (assetId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch preferences with priority order
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["asset-display-preferences", assetId],
    queryFn: async () => {
      if (!assetId) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Try to get user's personal preference first
      const { data: userPref } = await supabase
        .from("asset_display_preferences")
        .select("*")
        .eq("asset_id", assetId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (userPref) {
        return { ...userPref, source: "user" as const };
      }

      // Try to get global default
      const { data: globalPref } = await supabase
        .from("asset_display_preferences")
        .select("*")
        .eq("asset_id", assetId)
        .is("user_id", null)
        .eq("is_global_default", true)
        .maybeSingle();

      if (globalPref) {
        return { ...globalPref, source: "global" as const };
      }

      // Return system defaults
      return {
        asset_id: assetId,
        user_id: null,
        selected_sensor_types: [], // Empty means show all
        is_global_default: false,
        refresh_interval_seconds: 30,
        max_readings_shown: 50,
        source: "system" as const,
      };
    },
    enabled: !!assetId,
  });

  // Save user preferences
  const savePreferences = useMutation({
    mutationFn: async (data: {
      selected_sensor_types: string[];
      refresh_interval_seconds?: number;
      max_readings_shown?: number;
      is_global_default?: boolean;
    }) => {
      if (!assetId) throw new Error("Asset ID required");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      // Get organization_id from user metadata or profiles
      const { data: orgData } = await supabase
        .from("user_organizations")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!orgData) throw new Error("Organization not found");

      const preferenceData = {
        asset_id: assetId,
        user_id: data.is_global_default ? null : user.id,
        organization_id: orgData.organization_id,
        selected_sensor_types: data.selected_sensor_types,
        is_global_default: data.is_global_default || false,
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
      queryClient.invalidateQueries({ queryKey: ["asset-display-preferences", assetId] });
      toast({
        title: "Preferences saved",
        description: "Your display preferences have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    preferences,
    isLoading,
    savePreferences: savePreferences.mutate,
    isSaving: savePreferences.isPending,
  };
};
