import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://jsqzkaarpfowgmijcwaw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTE2NjEsImV4cCI6MjA3NDY4NzY2MX0.Wmx2DQY5sNMlzMqnkTAftfdkIUFkm_w577fy-4nPXWY";

export const useAssetIoTDevices = (assetId?: string) => {
  return useQuery({
    queryKey: ['asset-iot-devices', assetId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = `${SUPABASE_URL}/functions/v1/iot-service/devices?asset_id=${assetId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.statusText}`);
      }

      return await response.json();
    },
    enabled: !!assetId,
  });
};
