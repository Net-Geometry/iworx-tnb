/**
 * Hook: usePredictiveAnalytics
 * 
 * Combined hook that aggregates all predictive analytics data
 * Provides summary statistics and trends
 */

import { useMLPredictions } from "./useMLPredictions";
import { useAnomalyDetections } from "./useAnomalyDetections";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePredictiveAnalytics = () => {
  const { currentOrganization } = useAuth();
  const { predictions, riskStats, isLoading: predictionsLoading } = useMLPredictions();
  const { anomalies, isLoading: anomaliesLoading } = useAnomalyDetections('active');

  // Fetch AI-prioritized work orders (simplified - direct query removed due to type constraints)
  const { data: aiWorkOrders, isLoading: workOrdersLoading } = useQuery({
    queryKey: ['ai-work-orders', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      // Placeholder - will be populated when work orders are AI-prioritized
      return [];
    },
    enabled: false, // Disabled until work order types updated
  });

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