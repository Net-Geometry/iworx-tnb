import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IoTDevice } from "@/types/iot";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface UseIoTDevicesFilters {
  asset_id?: string;
  status?: string;
  device_type_id?: string;
}

export const useIoTDevices = (organizationId?: string, filters?: UseIoTDevicesFilters) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['iot-devices', organizationId, filters],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (filters?.asset_id) params.append('asset_id', filters.asset_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.device_type_id) params.append('device_type_id', filters.device_type_id);

      const url = `https://hpxbcaynhelqktyeoqal.supabase.co/functions/v1/iot-service/devices${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJjYXluaGVscWt0eWVvcWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzQxMzEsImV4cCI6MjA3NjAxMDEzMX0.fKYvL4U0tp2M216dOAPSRyLp-AqdiFyrY6gTDkV0K2M',
          'Content-Type': 'application/json',
          'x-organization-id': organizationId || '',
          'x-user-id': user?.id || '',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch devices: ${error}`);
      }

      return await response.json() as IoTDevice[];
    },
    enabled: !!organizationId,
  });
};

export const useCreateIoTDevice = () => {
  const queryClient = useQueryClient();
  const { user, currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (deviceData: Partial<IoTDevice>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = 'https://hpxbcaynhelqktyeoqal.supabase.co/functions/v1/iot-service/devices';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJjYXluaGVscWt0eWVvcWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzQxMzEsImV4cCI6MjA3NjAxMDEzMX0.fKYvL4U0tp2M216dOAPSRyLp-AqdiFyrY6gTDkV0K2M',
          'Content-Type': 'application/json',
          'x-organization-id': currentOrganization?.id || '',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify(deviceData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create device: ${error}`);
      }

      return await response.json() as IoTDevice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iot-devices'] });
      toast.success('IoT device registered successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to register device: ${error.message}`);
    }
  });
};

export const useUpdateIoTDevice = () => {
  const queryClient = useQueryClient();
  const { user, currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...deviceData }: Partial<IoTDevice> & { id: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = `https://hpxbcaynhelqktyeoqal.supabase.co/functions/v1/iot-service/devices/${id}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJjYXluaGVscWt0eWVvcWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzQxMzEsImV4cCI6MjA3NjAxMDEzMX0.fKYvL4U0tp2M216dOAPSRyLp-AqdiFyrY6gTDkV0K2M',
          'Content-Type': 'application/json',
          'x-organization-id': currentOrganization?.id || '',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify(deviceData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update device: ${error}`);
      }

      return await response.json() as IoTDevice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iot-devices'] });
      queryClient.invalidateQueries({ 
        queryKey: ['iot-device'],
        exact: false // Match all queries starting with 'iot-device'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['iot-device-health'],
        exact: false
      });
      toast.success('Device updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update device: ${error.message}`);
    }
  });
};

export const useDeleteIoTDevice = () => {
  const queryClient = useQueryClient();
  const { user, currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = `https://hpxbcaynhelqktyeoqal.supabase.co/functions/v1/iot-service/devices/${deviceId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGJjYXluaGVscWt0eWVvcWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzQxMzEsImV4cCI6MjA3NjAxMDEzMX0.fKYvL4U0tp2M216dOAPSRyLp-AqdiFyrY6gTDkV0K2M',
          'Content-Type': 'application/json',
          'x-organization-id': currentOrganization?.id || '',
          'x-user-id': user?.id || '',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete device: ${error}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iot-devices'] });
      toast.success('Device deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete device: ${error.message}`);
    }
  });
};
