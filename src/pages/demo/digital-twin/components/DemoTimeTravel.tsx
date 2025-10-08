/**
 * Time Travel Demo Component
 * Shows historical data playback with incident correlation
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, AlertCircle, Clock } from 'lucide-react';
import { DemoCanvas } from './DemoCanvas';
import { DemoTransformer3D } from './models/DemoTransformer3D';
import { DemoTimelineScrubber } from './DemoTimelineScrubber';
import {
  mockIncidents,
  generateIncidentHistoricalData,
  getTimeRange,
  MockHistoricalReading,
} from '../mock-data/mockHistoricalData';
import { Html } from '@react-three/drei';

export function DemoTimeTravel() {
  const { start: startTime, end: endTime } = getTimeRange();
  const [currentTime, setCurrentTime] = useState(new Date(endTime.getTime() - 2 * 24 * 60 * 60 * 1000));
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(10);
  const [selectedIncident, setSelectedIncident] = useState(mockIncidents[0]);
  const [historicalData, setHistoricalData] = useState<MockHistoricalReading[]>([]);

  // Load historical data for selected incident
  useEffect(() => {
    if (selectedIncident) {
      const data = generateIncidentHistoricalData(selectedIncident, 24);
      setHistoricalData(data);
      setCurrentTime(new Date(selectedIncident.timestamp.getTime() - 12 * 60 * 60 * 1000));
    }
  }, [selectedIncident]);

  // Playback simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = new Date(prev.getTime() + 60 * 1000 * playbackSpeed);
        if (next > endTime) {
          setIsPlaying(false);
          return endTime;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, endTime]);

  // Get reading at current time
  const getCurrentReading = () => {
    return historicalData.find(
      (r) => Math.abs(r.timestamp.getTime() - currentTime.getTime()) < 30 * 60 * 1000
    );
  };

  const currentReading = getCurrentReading();
  const isAtIncident = Math.abs(currentTime.getTime() - selectedIncident.timestamp.getTime()) < 5 * 60 * 1000;

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          Travel back in time to see what happened before an incident! Watch sensor data trends
          leading up to critical events. Select an incident to jump to that moment.
        </AlertDescription>
      </Alert>

      {/* Incident Selection */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Select Incident to Investigate</h4>
        <div className="space-y-2">
          {mockIncidents.map((incident) => (
            <button
              key={incident.id}
              onClick={() => setSelectedIncident(incident)}
              className={`w-full text-left p-3 rounded border transition-colors ${
                selectedIncident.id === incident.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        incident.severity === 'critical' ? 'destructive' : incident.severity === 'high' ? 'default' : 'secondary'
                      }
                    >
                      {incident.severity}
                    </Badge>
                    <span className="font-semibold">{incident.assetName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {incident.timestamp.toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* 3D Scene */}
      <div className="relative">
        <DemoCanvas>
          <DemoTransformer3D
            position={[0, 2, 0]}
            status={isAtIncident ? 'critical' : currentReading?.status === 'critical' ? 'critical' : currentReading?.status === 'warning' ? 'maintenance' : 'operational'}
            name={selectedIncident.assetName}
          />

          {/* Current reading overlay */}
          {currentReading && (
            <Html position={[0, 5, 0]} center>
              <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 px-3 py-2 rounded text-sm">
                <div className="font-semibold mb-1">
                  {currentReading.sensorType.toUpperCase()}
                </div>
                <div className="text-2xl font-bold">
                  {currentReading.value} {currentReading.unit}
                </div>
                <Badge
                  variant={
                    currentReading.status === 'critical'
                      ? 'destructive'
                      : currentReading.status === 'warning'
                      ? 'default'
                      : 'secondary'
                  }
                  className="mt-1"
                >
                  {currentReading.status}
                </Badge>
              </div>
            </Html>
          )}
        </DemoCanvas>

        {/* Incident Alert Overlay */}
        {isAtIncident && (
          <div className="absolute top-4 left-4 right-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>INCIDENT DETECTED</AlertTitle>
              <AlertDescription>{selectedIncident.description}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Timeline Scrubber */}
      <DemoTimelineScrubber
        currentTime={currentTime}
        startTime={startTime}
        endTime={endTime}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onTimeChange={setCurrentTime}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onSpeedChange={setPlaybackSpeed}
      />

      {/* Integration Example */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-semibold mb-2">Production Integration Example:</h4>
        <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
          {`// Query historical sensor data
const { data } = await supabase
  .from('asset_sensor_readings')
  .select('*')
  .eq('asset_id', assetId)
  .gte('timestamp', startTime)
  .lte('timestamp', endTime)
  .order('timestamp', { ascending: true });

// Correlate with incidents
const incident = incidents.find(i => 
  i.asset_id === assetId && 
  Math.abs(i.timestamp - currentTime) < threshold
);`}
        </pre>
      </Card>
    </div>
  );
}
