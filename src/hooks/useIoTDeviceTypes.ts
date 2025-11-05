import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IoTDeviceType } from "@/types/iot";
import { toast } from "sonner";

const SUPABASE_URL = "https://hpxbcaynhelqktyeoqal.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJjYXluaGVscWt0eWVvcWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzQxMzEsImV4cCI6MjA3NjAxMDEzMX0.fKYvL4U0tp2M216dOAPSRyLp-AqdiFyrY6gTDkV0K2M";

export const useIoTDeviceTypes = (organizationId?: string) => {
  return useQuery({
    queryKey: ['iot-device-types', organizationId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/iot-service/device-types`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch device types: ${response.statusText}`);
      }

      return await response.json();
    },
    enabled: !!organizationId,
  });
};

export const useCreateIoTDeviceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (typeData: Partial<IoTDeviceType>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/iot-service/device-types`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(typeData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create device type: ${response.statusText}`);
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iot-device-types'] });
      toast.success('Device type created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create device type: ${error.message}`);
    }
  });
};

export const useUpdateIoTDeviceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...typeData }: Partial<IoTDeviceType> & { id: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/iot-service/device-types/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(typeData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update device type: ${response.statusText}`);
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iot-device-types'] });
      toast.success('Device type updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update device type: ${error.message}`);
    }
  });
};

export const useDeleteIoTDeviceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (typeId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/iot-service/device-types/${typeId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete device type: ${response.statusText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iot-device-types'] });
      toast.success('Device type deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete device type: ${error.message}`);
    }
  });
};
