/**
 * Hook: useMLPredictions
 * 
 * Fetches ML predictions for asset health scores and failure probabilities
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MLPrediction {
  id: string;
  organization_id: string;
  asset_id: string;
  prediction_type: string;
  prediction_window_days?: number;
  predicted_failure_date?: string;
  failure_probability_30d?: number;
  failure_probability_60d?: number;
  failure_probability_90d?: number;
  health_score?: number;
  remaining_useful_life_days?: number;
  model_version: string;
  model_type: string;
  confidence_score: number;
  contributing_factors?: any;
  feature_importance?: any;
  training_data_period?: any;
  predicted_at: string;
  valid_until?: string;
  created_at: string;
  assets?: {
    name: string;
    asset_number: string;
  };
}

export const useMLPredictions = (assetId?: string, predictionType?: string) => {
  const { currentOrganization } = useAuth();

  const { data: predictions, isLoading, error } = useQuery({
    queryKey: ['ml-predictions', currentOrganization?.id, assetId, predictionType],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('ml_predictions')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('predicted_at', { ascending: false});

      if (assetId) {
        query = query.eq('asset_id', assetId);
      }

      if (predictionType) {
        query = query.eq('prediction_type', predictionType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MLPrediction[];
    },
    enabled: !!currentOrganization?.id,
  });

  // Get latest predictions grouped by asset
  const latestPredictionsByAsset = predictions?.reduce((acc, prediction) => {
    if (!acc[prediction.asset_id] || 
        new Date(prediction.predicted_at) > new Date(acc[prediction.asset_id].predicted_at)) {
      acc[prediction.asset_id] = prediction;
    }
    return acc;
  }, {} as Record<string, MLPrediction>);

  // Calculate risk statistics
  const riskStats = {
    critical: predictions?.filter(p => p.health_score && p.health_score < 50).length || 0,
    high: predictions?.filter(p => p.health_score && p.health_score >= 50 && p.health_score < 70).length || 0,
    medium: predictions?.filter(p => p.health_score && p.health_score >= 70 && p.health_score < 85).length || 0,
    low: predictions?.filter(p => p.health_score && p.health_score >= 85).length || 0,
  };

  return {
    predictions: predictions || [],
    latestPredictionsByAsset: latestPredictionsByAsset || {},
    riskStats,
    isLoading,
    error,
  };
};