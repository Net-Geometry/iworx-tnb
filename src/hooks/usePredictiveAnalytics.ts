/**
 * Hook: usePredictiveAnalytics
 * 
 * Combined hook that aggregates all predictive analytics data
 * Provides summary statistics and trends
 */

import { useMLPredictions } from "./useMLPredictions";
import { useAnomalyDetections } from "./useAnomalyDetections";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export const usePredictiveAnalytics = () => {
  const { currentOrganization } = useAuth();
  const queryClient = useQueryClient();
  const { predictions, riskStats, isLoading: predictionsLoading } = useMLPredictions();
  const { anomalies, isLoading: anomaliesLoading } = useAnomalyDetections('active');

  // Fetch AI-prioritized work orders via API Gateway
  const { data: aiWorkOrders, isLoading: workOrdersLoading } = useQuery({
    queryKey: ['ai-work-orders', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session');
        return [];
      }

      // Route through API Gateway which handles authentication and forwards to work-order-service
      const functionUrl = `https://jsqzkaarpfowgmijcwaw.supabase.co/functions/v1/api-gateway/api/work-orders/prioritized`;
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTE2NjEsImV4cCI6MjA3NDY4NzY2MX0.Wmx2DQY5sNMlzMqnkTAftfdkIUFkm_w577fy-4nPXWY',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching AI work orders:', response.status, errorText);
        return [];
      }

      const data = await response.json();

      // Map work order fields to component expectations
      const mappedData = (data || []).map((wo: any) => ({
        ...wo,
        priority_score: wo.ai_priority_score,
        failure_risk: wo.predicted_failure_risk,
        ml_recommended: wo.ai_priority_score >= 70 // High priority threshold
      }));
      
      return mappedData;
    },
    enabled: !!currentOrganization?.id,
  });

  // Set up real-time subscription for work_orders (AI priority updates)
  useEffect(() => {
    if (!currentOrganization?.id) return;

    const channel = supabase
      .channel('work-orders-ai-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'workorder_service',
          table: 'work_orders',
          filter: `organization_id=eq.${currentOrganization.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ai-work-orders', currentOrganization.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrganization?.id, queryClient]);

  // Calculate overall health statistics
  const overallHealth = {
    averageHealthScore: predictions.length > 0
      ? predictions.reduce((sum, p) => sum + (p.health_score || 0), 0) / predictions.length
      : 0,
    assetsAtRisk: predictions.filter(p => p.health_score && p.health_score < 70).length,
    activeAnomalies: anomalies.length,
    criticalAnomalies: anomalies.filter(a => a.severity === 'critical').length,
    highPriorityWorkOrders: Array.isArray(aiWorkOrders) ? aiWorkOrders.length : 0,
    mlRecommendedActions: 0,
  };

  // Failure risk trends (30/60/90 day outlook)
  const failureRiskTrends = {
    next30Days: {
      highRisk: predictions.filter(p => p.failure_probability_30d && p.failure_probability_30d >= 70).length,
      mediumRisk: predictions.filter(p => p.failure_probability_30d && p.failure_probability_30d >= 40 && p.failure_probability_30d < 70).length,
      lowRisk: predictions.filter(p => p.failure_probability_30d && p.failure_probability_30d < 40).length,
    },
    next60Days: {
      highRisk: predictions.filter(p => p.failure_probability_60d && p.failure_probability_60d >= 70).length,
      mediumRisk: predictions.filter(p => p.failure_probability_60d && p.failure_probability_60d >= 40 && p.failure_probability_60d < 70).length,
      lowRisk: predictions.filter(p => p.failure_probability_60d && p.failure_probability_60d < 40).length,
    },
    next90Days: {
      highRisk: predictions.filter(p => p.failure_probability_90d && p.failure_probability_90d >= 70).length,
      mediumRisk: predictions.filter(p => p.failure_probability_90d && p.failure_probability_90d >= 40 && p.failure_probability_90d < 70).length,
      lowRisk: predictions.filter(p => p.failure_probability_90d && p.failure_probability_90d < 40).length,
    },
  };

  // Anomaly trends by type
  const anomalyTrends = anomalies.reduce((acc, anomaly) => {
    acc[anomaly.anomaly_type] = (acc[anomaly.anomaly_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    predictions,
    anomalies,
    aiWorkOrders: aiWorkOrders || [],
    riskStats,
    overallHealth,
    failureRiskTrends,
    anomalyTrends,
    isLoading: predictionsLoading || anomaliesLoading || workOrdersLoading,
  };
};