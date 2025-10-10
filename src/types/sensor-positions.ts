/**
 * Sensor Position Types
 * 
 * Types for 3D sensor positioning and visualization
 */

export interface SensorPosition3D {
  x: number;
  y: number;
  z: number;
  label?: string;
  visible?: boolean;
  color?: string;
}

export interface SensorPosition {
  id: string;
  sensorType: string;
  label: string;
  position: [number, number, number];
  deviceId?: string;
  deviceName?: string;
  isActive: boolean;
  color?: string;
}

export interface SensorReading {
  id: string;
  assetId: string;
  deviceId?: string;
  sensorType: string;
  readingValue: number;
  unit: string;
  timestamp: string;
  alertThresholdExceeded: boolean;
  metadata?: Record<string, any>;
}

export interface PositionedSensorReading extends SensorReading {
  position: [number, number, number];
  label: string;
  deviceName?: string;
}
