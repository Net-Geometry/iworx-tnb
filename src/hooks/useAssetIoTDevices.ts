import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://hpxbcaynhelqktyeoqal.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJjYXluaGVscWt0eWVvcWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzQxMzEsImV4cCI6MjA3NjAxMDEzMX0.fKYvL4U0tp2M216dOAPSRyLp-AqdiFyrY6gTDkV0K2M";

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
