/**
 * Mock Historical Data for Time Travel Demo
 * Simulates incident timeline and sensor data over time
 */

import { MockIoTReading } from './mockIoTReadings';

export interface MockIncident {
  id: string;
  timestamp: Date;
  assetId: string;
  assetName: string;
  eventType: 'overheat' | 'vibration_spike' | 'voltage_drop' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface MockHistoricalReading extends Omit<MockIoTReading, 'timestamp'> {
  timestamp: Date;
}

// Mock incident timeline (last 7 days)
export const mockIncidents: MockIncident[] = [
  {
    id: 'incident-1',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    assetId: 'demo-transformer-3',
    assetName: 'Transformer T3',
    eventType: 'overheat',
    severity: 'critical',
    description: 'Temperature exceeded 95°C threshold. Emergency shutdown initiated.',
  },
  {
    id: 'incident-2',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    assetId: 'demo-transformer-2',
    assetName: 'Transformer T2',
    eventType: 'maintenance',
    severity: 'low',
    description: 'Scheduled preventive maintenance completed.',
  },
  {
    id: 'incident-3',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    assetId: 'demo-transformer-1',
    assetName: 'Transformer T1',
    eventType: 'vibration_spike',
    severity: 'medium',
    description: 'Vibration levels reached 0.6 mm/s. Inspection recommended.',
  },
];

/**
 * Generate historical readings leading up to an incident
 * Shows gradual degradation before the event
 */
export const generateIncidentHistoricalData = (
  incident: MockIncident,
  hoursBeforeIncident: number = 24
): MockHistoricalReading[] => {
  const readings: MockHistoricalReading[] = [];
  const intervalMinutes = 30; // Data point every 30 minutes
  const dataPoints = (hoursBeforeIncident * 60) / intervalMinutes;

  for (let i = dataPoints; i >= 0; i--) {
    const timestamp = new Date(
      incident.timestamp.getTime() - i * intervalMinutes * 60 * 1000
    );

    // Simulate gradual increase toward incident
    const progressToIncident = 1 - i / dataPoints;

    if (incident.eventType === 'overheat') {
      readings.push({
        assetId: incident.assetId,
        sensorType: 'temperature',
        value: 75 + progressToIncident * 25, // 75°C → 100°C
        unit: '°C',
        timestamp,
        status: progressToIncident > 0.8 ? 'critical' : progressToIncident > 0.6 ? 'warning' : 'normal',
      });
    } else if (incident.eventType === 'vibration_spike') {
      readings.push({
        assetId: incident.assetId,
        sensorType: 'vibration',
        value: 0.15 + progressToIncident * 0.5, // 0.15 → 0.65 mm/s
        unit: 'mm/s',
        timestamp,
        status: progressToIncident > 0.7 ? 'warning' : 'normal',
      });
    }
  }

  return readings;
};

/**
 * Get time range for demo (last 7 days)
 */
export const getTimeRange = () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { start: sevenDaysAgo, end: now };
};
