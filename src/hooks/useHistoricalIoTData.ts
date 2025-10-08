/**
 * Historical IoT Data Hook
 * 
 * Fetches time-series sensor data for historical analysis
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HistoricalQueryParams {
  assetId: string;
  startTime: Date;
  endTime: Date;
  sensorType?: string;
}

export const useHistoricalIoTData = ({
  assetId,
  startTime,
  endTime,
  sensorType,
}: HistoricalQueryParams) => {
  return useQuery({
    queryKey: ['historical-iot', assetId, startTime.toISOString(), endTime.toISOString(), sensorType],
    queryFn: async () => {
      let query = supabase
        .from('asset_sensor_readings')
        .select('*')
        .eq('asset_id', assetId)
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString())
        .order('timestamp', { ascending: true })
        .limit(1000);

      if (sensorType) {
        query = query.eq('sensor_type', sensorType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching historical IoT data:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!assetId,
  });
};
