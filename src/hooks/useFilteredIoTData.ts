import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IoTData } from "@/types/iot";

interface FilteredIoTDataParams {
  deviceId?: string;
  selectedMetrics?: string[];
  lorawanFields?: string[];
  limit?: number;
}

interface LoRaWANMetadata {
  rssi?: number;
  snr?: number;
  spreading_factor?: number;
  gateway_id?: string;
  gateway_location?: { lat: number; lon: number };
  [key: string]: any;
}

interface TransformedIoTData extends Omit<IoTData, 'lorawan_metadata'> {
  lorawan_metadata?: LoRaWANMetadata;
  rssi?: number;
  snr?: number;
  spreading_factor?: number;
  gateway_id?: string;
  gateway_location?: { lat: number; lon: number };
}

export const useFilteredIoTData = ({
  deviceId,
  selectedMetrics = [],
  lorawanFields = [],
  limit = 50
}: FilteredIoTDataParams) => {
  return useQuery({
    queryKey: ['filtered-iot-data', deviceId, selectedMetrics, lorawanFields, limit],
    queryFn: async () => {
      if (!deviceId) return [];

      // Fetch IoT data
      let query = supabase
        .from('iot_data')
        .select('*')
        .eq('device_id', deviceId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      // Filter by selected metrics if any
      if (selectedMetrics.length > 0) {
        query = query.in('metric_name', selectedMetrics);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include lorawan_metadata fields as top-level properties
      const transformedData: TransformedIoTData[] = data.map((reading) => {
        const transformed: TransformedIoTData = {
          ...reading,
          lorawan_metadata: reading.lorawan_metadata as LoRaWANMetadata
        };

        // Extract selected LoRaWAN fields
        const metadata = reading.lorawan_metadata as LoRaWANMetadata;
        if (metadata && typeof metadata === 'object' && lorawanFields.length > 0) {
          lorawanFields.forEach((field) => {
            if (field === 'rssi' && metadata.rssi !== undefined) {
              transformed.rssi = metadata.rssi;
            } else if (field === 'snr' && metadata.snr !== undefined) {
              transformed.snr = metadata.snr;
            } else if (field === 'spreading_factor' && metadata.spreading_factor !== undefined) {
              transformed.spreading_factor = metadata.spreading_factor;
            } else if (field === 'gateway_id' && metadata.gateway_id !== undefined) {
              transformed.gateway_id = metadata.gateway_id;
            } else if (field === 'gateway_location' && metadata.gateway_location !== undefined) {
              transformed.gateway_location = metadata.gateway_location;
            }
          });
        }

        return transformed;
      });

      return transformedData;
    },
    enabled: !!deviceId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
