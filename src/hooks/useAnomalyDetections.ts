/**
 * Hook: useAnomalyDetections
 * 
 * Manages anomaly detection data with real-time subscriptions
 * Provides methods to acknowledge and resolve anomalies
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

export interface AnomalyDetection {
  id: string;
  organization_id: string;
  asset_id: string;
  meter_group_id?: string;
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  anomaly_score: number;
  description: string;
  detected_values?: any;
  expected_range?: any;
  status: 'active' | 'acknowledged' | 'resolved' | 'false_positive';
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  detected_at: string;
  created_at: string;
  updated_at: string;
  assets?: {
    name: string;
    asset_number: string;
  };
}

export const useAnomalyDetections = (status?: 'active' | 'acknowledged' | 'resolved') => {
  const { currentOrganization } = useAuth();
  const queryClient = useQueryClient();

  // Fetch anomalies
  const { data: anomalies, isLoading, error } = useQuery({
    queryKey: ['anomaly-detections', currentOrganization?.id, status],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('anomaly_detections')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('detected_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AnomalyDetection[];
    },
    enabled: !!currentOrganization?.id,
  });

  // Real-time subscription
  useEffect(() => {
    if (!currentOrganization?.id) return;

    const channel = supabase
      .channel('anomaly-detections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'anomaly_detections',
          filter: `organization_id=eq.${currentOrganization.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['anomaly-detections'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrganization?.id, queryClient]);

  // Acknowledge anomaly mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('anomaly_detections')
        .update({
          status: 'acknowledged',
          acknowledged_by: user.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomaly-detections'] });
      toast.success('Anomaly acknowledged');
    },
    onError: (error) => {
      toast.error(`Failed to acknowledge: ${error.message}`);
    },
  });

  // Resolve anomaly mutation
  const resolveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('anomaly_detections')
        .update({
          status: 'resolved',
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomaly-detections'] });
      toast.success('Anomaly resolved');
    },
    onError: (error) => {
      toast.error(`Failed to resolve: ${error.message}`);
    },
  });

  // Mark as false positive
  const markFalsePositiveMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('anomaly_detections')
        .update({ status: 'false_positive' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomaly-detections'] });
      toast.success('Marked as false positive');
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  return {
    anomalies: anomalies || [],
    isLoading,
    error,
    acknowledgeAnomaly: acknowledgeMutation.mutate,
    resolveAnomaly: resolveMutation.mutate,
    markFalsePositive: markFalsePositiveMutation.mutate,
    isAcknowledging: acknowledgeMutation.isPending,
    isResolving: resolveMutation.isPending,
  };
};