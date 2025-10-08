import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IoTDevice } from "@/types/iot";
import { toast } from "sonner";

interface UseIoTDevicesFilters {
  asset_id?: string;
  status?: string;
  device_type_id?: string;
}

export const useIoTDevices = (organizationId?: string, filters?: UseIoTDevicesFilters) => {
  return useQuery({
    queryKey: ['iot-devices', organizationId, filters],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (filters?.asset_id) params.append('asset_id', filters.asset_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.device_type_id) params.append('device_type_id', filters.device_type_id);

      const url = `https://jsqzkaarpfowgmijcwaw.supabase.co/functions/v1/iot-service/devices${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTE2NjEsImV4cCI6MjA3NDY4NzY2MX0.Wmx2DQY5sNMlzMqnkTAftfdkIUFkm_w577fy-4nPXWY',
          'Content-Type': 'application/json',
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

  return useMutation({
    mutationFn: async (deviceData: Partial<IoTDevice>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = 'https://jsqzkaarpfowgmijcwaw.supabase.co/functions/v1/iot-service/devices';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTE2NjEsImV4cCI6MjA3NDY4NzY2MX0.Wmx2DQY5sNMlzMqnkTAftfdkIUFkm_w577fy-4nPXWY',
          'Content-Type': 'application/json',
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

  return useMutation({
    mutationFn: async ({ id, ...deviceData }: Partial<IoTDevice> & { id: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = `https://jsqzkaarpfowgmijcwaw.supabase.co/functions/v1/iot-service/devices/${id}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTE2NjEsImV4cCI6MjA3NDY4NzY2MX0.Wmx2DQY5sNMlzMqnkTAftfdkIUFkm_w577fy-4nPXWY',
          'Content-Type': 'application/json',
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
      queryClient.invalidateQueries({ queryKey: ['iot-device'] });
      toast.success('Device updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update device: ${error.message}`);
    }
  });
};

export const useDeleteIoTDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = `https://jsqzkaarpfowgmijcwaw.supabase.co/functions/v1/iot-service/devices/${deviceId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTE2NjEsImV4cCI6MjA3NDY4NzY2MX0.Wmx2DQY5sNMlzMqnkTAftfdkIUFkm_w577fy-4nPXWY',
          'Content-Type': 'application/json',
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
