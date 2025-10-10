/**
 * Hook to update IoT device sensor positions in 3D space
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SensorPosition3D {
  x: number;
  y: number;
  z: number;
  label?: string;
  color?: string;
}

interface UpdateSensorPositionParams {
  deviceId: string;
  position: SensorPosition3D | null;
}

export const useUpdateSensorPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deviceId, position }: UpdateSensorPositionParams) => {
      const { data, error } = await supabase
        .from('iot_devices')
        .update({ sensor_position_3d: position as any })
        .eq('id', deviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-sensor-positions'] });
      queryClient.invalidateQueries({ queryKey: ['iot-devices'] });
      toast.success('Sensor position updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update sensor position: ${error.message}`);
    }
  });
};
