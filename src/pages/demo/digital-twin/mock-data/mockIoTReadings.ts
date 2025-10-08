/**
 * Mock IoT Sensor Readings for Digital Twin Demo
 * Simulates real-time temperature, vibration, voltage data
 */

export interface MockIoTReading {
  assetId: string;
  sensorType: 'temperature' | 'vibration' | 'voltage' | 'current';
  value: number;
  unit: string;
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
}

// Base thresholds for different sensor types
const thresholds = {
  temperature: { normal: 85, warning: 90, critical: 95 },
  vibration: { normal: 0.3, warning: 0.5, critical: 0.8 },
  voltage: { normal: 12.5, warning: 11.5, critical: 11.0 },
  current: { normal: 150, warning: 180, critical: 200 },
};

// Base values for each asset
const baseValues: Record<string, Record<string, number>> = {
  'demo-transformer-1': { temperature: 78, vibration: 0.15, voltage: 12.0, current: 140 },
  'demo-transformer-2': { temperature: 88, vibration: 0.35, voltage: 11.8, current: 155 },
  'demo-transformer-3': { temperature: 92, vibration: 0.65, voltage: 11.3, current: 185 }, // Critical
  'demo-switchgear-1': { temperature: 65, vibration: 0.08, voltage: 12.1, current: 120 },
  'demo-switchgear-2': { temperature: 70, vibration: 0.12, voltage: 12.0, current: 130 },
  'demo-switchgear-3': { temperature: 75, vibration: 0.18, voltage: 11.9, current: 145 },
  'demo-meter-bank-1': { temperature: 55, vibration: 0.05, voltage: 12.2, current: 100 },
};

/**
 * Generate a mock IoT reading with realistic variation
 */
export const generateMockReading = (
  assetId: string,
  sensorType: 'temperature' | 'vibration' | 'voltage' | 'current'
): MockIoTReading => {
  const base = baseValues[assetId]?.[sensorType] || 0;
  
  // Add random noise (±5% variation)
  const noise = (Math.random() - 0.5) * 0.1 * base;
  const value = Math.max(0, base + noise);

  // Determine status based on thresholds
  let status: 'normal' | 'warning' | 'critical' = 'normal';
  const threshold = thresholds[sensorType];
  
  if (sensorType === 'voltage') {
    // For voltage, lower is worse
    if (value < threshold.critical) status = 'critical';
    else if (value < threshold.warning) status = 'warning';
  } else {
    // For others, higher is worse
    if (value > threshold.critical) status = 'critical';
    else if (value > threshold.warning) status = 'warning';
  }

  // Unit mapping
  const units: Record<string, string> = {
    temperature: '°C',
    vibration: 'mm/s',
    voltage: 'kV',
    current: 'A',
  };

  return {
    assetId,
    sensorType,
    value: Math.round(value * 100) / 100,
    unit: units[sensorType],
    timestamp: new Date(),
    status,
  };
};

/**
 * Generate all sensor readings for an asset
 */
export const generateAssetReadings = (assetId: string): MockIoTReading[] => {
  if (!baseValues[assetId]) return [];

  return [
    generateMockReading(assetId, 'temperature'),
    generateMockReading(assetId, 'vibration'),
    generateMockReading(assetId, 'voltage'),
    generateMockReading(assetId, 'current'),
  ];
};
