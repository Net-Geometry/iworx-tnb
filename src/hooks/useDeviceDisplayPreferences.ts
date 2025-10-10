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
  is_global_default?: boolean;
  created_at?: string;
  updated_at?: string;
  _source?: 'user' | 'global' | 'device_type' | 'system';
}

export const useDeviceDisplayPreferences = (deviceId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['device-display-preferences', deviceId],
    queryFn: async () => {
      if (!deviceId) return null;

      try {
        // Get current user
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        // Priority 1: Check user's personal preference
        const { data: userPref } = await supabase
          .from('iot_device_display_preferences')
          .select('*')
          .eq('device_id', deviceId)
          .eq('user_id', user.user.id)
          .maybeSingle();

        if (userPref) {
          return { ...userPref, _source: 'user' as const };
        }

        // Priority 2: Check global device preference
        const { data: globalPref } = await supabase
          .from('iot_device_display_preferences')
          .select('*')
          .eq('device_id', deviceId)
          .is('user_id', null)
          .eq('is_global_default', true)
          .maybeSingle();

        if (globalPref) {
          return { ...globalPref, _source: 'global' as const };
        }

        // Priority 3: Check device type's default config
        const { data: device } = await supabase
          .from('iot_devices')
          .select('device_type:iot_device_types(default_display_config)')
          .eq('id', deviceId)
          .single();

        const deviceTypeConfig = (device as any)?.device_type?.default_display_config;
        if (deviceTypeConfig && (deviceTypeConfig.preferred_metrics?.length > 0 || deviceTypeConfig.preferred_lorawan_fields?.length > 0)) {
          return {
            selected_metrics: deviceTypeConfig.preferred_metrics || [],
            lorawan_fields: deviceTypeConfig.preferred_lorawan_fields || ['rssi', 'snr'],
            refresh_interval_seconds: 30,
            max_readings_shown: 50,
            _source: 'device_type' as const
          };
        }

        // Priority 4: System defaults
        return {
          selected_metrics: [],
          lorawan_fields: ['rssi', 'snr'],
          refresh_interval_seconds: 30,
          max_readings_shown: 50,
          _source: 'system' as const
        };
      } catch (error) {
        console.error('[Display Preferences] Error fetching preferences:', error);
        
        // Return system defaults on error
        return {
          selected_metrics: [],
          lorawan_fields: ['rssi', 'snr'],
          refresh_interval_seconds: 30,
          max_readings_shown: 50,
          _source: 'system' as const
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
