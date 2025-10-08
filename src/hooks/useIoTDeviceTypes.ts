import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IoTDeviceType } from "@/types/iot";
import { toast } from "sonner";

export const useIoTDeviceTypes = (organizationId?: string) => {
  return useQuery({
    queryKey: ['iot-device-types', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: '/api/iot/device-types',
          method: 'GET'
        }
      });

      if (error) throw error;
      return data as IoTDeviceType[];
    },
    enabled: !!organizationId,
  });
};

export const useCreateIoTDeviceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (typeData: Partial<IoTDeviceType>) => {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: '/api/iot/device-types',
          method: 'POST',
          body: typeData
        }
      });

      if (error) throw error;
      return data as IoTDeviceType;
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
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/device-types/${id}`,
          method: 'PUT',
          body: typeData
        }
      });

      if (error) throw error;
      return data as IoTDeviceType;
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
      const { error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/device-types/${typeId}`,
          method: 'DELETE'
        }
      });

      if (error) throw error;
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
