/**
 * Fallback hook to fetch sensor types from device type schema
 * Used when asset_sensor_readings hasn't received all sensor types yet
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDeviceSensorSchema = (assetId: string | null) => {
  return useQuery({
    queryKey: ["device-sensor-schema", assetId],
    queryFn: async () => {
      if (!assetId) return [];

      console.log('[useDeviceSensorSchema] Fetching sensor schema for asset:', assetId);

      // Get the device associated with this asset
      const { data: devices, error: devError } = await supabase
        .from("iot_devices")
        .select(`
          id,
          device_type:iot_device_types(sensor_schema)
        `)
        .eq("asset_id", assetId)
        .limit(1)
        .maybeSingle();

      if (devError) {
        console.error('[useDeviceSensorSchema] Error:', devError);
        return [];
      }

      if (!devices?.device_type) {
        console.log('[useDeviceSensorSchema] No device type found');
        return [];
      }

      // Extract sensor types from schema
      const schema = devices.device_type.sensor_schema as any;
      if (schema && schema.measures) {
        const sensorTypes = Object.keys(schema.measures);
        console.log('[useDeviceSensorSchema] Found sensor types from schema:', sensorTypes);
        return sensorTypes;
      }

      return [];
    },
    enabled: !!assetId,
    staleTime: 60000, // Cache schema for 60 seconds (changes rarely)
  });
};
