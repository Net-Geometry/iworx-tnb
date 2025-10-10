import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SensorMetric } from '@/types/condition-monitoring';

/**
 * Hook to fetch available sensor metrics from a device's sensor schema
 * Extracts metric information from the device type's sensor_schema
 */
export const useDeviceSensorMetrics = (deviceId?: string) => {
  return useQuery({
    queryKey: ['device-sensor-metrics', deviceId],
    queryFn: async (): Promise<SensorMetric[]> => {
      if (!deviceId) return [];

      const { data, error } = await supabase
        .from('iot_devices')
        .select('device_type:iot_device_types(sensor_schema)')
        .eq('id', deviceId)
        .single();

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
    enabled: !!deviceId,
    staleTime: 60000, // Cache for 60 seconds (schema changes rarely)
  });
};
