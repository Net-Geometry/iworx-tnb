import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SensorPosition, SensorPosition3D } from "@/types/sensor-positions";
import { getSensorColor } from "@/lib/sensorColors";

/**
 * Hook to fetch sensor positions for a given asset
 * 
 * Fetches from:
 * 1. IoT devices with sensor_position_3d configured
 * 2. Asset's sensor_layout_config (fallback for manual configuration)
 */
export const useAssetSensorPositions = (assetId: string | null) => {
  return useQuery({
    queryKey: ["asset-sensor-positions", assetId],
    queryFn: async (): Promise<SensorPosition[]> => {
      if (!assetId) return [];

      // Fetch IoT devices with positions for this asset
      const { data: devices, error: devicesError } = await supabase
        .from("iot_devices")
        .select("id, device_name, device_type_id, sensor_position_3d, status")
        .eq("asset_id", assetId);

      if (devicesError) {
        console.error("Error fetching sensor positions:", devicesError);
        throw devicesError;
      }

      // Fetch device types to get sensor schema
      const deviceTypeIds = devices
        ?.map(d => d.device_type_id)
        .filter(Boolean) as string[];

      let deviceTypes: any[] = [];
      if (deviceTypeIds.length > 0) {
        const { data: types } = await supabase
          .from("iot_device_types")
          .select("id, name, sensor_schema")
          .in("id", deviceTypeIds);
        
        deviceTypes = types || [];
      }

      const positions: SensorPosition[] = [];

      // Process devices with sensor_position_3d
      devices?.forEach((device) => {
        if (device.sensor_position_3d && typeof device.sensor_position_3d === 'object') {
          const pos = device.sensor_position_3d as any as SensorPosition3D;
          
          // Get sensor type from device type schema
          const deviceType = deviceTypes.find(dt => dt.id === device.device_type_id);
          const sensorTypes = deviceType?.sensor_schema?.measures 
            ? Object.keys(deviceType.sensor_schema.measures)
            : ['unknown'];

          // Create a position entry for the primary sensor type
          const primarySensorType = sensorTypes[0] || 'sensor';
          
          positions.push({
            id: device.id,
            sensorType: primarySensorType,
            label: pos.label || device.device_name || 'Sensor',
            position: [pos.x, pos.y, pos.z],
            deviceId: device.id,
            deviceName: device.device_name,
            isActive: device.status === 'active',
            color: pos.color || getSensorColor(primarySensorType),
          });
        }
      });

      // Note: sensor_layout_config is not yet available in the view
      // This will be used once the database column is properly exposed through the view
      // For now, we only use device-based positioning

      return positions;
    },
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
