import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { IoTDeviceWithType } from '@/types/condition-monitoring';

/**
 * Hook to fetch IoT devices for a specific asset
 * Includes device type information with sensor schema
 */
export const useIoTDevicesByAsset = (assetId?: string) => {
  return useQuery({
    queryKey: ['iot-devices-by-asset', assetId],
    queryFn: async (): Promise<IoTDeviceWithType[]> => {
      if (!assetId) return [];

      const { data, error } = await supabase
        .from('iot_devices')
        .select(`
          id,
          device_name,
          status,
          device_type:iot_device_types(
            id,
            name,
            sensor_schema
          )
        `)
        .eq('asset_id', assetId)
        .eq('status', 'active');

      if (error) {
        console.error('[useIoTDevicesByAsset] Error:', error);
        throw error;
      }

      return (data || []) as IoTDeviceWithType[];
    },
    enabled: !!assetId,
    staleTime: 30000, // Cache for 30 seconds
  });
};
