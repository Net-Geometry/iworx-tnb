/**
 * Work Order AI Prioritizer Service
 * 
 * Calculates AI priority scores for work orders based on multiple risk factors
 * Runs every 15 minutes via cron job
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
  logWithCorrelation(correlationId, 'work-order-ai-prioritizer', 'info', 'Starting work order prioritization');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const eventBus = createEventBus('work-order-ai-prioritizer');

    // Get all organizations
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('is_active', true);

    if (orgError) throw orgError;

    let totalWorkOrdersPrioritized = 0;

    // Process each organization in parallel
    await Promise.all(
      (organizations || []).map(async (org) => {
        try {
          const prioritized = await prioritizeWorkOrdersForOrganization(supabase, org.id, eventBus, correlationId);
          totalWorkOrdersPrioritized += prioritized;
        } catch (err) {
          logWithCorrelation(correlationId, 'work-order-ai-prioritizer', 'error', 
            `Error processing org ${org.id}`, err);
        }
      })
    );

    logWithCorrelation(correlationId, 'work-order-ai-prioritizer', 'info', 
      `Work order prioritization complete: ${totalWorkOrdersPrioritized} work orders prioritized`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        workOrdersPrioritized: totalWorkOrdersPrioritized,
        correlationId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWithCorrelation(correlationId, 'work-order-ai-prioritizer', 'error', 
      'Work order prioritization failed', error);
    
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
 * Prioritize work orders for a specific organization
 */
async function prioritizeWorkOrdersForOrganization(
  supabase: any, 
  organizationId: string,
  eventBus: any,
  correlationId: string
) {
  // Get work orders that need prioritization
  const { data: workOrders } = await supabase
    .from('work_orders')
    .select(`
      id,
      asset_id,
      priority,
      due_date,
      work_order_type,
      status
    `)
    .eq('organization_id', organizationId)
    .in('status', ['pending', 'in_progress', 'on_hold']);

  if (!workOrders || workOrders.length === 0) return 0;

  // Get latest ML predictions for all assets
  const assetIds = [...new Set(workOrders.map((wo: any) => wo.asset_id).filter(Boolean))];
  
  const { data: predictions } = await supabase
    .from('ml_predictions')
    .select('asset_id, health_score, failure_probability_30d, failure_probability_60d')
    .eq('organization_id', organizationId)
    .in('asset_id', assetIds)
    .order('predicted_at', { ascending: false });

  // Get latest predictions by asset
  const predictionsByAsset = (predictions || []).reduce((acc: any, pred: any) => {
    if (!acc[pred.asset_id]) {
      acc[pred.asset_id] = pred;
    }
    return acc;
  }, {});

  // Get active anomalies for assets
  const { data: anomalies } = await supabase
    .from('anomaly_detections')
    .select('asset_id, severity, anomaly_score')
    .eq('organization_id', organizationId)
    .in('asset_id', assetIds)
    .eq('status', 'active')
    .order('anomaly_score', { ascending: false });

  const anomaliesByAsset = (anomalies || []).reduce((acc: any, anom: any) => {
    if (!acc[anom.asset_id]) {
      acc[anom.asset_id] = anom;
    }
    return acc;
  }, {});

  // Get asset criticality
  const { data: assets } = await supabase
    .from('assets')
    .select('id, criticality')
    .eq('organization_id', organizationId)
    .in('id', assetIds);

  const assetsByIdMap = (assets || []).reduce((acc: any, asset: any) => {
    acc[asset.id] = asset;
    return acc;
  }, {});

  // Calculate AI priority for each work order
  let prioritizedCount = 0;
  
  for (const workOrder of workOrders) {
    const prediction = predictionsByAsset[workOrder.asset_id];
    const anomaly = anomaliesByAsset[workOrder.asset_id];
    const asset = assetsByIdMap[workOrder.asset_id];

    const aiPriority = calculateAIPriority(workOrder, prediction, anomaly, asset);

    // Update work order with AI priority
    const { error: updateError } = await supabase
      .from('work_orders')
      .update({
        ai_priority_score: aiPriority.score,
        ai_priority_factors: aiPriority.factors,
        predicted_failure_risk: aiPriority.failureRisk,
        ml_recommended: aiPriority.mlRecommended,
        anomaly_detection_id: anomaly?.id || null,
      })
      .eq('id', workOrder.id);

    if (!updateError) {
      prioritizedCount++;
      
      // Publish event if high priority
      if (aiPriority.score >= 75) {
        await eventBus.publish({
          eventType: 'WORK_ORDER_AI_PRIORITIZED',
          payload: {
            workOrderId: workOrder.id,
            assetId: workOrder.asset_id,
            aiPriorityScore: aiPriority.score,
            mlRecommended: aiPriority.mlRecommended,
          },
          correlationId,
        });
      }
    }
  }

  return prioritizedCount;
}

