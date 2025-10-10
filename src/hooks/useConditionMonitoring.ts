import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conditionMonitoringApi } from '@/services/api-client';
import { toast } from 'sonner';

interface MonitoredAsset {
  total_monitored_assets?: number;
  critical_conditions?: number;
  warning_conditions?: number;
  healthy_assets?: number;
  avg_update_rate?: string;
}

export const useMonitoredAssets = (filters?: { status?: string; asset_type?: string }) => {
  return useQuery({
    queryKey: ['monitored-assets', filters],
    queryFn: () => conditionMonitoringApi.getMonitoredAssets(filters),
    refetchInterval: 30000,
  });
};

export const useAssetConditionStatus = (assetId?: string) => {
  return useQuery({
    queryKey: ['asset-condition-status', assetId],
    queryFn: () => conditionMonitoringApi.getAssetConditionStatus(assetId!),
    enabled: !!assetId,
    refetchInterval: 15000,
  });
};

export const useConditionThresholds = (filters?: { asset_id?: string; device_id?: string }) => {
  return useQuery({
    queryKey: ['condition-thresholds', filters],
    queryFn: () => conditionMonitoringApi.getThresholds(filters),
  });
};

export const useCreateThreshold = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: conditionMonitoringApi.createThreshold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condition-thresholds'] });
      toast.success('Threshold created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create threshold: ${error.message}`);
    },
  });
};

export const useUpdateThreshold = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      conditionMonitoringApi.updateThreshold(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condition-thresholds'] });
      toast.success('Threshold updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update threshold: ${error.message}`);
    },
  });
};

export const useDeleteThreshold = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => conditionMonitoringApi.deleteThreshold(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condition-thresholds'] });
      toast.success('Threshold deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete threshold: ${error.message}`);
    },
  });
};

export const useConditionAlarms = (filters?: { 
  status?: string; 
  alarm_type?: string; 
  asset_id?: string 
}) => {
  return useQuery({
    queryKey: ['condition-alarms', filters],
    queryFn: () => conditionMonitoringApi.getAlarms(filters),
    refetchInterval: 10000,
  });
};

export const useAcknowledgeAlarm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ alarmId, notes }: { alarmId: string; notes?: string }) =>
      conditionMonitoringApi.acknowledgeAlarm(alarmId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condition-alarms'] });
      queryClient.invalidateQueries({ queryKey: ['monitored-assets'] });
      toast.success('Alarm acknowledged');
    },
    onError: (error: Error) => {
      toast.error(`Failed to acknowledge alarm: ${error.message}`);
    },
  });
};

export const useCreateWorkOrderFromAlarm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ alarmId, workOrderData }: { alarmId: string; workOrderData?: any }) =>
      conditionMonitoringApi.createWorkOrderFromAlarm(alarmId, workOrderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condition-alarms'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success('Corrective work order created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create work order: ${error.message}`);
    },
  });
};

export const useResolveAlarm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ alarmId, notes }: { alarmId: string; notes?: string }) =>
      conditionMonitoringApi.resolveAlarm(alarmId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condition-alarms'] });
      queryClient.invalidateQueries({ queryKey: ['monitored-assets'] });
      toast.success('Alarm resolved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resolve alarm: ${error.message}`);
    },
  });
};

export const useConditionKPIs = () => {
  return useQuery<MonitoredAsset>({
    queryKey: ['condition-kpis'],
    queryFn: conditionMonitoringApi.getKPIs,
    refetchInterval: 30000,
  });
};
