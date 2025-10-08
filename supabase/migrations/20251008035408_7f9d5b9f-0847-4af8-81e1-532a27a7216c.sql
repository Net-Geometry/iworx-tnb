-- Sample AI/ML Analytics Data Seeder for MSMS Organization
-- This migration seeds realistic sample data for the Analytics page
-- Includes: anomaly detections, ML predictions, and AI work order priority updates

BEGIN;

-- Get MSMS organization ID
DO $$
DECLARE
  v_org_id uuid;
  v_asset1_id uuid;
  v_asset2_id uuid;
  v_meter_group1_id uuid;
  v_meter_group2_id uuid;
BEGIN
  -- Get MSMS organization
  SELECT id INTO v_org_id FROM organizations WHERE name = 'MSMS' LIMIT 1;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'MSMS organization not found';
  END IF;

  -- Get sample assets
  SELECT id INTO v_asset1_id FROM assets WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1;
  SELECT id INTO v_asset2_id FROM assets WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1 OFFSET 1;
  
  -- Get sample meter groups
  SELECT id INTO v_meter_group1_id FROM meter_groups WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1;
  SELECT id INTO v_meter_group2_id FROM meter_groups WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1 OFFSET 1;

  -- Insert Anomaly Detections (9 records)
  INSERT INTO public.anomaly_detections (organization_id, asset_id, meter_group_id, anomaly_type, severity, status, anomaly_score, detected_values, expected_range, description, detected_at)
  VALUES
    -- High Severity Anomalies
    (v_org_id, v_asset1_id, v_meter_group1_id, 'spike', 'high', 'active', 0.92, '{"temperature": 95.5}', '{"min": 60, "max": 80}', 'Sudden temperature spike detected - 95.5°C (expected: 60-80°C)', now() - interval '2 hours'),
    (v_org_id, v_asset1_id, v_meter_group1_id, 'threshold_breach', 'high', 'active', 0.88, '{"vibration": 12.8}', '{"threshold": 8.0}', 'Vibration levels exceeded threshold - 12.8mm/s (max: 8.0mm/s)', now() - interval '5 hours'),
    (v_org_id, v_asset2_id, v_meter_group2_id, 'pattern_deviation', 'high', 'acknowledged', 0.85, '{"runtime_hours": 22.3}', '{"expected": 8}', 'Runtime pattern deviation - 22.3hrs continuous (expected: 8hrs)', now() - interval '1 day'),
    
    -- Medium Severity Anomalies
    (v_org_id, v_asset2_id, v_meter_group2_id, 'drift', 'medium', 'active', 0.72, '{"pressure": 145}', '{"baseline": 120}', 'Pressure drifting upward - 145 PSI (baseline: 120 PSI)', now() - interval '8 hours'),
    (v_org_id, v_asset1_id, v_meter_group1_id, 'spike', 'medium', 'acknowledged', 0.68, '{"current": 42.5}', '{"expected": 30}', 'Electrical current spike - 42.5A (expected: 30A)', now() - interval '2 days'),
    (v_org_id, v_asset2_id, v_meter_group2_id, 'threshold_breach', 'medium', 'resolved', 0.65, '{"oil_temp": 88}', '{"threshold": 85}', 'Oil temperature slightly elevated - 88°C (max: 85°C)', now() - interval '3 days'),
    
    -- Low Severity Anomalies
    (v_org_id, v_asset1_id, v_meter_group1_id, 'pattern_deviation', 'low', 'active', 0.45, '{"cycles": 1250}', '{"expected": 1000}', 'Minor increase in cycle count - 1250 cycles/hr (expected: 1000)', now() - interval '12 hours'),
    (v_org_id, v_asset2_id, v_meter_group2_id, 'drift', 'low', 'active', 0.42, '{"efficiency": 92}', '{"baseline": 95}', 'Slight efficiency drift - 92% (baseline: 95%)', now() - interval '1 day'),
    (v_org_id, v_asset1_id, v_meter_group1_id, 'spike', 'low', 'active', 0.38, '{"flow_rate": 105}', '{"expected": 100}', 'Minor flow rate variation - 105 L/min (expected: 100 L/min)', now() - interval '5 days');

  -- Insert ML Predictions (20 records) - Asset 1: Declining Health Pattern
  INSERT INTO public.ml_predictions (organization_id, asset_id, prediction_type, health_score, failure_probability_30d, failure_probability_60d, failure_probability_90d, confidence_score, model_type, model_version, contributing_factors, predicted_at)
  VALUES
    (v_org_id, v_asset1_id, 'health_score', 50, 0.60, 0.72, 0.84, 0.88, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "increasing", "temperature_variance": "high", "runtime_hours": "excessive"}', now() - interval '1 hour'),
    (v_org_id, v_asset1_id, 'health_score', 55, 0.52, 0.65, 0.78, 0.86, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "increasing", "temperature_variance": "high"}', now() - interval '1 day'),
    (v_org_id, v_asset1_id, 'health_score', 62, 0.45, 0.58, 0.71, 0.84, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "increasing", "temperature_variance": "moderate"}', now() - interval '7 days'),
    (v_org_id, v_asset1_id, 'health_score', 68, 0.38, 0.51, 0.64, 0.83, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "stable", "temperature_variance": "moderate"}', now() - interval '14 days'),
    (v_org_id, v_asset1_id, 'health_score', 72, 0.32, 0.45, 0.58, 0.81, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "stable", "temperature_variance": "low"}', now() - interval '21 days'),
    (v_org_id, v_asset1_id, 'health_score', 78, 0.28, 0.40, 0.52, 0.80, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "stable", "temperature_variance": "low"}', now() - interval '28 days'),
    (v_org_id, v_asset1_id, 'health_score', 82, 0.22, 0.35, 0.48, 0.79, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "decreasing", "temperature_variance": "low"}', now() - interval '35 days'),
    (v_org_id, v_asset1_id, 'health_score', 85, 0.18, 0.30, 0.42, 0.78, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "stable"}', now() - interval '42 days'),
    (v_org_id, v_asset1_id, 'health_score', 87, 0.15, 0.25, 0.38, 0.78, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "stable"}', now() - interval '49 days'),
    (v_org_id, v_asset1_id, 'health_score', 88, 0.12, 0.22, 0.35, 0.77, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "stable"}', now() - interval '56 days'),
    (v_org_id, v_asset1_id, 'health_score', 90, 0.08, 0.18, 0.28, 0.77, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "stable"}', now() - interval '70 days'),
    (v_org_id, v_asset1_id, 'health_score', 92, 0.05, 0.12, 0.18, 0.77, 'RandomForestHealthPredictor', '2.1.0', '{"vibration_trend": "stable"}', now() - interval '90 days'),
    
    -- Asset 2: Stable Health Pattern
    (v_org_id, v_asset2_id, 'health_score', 81, 0.15, 0.17, 0.19, 0.91, 'RandomForestHealthPredictor', '2.1.0', '{"maintenance_compliance": "excellent", "operating_conditions": "optimal"}', now() - interval '1 hour'),
    (v_org_id, v_asset2_id, 'health_score', 82, 0.14, 0.16, 0.18, 0.90, 'RandomForestHealthPredictor', '2.1.0', '{"maintenance_compliance": "excellent", "operating_conditions": "optimal"}', now() - interval '7 days'),
    (v_org_id, v_asset2_id, 'health_score', 83, 0.13, 0.15, 0.17, 0.89, 'RandomForestHealthPredictor', '2.1.0', '{"maintenance_compliance": "good"}', now() - interval '14 days'),
    (v_org_id, v_asset2_id, 'health_score', 84, 0.12, 0.14, 0.16, 0.88, 'RandomForestHealthPredictor', '2.1.0', '{"maintenance_compliance": "good"}', now() - interval '30 days'),
    (v_org_id, v_asset2_id, 'health_score', 85, 0.11, 0.13, 0.15, 0.87, 'RandomForestHealthPredictor', '2.1.0', '{"maintenance_compliance": "good"}', now() - interval '45 days'),
    (v_org_id, v_asset2_id, 'health_score', 86, 0.10, 0.12, 0.14, 0.86, 'RandomForestHealthPredictor', '2.1.0', '{"maintenance_compliance": "good"}', now() - interval '60 days'),
    (v_org_id, v_asset2_id, 'health_score', 87, 0.09, 0.11, 0.13, 0.85, 'RandomForestHealthPredictor', '2.1.0', '{"maintenance_compliance": "excellent"}', now() - interval '75 days'),
    (v_org_id, v_asset2_id, 'health_score', 88, 0.08, 0.10, 0.12, 0.84, 'RandomForestHealthPredictor', '2.1.0', '{"maintenance_compliance": "excellent"}', now() - interval '90 days');

