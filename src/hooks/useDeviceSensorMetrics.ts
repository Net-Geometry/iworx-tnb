import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SensorMetric } from '@/types/condition-monitoring';

/**
 * Hook to fetch available sensor metrics from a device's sensor schema
 * Extracts metric information from the device type's sensor_schema
 * If deviceId is provided, fetches from that device
 * If only assetId is provided, fetches from first active device on the asset
 */
export const useDeviceSensorMetrics = (deviceId?: string, assetId?: string) => {
  return useQuery({
    queryKey: ['device-sensor-metrics', deviceId, assetId],
    queryFn: async (): Promise<SensorMetric[]> => {
      let data: any;
      let error: any;

      // Priority 1: If device is specified, use that device
      if (deviceId) {
        const result = await supabase
          .from('iot_devices')
          .select('device_type:iot_device_types(sensor_schema)')
          .eq('id', deviceId)
          .single();
        data = result.data;
        error = result.error;
      } 
      // Priority 2: If no device but asset is specified, fetch from any device on that asset
      else if (assetId) {
        const result = await supabase
          .from('iot_devices')
          .select('device_type:iot_device_types(sensor_schema)')
          .eq('asset_id', assetId)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle();
        data = result.data;
        error = result.error;
      } else {
        return [];
      }

      if (error) {
        console.error('[useDeviceSensorMetrics] Error:', error);
        throw error;
      }

      // Extract metrics from sensor_schema
      const schema = (data?.device_type as any)?.sensor_schema;
      if (!schema || !schema.measures) {
        return [];
      }

      const metrics: SensorMetric[] = Object.entries(schema.measures).map(
        ([name, config]: [string, any]) => ({
          name,
          type: config.type || 'number',
          unit: config.unit || '',
          description: config.description || '',
        })
      );

      return metrics;
    },
    enabled: !!(deviceId || assetId),
    staleTime: 60000, // Cache for 60 seconds (schema changes rarely)
  });
};
