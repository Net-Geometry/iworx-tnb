import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IoTDevice, IoTData } from "@/types/iot";

export const useIoTDevice = (deviceId?: string) => {
  return useQuery({
    queryKey: ['iot-device', deviceId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/devices/${deviceId}`,
          method: 'GET'
        }
      });

      if (error) throw error;
      return data as IoTDevice;
    },
    enabled: !!deviceId,
  });
};

export const useIoTDeviceData = (deviceId?: string, limit = 100) => {
  return useQuery({
    queryKey: ['iot-device-data', deviceId, limit],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/devices/${deviceId}/data?limit=${limit}`,
          method: 'GET'
        }
      });

      if (error) throw error;
      return data as IoTData[];
    },
    enabled: !!deviceId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useIoTDeviceHealth = (deviceId?: string) => {
  return useQuery({
    queryKey: ['iot-device-health', deviceId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/devices/${deviceId}/health`,
          method: 'GET'
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!deviceId,
    refetchInterval: 60000, // Refresh every minute
  });
};
