import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GlobalDisplayPreferences {
  id?: string;
  device_id?: string;
  selected_metrics: string[];
  lorawan_fields: string[];
  refresh_interval_seconds: number;
  max_readings_shown: number;
  is_global_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook for managing global (device-level) display preferences
 * Only admins can use this to set defaults for all users
 */
export const useGlobalDevicePreferences = (deviceId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['global-device-display-preferences', deviceId],
    queryFn: async () => {
      if (!deviceId) return null;

      const { data, error } = await supabase
        .from('iot_device_display_preferences')
        .select('*')
        .eq('device_id', deviceId)
        .is('user_id', null)
        .eq('is_global_default', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!deviceId,
  });

  const updateMutation = useMutation({
    mutationFn: async (preferences: Partial<GlobalDisplayPreferences>) => {
      if (!deviceId) throw new Error('Device ID required');

      const { data: orgData } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .limit(1)
        .single();

      if (!orgData) throw new Error('Organization not found');

      const { data, error } = await supabase
        .from('iot_device_display_preferences')
        .upsert({
          device_id: deviceId,
          user_id: null,
          organization_id: orgData.organization_id,
          selected_metrics: preferences.selected_metrics || [],
          lorawan_fields: preferences.lorawan_fields || ['rssi', 'snr'],
          refresh_interval_seconds: preferences.refresh_interval_seconds || 30,
          max_readings_shown: preferences.max_readings_shown || 50,
          is_global_default: true,
        }, {
          onConflict: 'device_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-device-display-preferences', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['device-display-preferences', deviceId] });
      toast.success("Global display preferences saved for all users");
    },
    onError: (error) => {
      console.error('[Global Preferences] Error saving:', error);
      toast.error("Failed to save global preferences. Admin access required.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deviceId) throw new Error('Device ID required');

      const { error } = await supabase
        .from('iot_device_display_preferences')
        .delete()
        .eq('device_id', deviceId)
        .is('user_id', null)
        .eq('is_global_default', true);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-device-display-preferences', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['device-display-preferences', deviceId] });
      toast.success("Global preferences removed");
    },
    onError: (error) => {
      console.error('[Global Preferences] Error deleting:', error);
      toast.error("Failed to remove global preferences");
    }
  });

  return {
    ...query,
    updateGlobalPreferences: updateMutation.mutate,
    deleteGlobalPreferences: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
