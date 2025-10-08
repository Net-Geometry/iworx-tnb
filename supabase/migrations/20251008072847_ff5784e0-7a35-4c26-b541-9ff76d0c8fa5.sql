-- Enable PostGIS extension if not already enabled (for future location features)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create ENUM types for IoT device management
CREATE TYPE iot_network_provider AS ENUM ('ttn', 'chirpstack', 'aws_iot_core');
CREATE TYPE iot_device_status AS ENUM ('active', 'inactive', 'error');

-- ================================================================
-- IoT Device Types Table
-- Defines device type catalog with sensor schemas and decoder configs
-- ================================================================
CREATE TABLE public.iot_device_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  sensor_schema JSONB NOT NULL DEFAULT '{"measures": {}}'::jsonb,
  decoder_config JSONB NOT NULL DEFAULT '{"format": "json"}'::jsonb,
  organization_id UUID NOT NULL,
  created_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_device_type_per_org UNIQUE (organization_id, name)
);

-- Enable RLS
ALTER TABLE public.iot_device_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for iot_device_types
CREATE POLICY "Users can view their organization's device types"
  ON public.iot_device_types FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can create device types in their organization"
  ON public.iot_device_types FOR INSERT
  WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's device types"
  ON public.iot_device_types FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's device types"
  ON public.iot_device_types FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- ================================================================
-- IoT Devices Table
-- Registered LoRaWAN devices with DevEUI and network provider info
-- ================================================================
CREATE TABLE public.iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name VARCHAR(255) NOT NULL,
  device_identifier VARCHAR(255) NOT NULL,
  dev_eui VARCHAR(16) NOT NULL,
  network_provider iot_network_provider NOT NULL DEFAULT 'ttn',
  device_type_id UUID REFERENCES public.iot_device_types(id) ON DELETE SET NULL,
  lorawan_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  organization_id UUID NOT NULL,
  asset_id UUID,
  status iot_device_status NOT NULL DEFAULT 'active',
  last_seen_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_dev_eui_per_provider UNIQUE (dev_eui, network_provider)
);

-- Create index for faster lookups
CREATE INDEX idx_iot_devices_dev_eui ON public.iot_devices(dev_eui);
CREATE INDEX idx_iot_devices_asset_id ON public.iot_devices(asset_id) WHERE asset_id IS NOT NULL;
CREATE INDEX idx_iot_devices_organization_id ON public.iot_devices(organization_id);
CREATE INDEX idx_iot_devices_last_seen_at ON public.iot_devices(last_seen_at DESC) WHERE last_seen_at IS NOT NULL;

-- Enable RLS
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for iot_devices
CREATE POLICY "Users can view their organization's devices"
  ON public.iot_devices FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can create devices in their organization"
  ON public.iot_devices FOR INSERT
  WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's devices"
  ON public.iot_devices FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's devices"
  ON public.iot_devices FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- ================================================================
-- IoT Data Table
-- Time-series sensor readings with LoRaWAN metadata
-- ================================================================
CREATE TABLE public.iot_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.iot_devices(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  value NUMERIC NOT NULL,
  unit VARCHAR(50),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  lorawan_metadata JSONB,
  organization_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_iot_data_device_timestamp ON public.iot_data(device_id, timestamp DESC);
CREATE INDEX idx_iot_data_metric_timestamp ON public.iot_data(metric_name, timestamp DESC);
CREATE INDEX idx_iot_data_organization_id ON public.iot_data(organization_id);

-- Enable RLS
ALTER TABLE public.iot_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for iot_data
CREATE POLICY "System can insert sensor readings"
  ON public.iot_data FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their organization's sensor data"
  ON public.iot_data FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- Enable Realtime for iot_data table
ALTER TABLE public.iot_data REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.iot_data;

-- ================================================================
-- IoT Device Meter Mappings Table
-- Links IoT devices to meters for auto-reading creation
-- ================================================================
CREATE TABLE public.iot_device_meter_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.iot_devices(id) ON DELETE CASCADE,
  meter_id UUID NOT NULL,
  metric_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  organization_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_device_meter_mapping UNIQUE (device_id, meter_id)
);

-- Create indexes
CREATE INDEX idx_iot_device_meter_mappings_device_id ON public.iot_device_meter_mappings(device_id);
CREATE INDEX idx_iot_device_meter_mappings_meter_id ON public.iot_device_meter_mappings(meter_id);
CREATE INDEX idx_iot_device_meter_mappings_organization_id ON public.iot_device_meter_mappings(organization_id);

-- Enable RLS
ALTER TABLE public.iot_device_meter_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for iot_device_meter_mappings
CREATE POLICY "Users can view their organization's meter mappings"
  ON public.iot_device_meter_mappings FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can create meter mappings in their organization"
  ON public.iot_device_meter_mappings FOR INSERT
  WITH CHECK (
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can update their organization's meter mappings"
  ON public.iot_device_meter_mappings FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

CREATE POLICY "Users can delete their organization's meter mappings"
  ON public.iot_device_meter_mappings FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) OR
    organization_id = ANY(get_user_organizations(auth.uid()))
  );

-- ================================================================
-- Triggers for updated_at timestamps
-- ================================================================
CREATE TRIGGER update_iot_device_types_updated_at
  BEFORE UPDATE ON public.iot_device_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iot_devices_updated_at
  BEFORE UPDATE ON public.iot_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iot_device_meter_mappings_updated_at
  BEFORE UPDATE ON public.iot_device_meter_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();