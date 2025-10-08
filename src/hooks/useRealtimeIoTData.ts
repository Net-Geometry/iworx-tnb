/**
 * Realtime IoT Data Hook
 * 
 * Subscribes to live sensor readings from assets using Supabase Realtime
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IoTReading {
  id: string;
  asset_id: string;
  sensor_type: string;
  reading_value: number;
  unit: string;
  timestamp: string;
  alert_threshold_exceeded: boolean;
  metadata?: any;
}

export const useRealtimeIoTData = (assetIds: string[]) => {
  const [readings, setReadings] = useState<Record<string, IoTReading[]>>({});
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (assetIds.length === 0) return;

    // Initial fetch of latest readings
    const fetchInitialReadings = async () => {
      const { data, error } = await supabase
        .from('asset_sensor_readings')
        .select('*')
        .in('asset_id', assetIds)
        .order('timestamp', { ascending: false })
        .limit(10 * assetIds.length);

      if (error) {
        console.error('Error fetching initial IoT readings:', error);
        toast({
          title: 'Error loading sensor data',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        const grouped: Record<string, IoTReading[]> = {};
        data.forEach((reading: any) => {
          if (!grouped[reading.asset_id]) {
            grouped[reading.asset_id] = [];
          }
          if (grouped[reading.asset_id].length < 10) {
            grouped[reading.asset_id].push(reading);
          }
        });
        setReadings(grouped);
      }
    };

    fetchInitialReadings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('iot-readings-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'asset_sensor_readings',
          filter: `asset_id=in.(${assetIds.join(',')})`
        },
        (payload) => {
          const newReading = payload.new as IoTReading;
          
          setReadings((prev) => ({
            ...prev,
            [newReading.asset_id]: [
              newReading,
              ...(prev[newReading.asset_id] || []).slice(0, 9), // Keep last 10 readings
            ]
          }));

          // Show alert if threshold exceeded
          if (newReading.alert_threshold_exceeded) {
            toast({
              title: 'Sensor Alert',
              description: `${newReading.sensor_type} reading exceeded threshold: ${newReading.reading_value} ${newReading.unit}`,
              variant: 'destructive',
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log('IoT Realtime connection status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assetIds.join(','), toast]);

  return { readings, isConnected };
};
