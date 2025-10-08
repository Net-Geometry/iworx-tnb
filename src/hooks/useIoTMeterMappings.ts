import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IoTDeviceMeterMapping } from "@/types/iot";
import { toast } from "sonner";

interface UseIoTMeterMappingsFilters {
  device_id?: string;
  meter_id?: string;
}

export const useIoTMeterMappings = (organizationId?: string, filters?: UseIoTMeterMappingsFilters) => {
  return useQuery({
    queryKey: ['iot-meter-mappings', organizationId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.device_id) params.append('device_id', filters.device_id);
      if (filters?.meter_id) params.append('meter_id', filters.meter_id);

      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/meter-mappings${params.toString() ? `?${params.toString()}` : ''}`,
          method: 'GET'
        }
      });

      if (error) throw error;
      return data as IoTDeviceMeterMapping[];
    },
    enabled: !!organizationId,
  });
};

export const useCreateIoTMeterMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mappingData: Partial<IoTDeviceMeterMapping>) => {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: '/api/iot/meter-mappings',
          method: 'POST',
          body: mappingData
        }
      });

      if (error) throw error;
      return data as IoTDeviceMeterMapping;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iot-meter-mappings'] });
      toast.success('Meter mapping created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create meter mapping: ${error.message}`);
    }
  });
};

export const useUpdateIoTMeterMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...mappingData }: Partial<IoTDeviceMeterMapping> & { id: string }) => {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/meter-mappings/${id}`,
          method: 'PUT',
          body: mappingData
        }
      });

      if (error) throw error;
      return data as IoTDeviceMeterMapping;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iot-meter-mappings'] });
      toast.success('Meter mapping updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update meter mapping: ${error.message}`);
    }
  });
};

export const useDeleteIoTMeterMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mappingId: string) => {
      const { error } = await supabase.functions.invoke('api-gateway', {
        body: {
          path: `/api/iot/meter-mappings/${mappingId}`,
          method: 'DELETE'
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iot-meter-mappings'] });
      toast.success('Meter mapping deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete meter mapping: ${error.message}`);
    }
  });
};
