-- Digital Twin Production Tables Migration
-- Creates tables for real-time IoT data, simulations, and results

-- ============================================================================
-- 1. ASSET SENSOR READINGS (Real-time IoT Data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.asset_sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,  -- References assets_service.assets (no FK due to cross-schema)
  sensor_type VARCHAR(50) NOT NULL,  -- 'temperature', 'vibration', 'pressure', 'voltage', 'current'
  reading_value NUMERIC NOT NULL,
  unit VARCHAR(20) NOT NULL,         -- '°C', 'mm/s', 'kV', 'A', 'bar'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  alert_threshold_exceeded BOOLEAN DEFAULT FALSE,
  metadata JSONB,                     -- Flexible field for sensor-specific data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_asset_sensor_readings_asset ON public.asset_sensor_readings(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_sensor_readings_timestamp ON public.asset_sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_asset_sensor_readings_org ON public.asset_sensor_readings(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_sensor_readings_type ON public.asset_sensor_readings(sensor_type);
CREATE INDEX IF NOT EXISTS idx_asset_sensor_readings_alert ON public.asset_sensor_readings(alert_threshold_exceeded) WHERE alert_threshold_exceeded = TRUE;
CREATE INDEX IF NOT EXISTS idx_asset_sensor_readings_composite ON public.asset_sensor_readings(asset_id, timestamp DESC);

-- Enable Realtime for live data streaming
ALTER TABLE public.asset_sensor_readings REPLICA IDENTITY FULL;

-- RLS Policies
ALTER TABLE public.asset_sensor_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's sensor readings"
  ON public.asset_sensor_readings FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR 
    (organization_id = ANY (get_user_organizations(auth.uid())))
  );

CREATE POLICY "Service can insert sensor readings"
  ON public.asset_sensor_readings FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 2. DIGITAL TWIN SCENARIOS (What-if Simulations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.digital_twin_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scenario_type VARCHAR(50) NOT NULL, -- 'maintenance', 'failure', 'resource'
  parameters JSONB NOT NULL,          -- Flexible scenario configuration
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_org ON public.digital_twin_scenarios(organization_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_type ON public.digital_twin_scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_scenarios_created_by ON public.digital_twin_scenarios(created_by);

ALTER TABLE public.digital_twin_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's scenarios"
  ON public.digital_twin_scenarios FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR 
    (organization_id = ANY (get_user_organizations(auth.uid())))
  );

CREATE POLICY "Users can create scenarios"
  ON public.digital_twin_scenarios FOR INSERT
  WITH CHECK (
    organization_id = ANY (get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's scenarios"
  ON public.digital_twin_scenarios FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) OR 
    (organization_id = ANY (get_user_organizations(auth.uid())))
  );

CREATE POLICY "Users can delete their organization's scenarios"
  ON public.digital_twin_scenarios FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) OR 
    (organization_id = ANY (get_user_organizations(auth.uid())))
  );

-- ============================================================================
-- 3. SCENARIO SIMULATION RESULTS (Simulation Outcomes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scenario_simulation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.digital_twin_scenarios(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  baseline_value NUMERIC,
  simulated_value NUMERIC,
  percentage_change NUMERIC,
  unit VARCHAR(50),
  impact_description TEXT,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_results_scenario ON public.scenario_simulation_results(scenario_id);
CREATE INDEX IF NOT EXISTS idx_results_metric ON public.scenario_simulation_results(metric_name);

ALTER TABLE public.scenario_simulation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their scenario results"
  ON public.scenario_simulation_results FOR SELECT
  USING (
    scenario_id IN (
      SELECT id FROM public.digital_twin_scenarios 
      WHERE organization_id = ANY (get_user_organizations(auth.uid()))
    )
  );

CREATE POLICY "Service can insert simulation results"
  ON public.scenario_simulation_results FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE public.asset_sensor_readings IS 'Real-time IoT sensor data from assets for Digital Twin visualization';
COMMENT ON TABLE public.digital_twin_scenarios IS 'What-if simulation scenarios for predictive analysis';
COMMENT ON TABLE public.scenario_simulation_results IS 'Simulation outcomes and metrics';