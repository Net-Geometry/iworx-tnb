/**
 * ML Predictor Service
 * 
 * Generates mock ML predictions for asset health scores and failure probabilities
 * Runs every 10 minutes via cron job
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { createEventBus } from "../_shared/event-bus.ts";
import { getOrCreateCorrelationId, logWithCorrelation } from "../_shared/correlation.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = getOrCreateCorrelationId(req);
  logWithCorrelation(correlationId, 'ml-predictor', 'info', 'Starting ML prediction service');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const eventBus = createEventBus('ml-predictor');

    // Get all organizations
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('is_active', true);

    if (orgError) throw orgError;

    let totalPredictionsGenerated = 0;

    // Process each organization in parallel
    await Promise.all(
      (organizations || []).map(async (org) => {
        try {
          const predictions = await generatePredictionsForOrganization(supabase, org.id);
          
          if (predictions.length > 0) {
            const { error: insertError } = await supabase
              .from('ml_predictions')
              .insert(predictions);

            if (insertError) {
              logWithCorrelation(correlationId, 'ml-predictor', 'error', 
                `Failed to insert predictions for org ${org.id}`, insertError);
            } else {
              totalPredictionsGenerated += predictions.length;
              
              // Publish events for critical health changes
              for (const prediction of predictions) {
                if (prediction.health_score && prediction.health_score < 60) {
                  await eventBus.publish({
                    eventType: 'ASSET_HEALTH_DEGRADED',
                    payload: {
                      predictionId: prediction.id,
                      assetId: prediction.asset_id,
                      healthScore: prediction.health_score,
                      failureProbability30d: prediction.failure_probability_30d,
                    },
                    correlationId,
                  });
                }

                await eventBus.publish({
                  eventType: 'ML_PREDICTION_GENERATED',
                  payload: {
                    predictionId: prediction.id,
                    assetId: prediction.asset_id,
                    predictionType: prediction.prediction_type,
                  },
                  correlationId,
                });
              }
            }
          }
        } catch (err) {
          logWithCorrelation(correlationId, 'ml-predictor', 'error', 
            `Error processing org ${org.id}`, err);
        }
      })
    );

    logWithCorrelation(correlationId, 'ml-predictor', 'info', 
      `ML prediction complete: ${totalPredictionsGenerated} predictions generated`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        predictionsGenerated: totalPredictionsGenerated,
        correlationId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWithCorrelation(correlationId, 'ml-predictor', 'error', 
      'ML prediction failed', error);
    
    return new Response(
      JSON.stringify({ error: errorMessage, correlationId }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Generate ML predictions for all assets in an organization
 */
async function generatePredictionsForOrganization(supabase: any, organizationId: string) {
  const predictions: any[] = [];

  // Get all active assets
  const { data: assets } = await supabase
    .from('assets')
    .select('id, criticality, last_maintenance_date, created_at')
    .eq('organization_id', organizationId)
    .eq('status', 'operational');

  if (!assets || assets.length === 0) return predictions;

  // Get recent anomalies count for each asset
  const { data: anomaliesData } = await supabase
    .from('anomaly_detections')
    .select('asset_id, severity')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .gte('detected_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const anomalyCountByAsset = (anomaliesData || []).reduce((acc: any, a: any) => {
    acc[a.asset_id] = (acc[a.asset_id] || 0) + 1;
    return acc;
  }, {});

  // Generate predictions for each asset
  for (const asset of assets) {
    const prediction = generateHealthPrediction(asset, anomalyCountByAsset[asset.id] || 0, organizationId);
    predictions.push(prediction);
  }

  return predictions;
}

/**
 * Generate health score and failure probability predictions
 */
function generateHealthPrediction(asset: any, anomalyCount: number, orgId: string) {
  // Calculate days since last maintenance
  const daysSinceLastMaintenance = asset.last_maintenance_date
    ? Math.floor((Date.now() - new Date(asset.last_maintenance_date).getTime()) / (1000 * 60 * 60 * 24))
    : 365; // Default to 1 year if no maintenance history

  // Calculate asset age
  const assetAgeDays = Math.floor((Date.now() - new Date(asset.created_at).getTime()) / (1000 * 60 * 60 * 24));

  // Base health score (100 - degradation factors)
  let healthScore = 100;

  // Degradation factors
  healthScore -= Math.min(30, daysSinceLastMaintenance / 10); // Max -30 for maintenance delay
  healthScore -= Math.min(20, anomalyCount * 3); // -3 per anomaly, max -20
  healthScore -= Math.min(15, assetAgeDays / 100); // Age degradation

  // Criticality adjustment
  const criticalityScores: Record<string, number> = {
    'critical': 10,
    'high': 5,
    'medium': 0,
    'low': -5,
  };
  const criticalityPenalty = criticalityScores[asset.criticality || 'medium'] || 0;
  
  healthScore -= criticalityPenalty;
  healthScore = Math.max(0, Math.min(100, healthScore));

  // Calculate failure probabilities (inversely proportional to health)
  const baseFailureRisk = (100 - healthScore) / 100;
  
  const failure30d = Math.min(100, baseFailureRisk * 30 + Math.random() * 10);
  const failure60d = Math.min(100, baseFailureRisk * 50 + Math.random() * 15);
  const failure90d = Math.min(100, baseFailureRisk * 70 + Math.random() * 20);

  // Calculate remaining useful life (RUL)
  const remainingUsefulLife = Math.floor(
    (healthScore / 100) * 365 * 2 // 2 years max RUL at 100% health
  );

  // Determine model and confidence
  const models = ['Random Forest', 'LSTM', 'Gradient Boosting', 'Ensemble'];
  const modelType = models[Math.floor(Math.random() * models.length)];
  
  // Confidence is higher when we have more data (anomaly history, maintenance records)
  const dataQuality = Math.min(100, 
    (anomalyCount > 0 ? 30 : 0) + 
    (asset.last_maintenance_date ? 40 : 20) +
    (assetAgeDays > 30 ? 30 : 15)
  );
  const confidenceScore = 0.7 + (dataQuality / 100) * 0.29; // 70-99% confidence

  return {
    organization_id: orgId,
    asset_id: asset.id,
    prediction_type: 'health_degradation',
    health_score: Math.round(healthScore),
    failure_probability_30d: Math.round(failure30d),
    failure_probability_60d: Math.round(failure60d),
    failure_probability_90d: Math.round(failure90d),
    remaining_useful_life_days: remainingUsefulLife,
    predicted_failure_date: remainingUsefulLife < 180 
      ? new Date(Date.now() + remainingUsefulLife * 24 * 60 * 60 * 1000).toISOString()
      : null,
    model_version: 'v1.2.3',
    model_type: modelType,
    confidence_score: parseFloat(confidenceScore.toFixed(2)),
    contributing_factors: {
      daysSinceLastMaintenance,
      anomalyCount,
      assetAgeDays,
      criticality: asset.criticality,
    },
    feature_importance: {
      maintenance_history: 0.35,
      anomaly_frequency: 0.25,
      asset_age: 0.20,
      criticality: 0.15,
      operating_conditions: 0.05,
    },
    training_data_period: {
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
    predicted_at: new Date().toISOString(),
    valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Valid for 24 hours
  };
}
