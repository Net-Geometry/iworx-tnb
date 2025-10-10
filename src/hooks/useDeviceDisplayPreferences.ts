import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DisplayPreferences {
  id?: string;
  device_id?: string;
  user_id?: string;
  organization_id?: string;
  selected_metrics: string[];
  lorawan_fields: string[];
  refresh_interval_seconds: number;
  max_readings_shown: number;
  created_at?: string;
  updated_at?: string;
}

export const useDeviceDisplayPreferences = (deviceId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['device-display-preferences', deviceId],
    queryFn: async () => {
      if (!deviceId) return null;

      try {
        // Try microservice first
        const { data, error } = await supabase.functions.invoke('api-gateway', {
          body: {
            path: `/api/iot/devices/${deviceId}/display-preferences`,
            method: 'GET'
          }
        });

        if (error) throw error;
        return data as DisplayPreferences;
      } catch (error) {
        console.warn('[Display Preferences] Microservice unavailable, falling back to direct query:', error);
        
        // Fallback to direct Supabase query
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const { data, error: dbError } = await supabase
          .from('iot_device_display_preferences')
          .select('*')
          .eq('device_id', deviceId)
          .eq('user_id', user.user.id)
          .maybeSingle();

        if (dbError) throw dbError;

        // Return defaults if not configured
        return data || {
          selected_metrics: [],
          lorawan_fields: ['rssi', 'snr'],
          refresh_interval_seconds: 30,
          max_readings_shown: 50
        };
      }
    },
    enabled: !!deviceId,
  });

  const updateMutation = useMutation({
    mutationFn: async (preferences: Partial<DisplayPreferences>) => {
      if (!deviceId) throw new Error('Device ID required');

      try {
        // Try microservice first
        const { data, error } = await supabase.functions.invoke('api-gateway', {
          body: {
            path: `/api/iot/devices/${deviceId}/display-preferences`,
            method: 'PUT',
            body: preferences
          }
        });

        if (error) throw error;
        return data;
      } catch (error) {
        console.warn('[Display Preferences] Microservice unavailable, falling back to direct update:', error);
        
        // Fallback to direct Supabase update
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const { data: orgData } = await supabase
          .from('user_organizations')
          .select('organization_id')
          .eq('user_id', user.user.id)
          .single();

        if (!orgData) throw new Error('Organization not found');

        const { data, error: dbError } = await supabase
          .from('iot_device_display_preferences')
          .upsert({
            device_id: deviceId,
            user_id: user.user.id,
            organization_id: orgData.organization_id,
            selected_metrics: preferences.selected_metrics || [],
            lorawan_fields: preferences.lorawan_fields || ['rssi', 'snr'],
            refresh_interval_seconds: preferences.refresh_interval_seconds || 30,
            max_readings_shown: preferences.max_readings_shown || 50,
          })
          .select()
          .single();

        if (dbError) throw dbError;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-display-preferences', deviceId] });
      toast.success("Display preferences saved");
    },
    onError: (error) => {
      console.error('[Display Preferences] Error saving:', error);
      toast.error("Failed to save display preferences");
    }
  });

  return {
    ...query,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};
