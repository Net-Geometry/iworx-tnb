import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IoTData } from "@/types/iot";
import { toast } from "sonner";

export const useIoTRealtimeData = (deviceId?: string, maxReadings = 100) => {
  const [readings, setReadings] = useState<IoTData[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!deviceId) return;

    // Fetch initial readings - using 'any' cast temporarily until Supabase types regenerate
    const fetchInitialReadings = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('iot_data')
          .select('*')
          .eq('device_id', deviceId)
          .order('timestamp', { ascending: false })
          .limit(maxReadings);

        if (error) {
          console.error('Error fetching initial IoT readings:', error);
          return;
        }

        if (data) {
          setReadings(data as IoTData[]);
        }
      } catch (err) {
        console.error('Error in fetchInitialReadings:', err);
      }
    };

    fetchInitialReadings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('iot-data-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'iot_data',
          filter: `device_id=eq.${deviceId}`
        },
        (payload) => {
          const newReading = payload.new as IoTData;
          
          setReadings((prev) => {
            const updated = [newReading, ...prev].slice(0, maxReadings);
            return updated;
          });

          // Show alert toast if threshold exceeded
          if (newReading.lorawan_metadata?.rssi && newReading.lorawan_metadata.rssi < -120) {
            toast.warning(`Weak signal detected from device: RSSI ${newReading.lorawan_metadata.rssi} dBm`);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [deviceId, maxReadings]);

  return { readings, isConnected };
};
