/**
 * IoT Device Management Types
 */

export interface IoTDeviceType {
  id: string;
  name: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  sensor_schema: {
    measures: Record<string, {
      type: 'number' | 'boolean' | 'string';
      unit?: string;
      description?: string;
    }>;
  };
  decoder_config: {
    format: 'json' | 'cayenne_lpp' | 'custom';
    decoder_function?: string;
  };
  organization_id: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IoTDevice {
  id: string;
  device_name: string;
  device_identifier: string;
  dev_eui: string;
  network_provider: 'ttn' | 'chirpstack' | 'aws_iot_core';
  device_type_id?: string;
  device_type?: IoTDeviceType;
  lorawan_config: {
    app_key?: string;
    app_eui?: string;
    join_eui?: string;
    frequency_plan?: string;
    activation_mode?: 'OTAA' | 'ABP';
  };
  organization_id: string;
  asset_id?: string;
  asset?: {
    id: string;
    name: string;
    asset_number: string;
  };
  status: 'active' | 'inactive' | 'error';
  last_seen_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface IoTData {
  id: string;
  device_id: string;
  metric_name: string;
  value: number;
  unit?: string;
  timestamp: string;
  lorawan_metadata?: {
    rssi?: number;
    snr?: number;
    spreading_factor?: number;
    gateway_id?: string;
    gateway_location?: { lat: number; lon: number };
  };
  organization_id: string;
  created_at: string;
}

export interface IoTDeviceMeterMapping {
  id: string;
  device_id: string;
  meter_id: string;
  device?: {
    id: string;
    device_name: string;
  };
  meter?: {
    id: string;
    meter_name: string;
  };
  metric_mapping: {
    source_metric: string;
    multiplier?: number;
    offset?: number;
    min_value?: number;
    max_value?: number;
    warn_min?: number;
    warn_max?: number;
  };
  organization_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IoTDeviceHealth {
  device_id: string;
  status: 'active' | 'inactive' | 'error';
  last_seen_at?: string;
  minutes_since_last_seen?: number;
  is_online: boolean;
  recent_readings_count: number;
  latest_reading?: IoTData;
}
