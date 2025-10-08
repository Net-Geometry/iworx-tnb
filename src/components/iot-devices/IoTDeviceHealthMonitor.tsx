/**
 * IoT Device Health Monitor Component
 * 
 * Real-time health monitoring dashboard for IoT devices
 */

import { Activity, Wifi, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow, format } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from "recharts";

interface IoTDeviceHealthMonitorProps {
  deviceId: string;
  deviceName?: string;
  status?: string;
  lastSeenAt?: string;
  networkProvider?: string;
}

export function IoTDeviceHealthMonitor({ 
  deviceId, 
  deviceName,
  status = 'active',
  lastSeenAt,
  networkProvider = 'TTN'
}: IoTDeviceHealthMonitorProps) {
  // TODO: Load real data from hooks
  const isOnline = lastSeenAt && (Date.now() - new Date(lastSeenAt).getTime()) < 60000;

  // Mock data for signal quality chart
  const signalQualityData = [
    { timestamp: new Date(Date.now() - 86400000).toISOString(), rssi: -85, snr: 8 },
    { timestamp: new Date(Date.now() - 72000000).toISOString(), rssi: -82, snr: 9 },
    { timestamp: new Date(Date.now() - 57600000).toISOString(), rssi: -88, snr: 7 },
    { timestamp: new Date(Date.now() - 43200000).toISOString(), rssi: -80, snr: 10 },
    { timestamp: new Date(Date.now() - 28800000).toISOString(), rssi: -83, snr: 9 },
    { timestamp: new Date(Date.now() - 14400000).toISOString(), rssi: -86, snr: 8 },
    { timestamp: new Date().toISOString(), rssi: -84, snr: 8.5 },
  ];

  // Mock data for uplink frequency
  const uplinkFrequencyData = [
    { hour: new Date(Date.now() - 21600000).toISOString(), count: 12 },
    { hour: new Date(Date.now() - 18000000).toISOString(), count: 15 },
    { hour: new Date(Date.now() - 14400000).toISOString(), count: 10 },
    { hour: new Date(Date.now() - 10800000).toISOString(), count: 14 },
    { hour: new Date(Date.now() - 7200000).toISOString(), count: 13 },
    { hour: new Date(Date.now() - 3600000).toISOString(), count: 16 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Device Health Monitor</span>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <div className="h-2 w-2 bg-accent-success rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground font-normal">Live</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 bg-muted-foreground rounded-full" />
                <span className="text-sm text-muted-foreground font-normal">Offline</span>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status Panel */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Last Seen</p>
            <p className="font-medium text-sm">
              {lastSeenAt 
                ? formatDistanceToNow(new Date(lastSeenAt), { addSuffix: true })
                : "Never"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Network</p>
            <p className="font-medium text-sm">{networkProvider.toUpperCase()}</p>
          </div>
        </div>

        {/* Signal Quality Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Signal Quality (24h)
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={signalQualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(val) => format(new Date(val), 'HH:mm')}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                yAxisId="rssi" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                yAxisId="snr" 
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                labelFormatter={(val) => format(new Date(val), 'PPpp')}
              />
              <Legend />
              <Line 
                yAxisId="rssi"
                type="monotone" 
                dataKey="rssi" 
                stroke="hsl(var(--destructive))" 
                name="RSSI (dBm)"
                strokeWidth={2}
              />
              <Line 
                yAxisId="snr"
                type="monotone" 
                dataKey="snr" 
                stroke="hsl(var(--primary))" 
                name="SNR (dB)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Uplink Frequency Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Uplink Messages per Hour
          </h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={uplinkFrequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(val) => format(new Date(val), 'HH:00')}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Latest Reading */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Latest Reading
          </h4>
          {lastSeenAt ? (
            <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Timestamp</p>
                <p className="font-medium text-sm">
                  {format(new Date(lastSeenAt), 'PPpp')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Value</p>
                <p className="font-medium text-sm">
                  23.5 °C
                </p>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertDescription>No readings received yet</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
