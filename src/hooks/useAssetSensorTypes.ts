import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to fetch available sensor types for a specific asset
 * Returns unique sensor_type values from asset_sensor_readings
 */
export const useAssetSensorTypes = (assetId: string | null) => {
  return useQuery({
    queryKey: ["asset-sensor-types", assetId],
    queryFn: async () => {
      if (!assetId) return [];

      const { data, error } = await supabase
        .from("asset_sensor_readings")
        .select("sensor_type")
        .eq("asset_id", assetId)
        .order("sensor_type");

      if (error) throw error;

      // Get unique sensor types
      const uniqueTypes = [...new Set(data.map(item => item.sensor_type))];
      return uniqueTypes;
    },
    enabled: !!assetId,
  });
};
