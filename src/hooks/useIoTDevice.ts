import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IoTDevice, IoTData } from "@/types/iot";

const SUPABASE_URL = "https://jsqzkaarpfowgmijcwaw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTE2NjEsImV4cCI6MjA3NDY4NzY2MX0.Wmx2DQY5sNMlzMqnkTAftfdkIUFkm_w577fy-4nPXWY";

export const useIoTDevice = (deviceId?: string) => {
  return useQuery({
    queryKey: ['iot-device', deviceId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = `${SUPABASE_URL}/functions/v1/iot-service/devices/${deviceId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch device: ${response.statusText}`);
      }

      return await response.json();
    },
    enabled: !!deviceId,
  });
};

export const useIoTDeviceData = (deviceId?: string, limit = 100) => {
  return useQuery({
    queryKey: ['iot-device-data', deviceId, limit],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = `${SUPABASE_URL}/functions/v1/iot-service/devices/${deviceId}/data?limit=${limit}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch device data: ${response.statusText}`);
      }

      return await response.json();
    },
    enabled: !!deviceId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useIoTDeviceHealth = (deviceId?: string) => {
  return useQuery({
    queryKey: ['iot-device-health', deviceId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = `${SUPABASE_URL}/functions/v1/iot-service/devices/${deviceId}/health`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch device health: ${response.statusText}`);
      }

      return await response.json();
    },
    enabled: !!deviceId,
    refetchInterval: 60000, // Refresh every minute
  });
};