END $$;

-- Create temporary security definer function to update work orders
CREATE OR REPLACE FUNCTION seed_work_order_ai_data()
RETURNS void
SECURITY DEFINER
SET search_path = workorder_service, public
AS $$
DECLARE
  v_org_id uuid;
  v_work_orders uuid[];
BEGIN
  SELECT id INTO v_org_id FROM public.organizations WHERE name = 'MSMS' LIMIT 1;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'MSMS organization not found';
  END IF;

  SELECT ARRAY_AGG(id ORDER BY created_at) INTO v_work_orders
  FROM workorder_service.work_orders
  WHERE organization_id = v_org_id
  LIMIT 4;

  IF array_length(v_work_orders, 1) >= 4 THEN
    UPDATE workorder_service.work_orders
    SET ai_priority_score = 92, predicted_failure_risk = 0.72, ml_recommended = true,
        ai_priority_factors = '{"asset_health_score": 50, "failure_risk_30d": 60, "asset_criticality": "high", "anomaly_severity": "high", "sla_urgency": 85}'::jsonb,
        updated_at = now()
    WHERE id = v_work_orders[1];

    UPDATE workorder_service.work_orders
    SET ai_priority_score = 76, predicted_failure_risk = 0.54, ml_recommended = true,
        ai_priority_factors = '{"asset_health_score": 62, "failure_risk_30d": 45, "asset_criticality": "high", "anomaly_severity": "medium", "sla_urgency": 70}'::jsonb,
        updated_at = now()
    WHERE id = v_work_orders[2];

    UPDATE workorder_service.work_orders
    SET ai_priority_score = 58, predicted_failure_risk = 0.36, ml_recommended = false,
        ai_priority_factors = '{"asset_health_score": 78, "failure_risk_30d": 28, "asset_criticality": "medium", "anomaly_severity": "low", "sla_urgency": 55}'::jsonb,
        updated_at = now()
    WHERE id = v_work_orders[3];

    UPDATE workorder_service.work_orders
    SET ai_priority_score = 38, predicted_failure_risk = 0.18, ml_recommended = false,
        ai_priority_factors = '{"asset_health_score": 85, "failure_risk_30d": 15, "asset_criticality": "medium", "anomaly_severity": "low", "sla_urgency": 30}'::jsonb,
        updated_at = now()
    WHERE id = v_work_orders[4];
  END IF;
END;
$$ LANGUAGE plpgsql;

SELECT seed_work_order_ai_data();
DROP FUNCTION seed_work_order_ai_data();

COMMIT;