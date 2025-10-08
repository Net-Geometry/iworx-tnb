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
      const params = new URLSearchParams();
      if (filters?.asset_id) params.append('asset_id', filters.asset_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.device_type_id) params.append('device_type_id', filters.device_type_id);

      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/devices${params.toString() ? `?${params.toString()}` : ''}`,
          method: 'GET'
        }
      });

      if (error) throw error;
      return data as IoTDevice[];
    },
    enabled: !!organizationId,
  });
};

export const useCreateIoTDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceData: Partial<IoTDevice>) => {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: '/api/iot/devices',
          method: 'POST',
          body: deviceData
        }
      });

      if (error) throw error;
      return data as IoTDevice;
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
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/devices/${id}`,
          method: 'PUT',
          body: deviceData
        }
      });

      if (error) throw error;
      return data as IoTDevice;
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
      const { error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/devices/${deviceId}`,
          method: 'DELETE'
        }
      });

      if (error) throw error;
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
