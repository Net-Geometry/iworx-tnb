import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDeviceMetrics = (deviceId?: string) => {
  return useQuery({
    queryKey: ['device-metrics', deviceId],
    queryFn: async () => {
      if (!deviceId) return [];

      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/devices/${deviceId}/metrics`,
          method: 'GET'
        }
      });

      if (error) throw error;
      return data as string[];
    },
    enabled: !!deviceId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
