import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SUPABASE_URL = "https://jsqzkaarpfowgmijcwaw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTE2NjEsImV4cCI6MjA3NDY4NzY2MX0.Wmx2DQY5sNMlzMqnkTAftfdkIUFkm_w577fy-4nPXWY";

export const useDeviceMetrics = (deviceId?: string) => {
  const { user, currentOrganization } = useAuth();
  
  return useQuery({
    queryKey: ['device-metrics', deviceId, currentOrganization?.id],
    queryFn: async () => {
      if (!deviceId) return [];

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('[useDeviceMetrics] Not authenticated');
        return [];
      }

      if (!currentOrganization?.id) {
        console.error('[useDeviceMetrics] No organization selected');
        return [];
      }

      const url = `${SUPABASE_URL}/functions/v1/iot-service/devices/${deviceId}/metrics`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'x-organization-id': currentOrganization.id,
        },
      });

      if (!response.ok) {
        console.error(`[useDeviceMetrics] Failed to fetch metrics:`, response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      
      // Ensure we always return an array
      if (Array.isArray(data)) {
        return data as string[];
      } else if (data?.error) {
        console.error('[useDeviceMetrics] API returned error:', data.error);
        return [];
      } else {
        console.error('[useDeviceMetrics] Unexpected response format:', data);
        return [];
      }
    },
    enabled: !!deviceId && !!currentOrganization?.id && !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
