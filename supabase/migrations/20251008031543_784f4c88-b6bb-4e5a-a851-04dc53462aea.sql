-- =====================================================
-- Phase 1: AI-Powered Predictive Maintenance System
-- Fixed schema references for assets_service
-- =====================================================

-- 1. CREATE ANOMALY DETECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.anomaly_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  asset_id UUID, -- FK to assets_service.assets
  meter_group_id UUID,
  anomaly_type VARCHAR(100) NOT NULL, -- 'spike', 'drift', 'pattern_break', 'threshold_breach'
  severity VARCHAR(50) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  anomaly_score NUMERIC(5,2) NOT NULL, -- 0-100 score
  description TEXT NOT NULL,
  detected_values JSONB, -- Store the actual anomalous readings
  expected_range JSONB, -- Store expected min/max values
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'false_positive'
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for anomaly_detections
CREATE INDEX idx_anomaly_detections_org ON public.anomaly_detections(organization_id);
CREATE INDEX idx_anomaly_detections_asset ON public.anomaly_detections(asset_id);
CREATE INDEX idx_anomaly_detections_status ON public.anomaly_detections(status);
CREATE INDEX idx_anomaly_detections_severity ON public.anomaly_detections(severity);
CREATE INDEX idx_anomaly_detections_detected_at ON public.anomaly_detections(detected_at DESC);

-- RLS for anomaly_detections
ALTER TABLE public.anomaly_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's anomalies"
  ON public.anomaly_detections FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's anomalies"
  ON public.anomaly_detections FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "System can insert anomalies"
  ON public.anomaly_detections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their organization's anomalies"
  ON public.anomaly_detections FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Trigger for updated_at
CREATE TRIGGER update_anomaly_detections_updated_at
  BEFORE UPDATE ON public.anomaly_detections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 2. CREATE ML PREDICTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ml_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  asset_id UUID NOT NULL, -- FK to assets_service.assets
  prediction_type VARCHAR(100) NOT NULL, -- 'failure_prediction', 'health_score', 'remaining_useful_life'
  prediction_window_days INTEGER, -- 30, 60, 90 days ahead
  predicted_failure_date DATE,
  failure_probability_30d NUMERIC(5,2), -- 0-100%
  failure_probability_60d NUMERIC(5,2),
  failure_probability_90d NUMERIC(5,2),
  health_score NUMERIC(5,2), -- 0-100
  remaining_useful_life_days INTEGER,
  model_version VARCHAR(50) NOT NULL,
  model_type VARCHAR(100) NOT NULL, -- 'random_forest', 'lstm', 'gradient_boosting'
  confidence_score NUMERIC(5,2) NOT NULL, -- 0-100
  contributing_factors JSONB, -- Key factors that led to prediction
  feature_importance JSONB, -- Which features were most important
  training_data_period JSONB, -- Date range of training data
  predicted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE, -- When prediction expires
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ml_predictions
CREATE INDEX idx_ml_predictions_org ON public.ml_predictions(organization_id);
CREATE INDEX idx_ml_predictions_asset ON public.ml_predictions(asset_id);
CREATE INDEX idx_ml_predictions_predicted_at ON public.ml_predictions(predicted_at DESC);
CREATE INDEX idx_ml_predictions_failure_30d ON public.ml_predictions(failure_probability_30d DESC);
CREATE INDEX idx_ml_predictions_valid_until ON public.ml_predictions(valid_until);
CREATE INDEX idx_ml_predictions_type ON public.ml_predictions(prediction_type);

-- RLS for ml_predictions
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's predictions"
  ON public.ml_predictions FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "System can manage predictions"
  ON public.ml_predictions FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. CREATE AI CHAT CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
  message TEXT NOT NULL,
  asset_ids UUID[], -- Referenced assets in context
  work_order_ids UUID[], -- Referenced work orders in context
  anomaly_ids UUID[], -- Referenced anomalies in context
  prediction_ids UUID[], -- Referenced predictions in context
  function_calls JSONB, -- Store function calls made by AI
  tokens_used INTEGER,
  model_used VARCHAR(100),
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ai_chat_conversations
CREATE INDEX idx_ai_chat_org ON public.ai_chat_conversations(organization_id);
CREATE INDEX idx_ai_chat_user ON public.ai_chat_conversations(user_id);
CREATE INDEX idx_ai_chat_created_at ON public.ai_chat_conversations(created_at DESC);
CREATE INDEX idx_ai_chat_role ON public.ai_chat_conversations(role);
CREATE INDEX idx_ai_chat_asset_ids ON public.ai_chat_conversations USING GIN(asset_ids);
CREATE INDEX idx_ai_chat_work_order_ids ON public.ai_chat_conversations USING GIN(work_order_ids);
CREATE INDEX idx_ai_chat_anomaly_ids ON public.ai_chat_conversations USING GIN(anomaly_ids);

-- RLS for ai_chat_conversations
ALTER TABLE public.ai_chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON public.ai_chat_conversations FOR SELECT
  USING (
    user_id = auth.uid() OR
    (role = 'assistant' AND organization_id = ANY(get_user_organizations(auth.uid())))
  );

CREATE POLICY "Users can insert their own messages"
  ON public.ai_chat_conversations FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND 
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "System can insert assistant messages"
  ON public.ai_chat_conversations FOR INSERT
  WITH CHECK (role = 'assistant');

-- =====================================================
-- 4. EXTEND WORK ORDERS TABLE WITH AI FIELDS
-- =====================================================
-- Add AI-related columns to workorder_service.work_orders
ALTER TABLE workorder_service.work_orders 
  ADD COLUMN IF NOT EXISTS ai_priority_score NUMERIC(5,2) CHECK (ai_priority_score >= 0 AND ai_priority_score <= 100),
  ADD COLUMN IF NOT EXISTS ai_priority_factors JSONB,
  ADD COLUMN IF NOT EXISTS predicted_failure_risk NUMERIC(5,2) CHECK (predicted_failure_risk >= 0 AND predicted_failure_risk <= 100),
  ADD COLUMN IF NOT EXISTS ml_recommended BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS anomaly_detection_id UUID;

-- Indexes for new work order AI fields
CREATE INDEX IF NOT EXISTS idx_work_orders_ai_priority ON workorder_service.work_orders(ai_priority_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_work_orders_ml_recommended ON workorder_service.work_orders(ml_recommended) WHERE ml_recommended = TRUE;
CREATE INDEX IF NOT EXISTS idx_work_orders_anomaly ON workorder_service.work_orders(anomaly_detection_id);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.anomaly_detections TO authenticated;
GRANT ALL ON public.ml_predictions TO authenticated;
GRANT ALL ON public.ai_chat_conversations TO authenticated;