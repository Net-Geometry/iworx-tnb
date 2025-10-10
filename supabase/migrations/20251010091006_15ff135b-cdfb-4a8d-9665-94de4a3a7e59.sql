-- Migration: Create Condition Monitoring Tables (Fixed)
-- Description: Tables for CBM with thresholds, alarms, and history

-- 1. Condition Thresholds Table
CREATE TABLE IF NOT EXISTS condition_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  asset_id UUID,
  device_id UUID,
  metric_name VARCHAR NOT NULL,
  warning_min NUMERIC,
  warning_max NUMERIC,
  critical_min NUMERIC,
  critical_max NUMERIC,
  enabled BOOLEAN DEFAULT true,
  notification_emails TEXT[],
  auto_create_work_order BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_warning_range CHECK (
    (warning_min IS NULL OR warning_max IS NULL OR warning_min < warning_max)
  ),
  CONSTRAINT valid_critical_range CHECK (
    (critical_min IS NULL OR critical_max IS NULL OR critical_min < critical_max)
  )
);

CREATE INDEX idx_condition_thresholds_org ON condition_thresholds(organization_id);
CREATE INDEX idx_condition_thresholds_asset ON condition_thresholds(asset_id);
CREATE INDEX idx_condition_thresholds_device ON condition_thresholds(device_id);
CREATE INDEX idx_condition_thresholds_metric ON condition_thresholds(metric_name);
CREATE INDEX idx_condition_thresholds_enabled ON condition_thresholds(enabled) WHERE enabled = true;

ALTER TABLE condition_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org thresholds" ON condition_thresholds
  FOR SELECT USING (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can manage org thresholds" ON condition_thresholds
  FOR ALL USING (organization_id = ANY(get_user_organizations(auth.uid())));

-- 2. Condition Alarms Table
CREATE TABLE IF NOT EXISTS condition_alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  asset_id UUID,
  device_id UUID,
  threshold_id UUID REFERENCES condition_thresholds(id) ON DELETE SET NULL,
  metric_name VARCHAR NOT NULL,
  alarm_type VARCHAR NOT NULL CHECK (alarm_type IN ('warning', 'critical')),
  triggered_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  work_order_id UUID,
  work_order_created_at TIMESTAMPTZ,
  sensor_context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_condition_alarms_org ON condition_alarms(organization_id);
CREATE INDEX idx_condition_alarms_asset ON condition_alarms(asset_id);
CREATE INDEX idx_condition_alarms_device ON condition_alarms(device_id);
CREATE INDEX idx_condition_alarms_status ON condition_alarms(status);
CREATE INDEX idx_condition_alarms_type ON condition_alarms(alarm_type);
CREATE INDEX idx_condition_alarms_created ON condition_alarms(created_at DESC);
CREATE INDEX idx_condition_alarms_active ON condition_alarms(organization_id, status) WHERE status = 'active';

ALTER TABLE condition_alarms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org alarms" ON condition_alarms
  FOR SELECT USING (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can manage org alarms" ON condition_alarms
  FOR ALL USING (organization_id = ANY(get_user_organizations(auth.uid())));

-- 3. Condition Monitoring History Table
CREATE TABLE IF NOT EXISTS condition_monitoring_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  device_id UUID,
  metric_name VARCHAR NOT NULL,
  value NUMERIC NOT NULL,
  unit VARCHAR,
  health_status VARCHAR CHECK (health_status IN ('healthy', 'warning', 'critical')),
  threshold_id UUID REFERENCES condition_thresholds(id) ON DELETE SET NULL,
  alarm_id UUID REFERENCES condition_alarms(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cmh_org_asset_time ON condition_monitoring_history(organization_id, asset_id, recorded_at DESC);
CREATE INDEX idx_cmh_device_time ON condition_monitoring_history(device_id, recorded_at DESC);
CREATE INDEX idx_cmh_metric ON condition_monitoring_history(metric_name, recorded_at DESC);

ALTER TABLE condition_monitoring_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org history" ON condition_monitoring_history
  FOR SELECT USING (organization_id = ANY(get_user_organizations(auth.uid())));

GRANT ALL ON condition_thresholds TO authenticated;
GRANT ALL ON condition_alarms TO authenticated;
GRANT ALL ON condition_monitoring_history TO authenticated;