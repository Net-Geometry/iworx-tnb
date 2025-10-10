/**
 * TypeScript interfaces for Condition Monitoring
 */

export interface ConditionThreshold {
  id: string;
  organization_id: string;
  asset_id?: string;
  device_id?: string;
  metric_name: string;
  warning_min?: number;
  warning_max?: number;
  critical_min?: number;
  critical_max?: number;
  enabled: boolean;
  auto_create_work_order: boolean;
  notification_emails?: string[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface ThresholdFormData {
  asset_id: string;
  device_id?: string;
  metric_name: string;
  warning_min?: number;
  warning_max?: number;
  critical_min?: number;
  critical_max?: number;
  enabled: boolean;
  auto_create_work_order: boolean;
  notification_emails?: string[];
}

export interface SensorMetric {
  name: string;
  type: string;
  unit: string;
  description?: string;
}

export interface IoTDeviceWithType {
  id: string;
  device_name: string;
  status: string;
  device_type?: {
    id: string;
    name: string;
    sensor_schema?: any;
  };
}