/**
 * Calculate AI priority score using multi-factor analysis
 */
function calculateAIPriority(workOrder: any, prediction: any, anomaly: any, asset: any) {
  let score = 50; // Base score
  const factors: any = {};

  // Factor 1: Asset Health (30% weight)
  if (prediction?.health_score != null) {
    const healthFactor = (100 - prediction.health_score) * 0.3;
    score += healthFactor;
    factors.assetHealth = {
      weight: 0.3,
      healthScore: prediction.health_score,
      contribution: healthFactor.toFixed(1),
      reasoning: `Asset health at ${prediction.health_score}% - ${
        prediction.health_score < 50 ? 'critical' : 
        prediction.health_score < 70 ? 'poor' : 'fair'
      } condition`,
    };
  }

  // Factor 2: Failure Risk (25% weight)
  if (prediction?.failure_probability_30d != null) {
    const failureRiskFactor = prediction.failure_probability_30d * 0.25;
    score += failureRiskFactor;
    factors.failureRisk = {
      weight: 0.25,
      probability30d: prediction.failure_probability_30d,
      contribution: failureRiskFactor.toFixed(1),
      reasoning: `${prediction.failure_probability_30d.toFixed(0)}% chance of failure in next 30 days`,
    };
  }

  // Factor 3: Asset Criticality (20% weight)
  if (asset?.criticality) {
    const criticalityScores: Record<string, number> = { critical: 20, high: 15, medium: 10, low: 5 };
    const criticalityFactor = criticalityScores[asset.criticality] || 10;
    score += criticalityFactor;
    factors.assetCriticality = {
      weight: 0.2,
      level: asset.criticality,
      contribution: criticalityFactor.toFixed(1),
      reasoning: `Asset has ${asset.criticality} criticality rating`,
    };
  }

  // Factor 4: Anomaly Severity (15% weight)
  if (anomaly) {
    const severityScores: Record<string, number> = { critical: 15, high: 12, medium: 8, low: 4 };
    const anomalyFactor = severityScores[anomaly.severity] || 8;
    score += anomalyFactor;
    factors.anomalySeverity = {
      weight: 0.15,
      severity: anomaly.severity,
      anomalyScore: anomaly.anomaly_score,
      contribution: anomalyFactor.toFixed(1),
      reasoning: `Active ${anomaly.severity} severity anomaly detected`,
    };
  }

  // Factor 5: SLA Urgency (10% weight)
  if (workOrder.due_date) {
    const daysUntilDue = Math.floor(
      (new Date(workOrder.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const urgencyFactor = daysUntilDue < 1 ? 10 : 
                          daysUntilDue < 3 ? 8 : 
                          daysUntilDue < 7 ? 5 : 3;
    score += urgencyFactor;
    factors.slaUrgency = {
      weight: 0.1,
      daysUntilDue,
      contribution: urgencyFactor.toFixed(1),
      reasoning: `Due in ${daysUntilDue} day(s)`,
    };
  }

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  // Determine if ML recommended
  const mlRecommended = score >= 70 && (
    (prediction?.health_score != null && prediction.health_score < 60) ||
    (prediction?.failure_probability_30d != null && prediction.failure_probability_30d > 50) ||
    (anomaly?.severity === 'critical')
  );

  return {
    score: Math.round(score),
    factors,
    failureRisk: prediction?.failure_probability_30d 
      ? `${Math.round(prediction.failure_probability_30d)}%` 
      : null,
    mlRecommended,
  };
}
