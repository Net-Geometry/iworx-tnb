/**
 * Anomaly Detector Service
 * 
 * Automatically detects anomalies in meter readings using statistical analysis
 * Runs every 5 minutes via cron job
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
  logWithCorrelation(correlationId, 'anomaly-detector', 'info', 'Starting anomaly detection service');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const eventBus = createEventBus('anomaly-detector');

    // Get all organizations
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('is_active', true);

    if (orgError) throw orgError;

    let totalAnomaliesDetected = 0;

    // Process each organization in parallel
    await Promise.all(
      (organizations || []).map(async (org) => {
        try {
          const anomalies = await detectAnomaliesForOrganization(supabase, org.id);
          
          // Insert detected anomalies
          if (anomalies.length > 0) {
            const { error: insertError } = await supabase
              .from('anomaly_detections')
              .insert(anomalies);

            if (insertError) {
              logWithCorrelation(correlationId, 'anomaly-detector', 'error', 
                `Failed to insert anomalies for org ${org.id}`, insertError);
            } else {
              totalAnomaliesDetected += anomalies.length;
              
              // Publish events for each anomaly
              for (const anomaly of anomalies) {
                await eventBus.publish({
                  eventType: 'ANOMALY_DETECTED',
                  payload: {
                    anomalyId: anomaly.id,
                    assetId: anomaly.asset_id,
                    meterGroupId: anomaly.meter_group_id,
                    anomalyType: anomaly.anomaly_type,
                    severity: anomaly.severity,
                    anomalyScore: anomaly.anomaly_score,
                  },
                  correlationId,
                });
              }
            }
          }
        } catch (err) {
          logWithCorrelation(correlationId, 'anomaly-detector', 'error', 
            `Error processing org ${org.id}`, err);
        }
      })
    );

    logWithCorrelation(correlationId, 'anomaly-detector', 'info', 
      `Anomaly detection complete: ${totalAnomaliesDetected} anomalies detected`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        anomaliesDetected: totalAnomaliesDetected,
        correlationId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWithCorrelation(correlationId, 'anomaly-detector', 'error', 
      'Anomaly detection failed', error);
    
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
 * Detect anomalies for a specific organization
 */
async function detectAnomaliesForOrganization(supabase: any, organizationId: string) {
  const anomalies: any[] = [];

  // Get all meter groups with recent readings
  const { data: meterGroups } = await supabase
    .from('meter_groups')
    .select(`
      id,
      name,
      asset_meter_groups!inner(asset_id)
    `)
    .eq('organization_id', organizationId)
    .eq('is_active', true);

  if (!meterGroups || meterGroups.length === 0) return anomalies;

  // For each meter group, get recent readings and analyze
  for (const meterGroup of meterGroups) {
    const { data: readings } = await supabase
      .from('test_form_readings')
      .select('value, recorded_at')
      .eq('meter_group_id', meterGroup.id)
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (!readings || readings.length < 5) continue;

    const assetId = meterGroup.asset_meter_groups[0]?.asset_id;
    if (!assetId) continue;

    // Run anomaly detection algorithms
    const detectedAnomalies = [
      ...detectSpikes(readings, meterGroup, assetId, organizationId),
      ...detectDrift(readings, meterGroup, assetId, organizationId),
      ...detectThresholdBreaches(readings, meterGroup, assetId, organizationId),
    ];

    anomalies.push(...detectedAnomalies);
  }

  return anomalies;
}

/**
 * Spike Detection: Z-score analysis
 */
function detectSpikes(readings: any[], meterGroup: any, assetId: string, orgId: string) {
  const values = readings.map(r => parseFloat(r.value)).filter(v => !isNaN(v));
  if (values.length < 5) return [];

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
  );

  const anomalies = [];
  const recentValues = values.slice(0, 5);

  for (const value of recentValues) {
    const zScore = Math.abs((value - mean) / stdDev);
    
    if (zScore > 3) {
      const anomalyScore = Math.min(100, 50 + (zScore - 3) * 10);
      
      anomalies.push({
        organization_id: orgId,
        asset_id: assetId,
        meter_group_id: meterGroup.id,
        anomaly_type: 'spike',
        anomaly_score: anomalyScore,
        severity: anomalyScore > 80 ? 'critical' : anomalyScore > 60 ? 'high' : 'medium',
        description: `Unusual spike detected in ${meterGroup.name}`,
        detected_values: { current: value, mean, stdDev, zScore },
        expected_range: { min: mean - 2 * stdDev, max: mean + 2 * stdDev },
        status: 'active',
      });
    }
  }

  return anomalies;
}

/**
 * Drift Detection: Moving average comparison
 */
function detectDrift(readings: any[], meterGroup: any, assetId: string, orgId: string) {
  const values = readings.map(r => parseFloat(r.value)).filter(v => !isNaN(v));
  if (values.length < 30) return [];

  const recent7 = values.slice(0, 7);
  const baseline30 = values.slice(7, 37);

  const avg7 = recent7.reduce((a, b) => a + b, 0) / recent7.length;
  const avg30 = baseline30.reduce((a, b) => a + b, 0) / baseline30.length;

  const driftPercent = Math.abs((avg7 - avg30) / avg30) * 100;

  if (driftPercent > 15) {
    const anomalyScore = Math.min(100, 40 + driftPercent);
    
    return [{
      organization_id: orgId,
      asset_id: assetId,
      meter_group_id: meterGroup.id,
      anomaly_type: 'drift',
      anomaly_score: anomalyScore,
      severity: anomalyScore > 70 ? 'high' : 'medium',
      description: `Gradual drift detected in ${meterGroup.name}`,
      detected_values: { recent7Avg: avg7, baseline30Avg: avg30, driftPercent },
      expected_range: { baseline: avg30 },
      status: 'active',
    }];
  }

  return [];
}

/**
 * Threshold Breach Detection
 */
function detectThresholdBreaches(readings: any[], meterGroup: any, assetId: string, orgId: string) {
  const values = readings.map(r => parseFloat(r.value)).filter(v => !isNaN(v));
  if (values.length === 0) return [];

  // Calculate dynamic thresholds (can be replaced with configured thresholds)
  const sortedValues = [...values].sort((a, b) => a - b);
  const minThreshold = sortedValues[Math.floor(values.length * 0.05)];
  const maxThreshold = sortedValues[Math.floor(values.length * 0.95)];

  const anomalies = [];
  const recentValues = values.slice(0, 3);

  for (const value of recentValues) {
    if (value < minThreshold || value > maxThreshold) {
      const anomalyScore = value < minThreshold 
        ? Math.min(100, 60 + Math.abs((value - minThreshold) / minThreshold) * 40)
        : Math.min(100, 60 + Math.abs((value - maxThreshold) / maxThreshold) * 40);

      anomalies.push({
        organization_id: orgId,
        asset_id: assetId,
        meter_group_id: meterGroup.id,
        anomaly_type: 'threshold_breach',
        anomaly_score: anomalyScore,
        severity: anomalyScore > 75 ? 'critical' : 'high',
        description: `Threshold breach in ${meterGroup.name}`,
        detected_values: { current: value },
        expected_range: { min: minThreshold, max: maxThreshold },
        status: 'active',
      });
    }
  }

  return anomalies;
}
