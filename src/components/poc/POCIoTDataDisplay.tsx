import { useAssetIoTDevices } from '@/hooks/useAssetIoTDevices';
import { useIoTRealtimeData } from '@/hooks/useIoTRealtimeData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Thermometer,
  Activity,
  Battery,
  Radio,
  TrendingUp,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff,
  Gauge
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface POCIoTDataDisplayProps {
  assetId: string;
}

/**
 * POC IoT Data Display Component
 * Real-time sensor data visualization for proof of concept
 * Displays device status, latest readings, and connection state
 */
export function POCIoTDataDisplay({ assetId }: POCIoTDataDisplayProps) {
  const { data: devices, isLoading: devicesLoading } = useAssetIoTDevices(assetId);
  
  // Get the first device for this asset
  const deviceId = devices && devices.length > 0 ? devices[0].id : undefined;
  const { readings, isConnected } = useIoTRealtimeData(deviceId, 10);

  if (devicesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <Alert className="border-muted bg-muted/30">
        <Radio className="h-4 w-4" />
        <AlertDescription>
          No IoT devices are currently monitoring this asset. 
          Devices can be assigned from the full asset management system.
        </AlertDescription>
      </Alert>
    );
  }

  const device = devices[0];
  
  // Group readings by metric_name to get latest value for each sensor
  const getSensorValue = (metricName: string) => {
    if (!readings || readings.length === 0) return null;
    const metricReadings = readings.filter(r => r.metric_name === metricName);
    if (metricReadings.length === 0) return null;
    return metricReadings[0].value;
  };

  const temperature = getSensorValue('temperature');
  const roll = getSensorValue('roll');
  const pitch = getSensorValue('pitch');
  const battery = getSensorValue('battery');
  const alarmFlags = getSensorValue('alarm_flags');
  
  const latestReading = readings && readings.length > 0 ? readings[0] : null;

  const sensorMetrics = [
    {
      icon: Thermometer,
      label: 'Temperature',
      value: temperature !== null ? `${temperature.toFixed(1)}°C` : 'N/A',
      status: temperature !== null && temperature > 35 ? 'warning' : 'normal',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Activity,
      label: 'Roll Angle',
      value: roll !== null ? `${roll.toFixed(2)}°` : 'N/A',
      status: 'normal',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Gauge,
      label: 'Pitch Angle',
      value: pitch !== null ? `${pitch.toFixed(2)}°` : 'N/A',
      status: 'normal',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Battery,
      label: 'Battery Voltage',
      value: battery !== null ? `${battery.toFixed(3)}V` : 'N/A',
      status: battery !== null && battery < 2.0 ? 'warning' : 'normal',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Device Status Bar */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Radio className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{device.device_name}</p>
            <p className="text-sm text-muted-foreground">
              Type: {device.device_type || 'Unknown'} • DevEUI: {device.dev_eui || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-accent-success animate-pulse" />
                <span className="text-sm font-medium text-accent-success">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Connecting...</span>
              </>
            )}
          </div>
          <Badge 
            variant="outline" 
            className={device.status === 'active' 
              ? 'bg-accent-success/20 text-accent-success border-accent-success/30' 
              : 'bg-muted'
            }
          >
            {device.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>
      </div>

      {/* Sensor Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sensorMetrics.map((metric, index) => (
          <Card 
            key={index} 
            className="shadow-card bg-gradient-card border-border hover:border-primary/30 transition-all"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 ${metric.bgColor} rounded-lg`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                {metric.status === 'warning' && (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alarm Status */}
      {alarmFlags !== null && alarmFlags !== undefined && (
        <Card className="shadow-card bg-gradient-card border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Alarm Status</p>
                <p className="text-xs text-muted-foreground">
                  Alarm flags: {alarmFlags} {alarmFlags === 0 ? '(No alarms)' : '(Active alerts)'}
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={alarmFlags === 0 
                  ? 'bg-accent-success/20 text-accent-success border-accent-success/30' 
                  : 'bg-warning/20 text-warning border-warning/30'
                }
              >
                {alarmFlags === 0 ? 'Normal' : 'Alert'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Reading Info */}
      {latestReading && (
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium text-foreground">
                {formatDistanceToNow(new Date(latestReading.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              {readings.length} readings received
            </span>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!latestReading && (
        <Alert className="border-muted bg-muted/30">
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Waiting for sensor data... The device will start transmitting readings shortly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
