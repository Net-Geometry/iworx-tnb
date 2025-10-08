/**
 * IoT Device Card Component
 * 
 * Card view for displaying individual IoT device information
 */

import { Radio } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface IoTDevice {
  id: string;
  device_name: string;
  dev_eui: string;
  status: string;
  last_seen_at?: string;
  device_type?: {
    name: string;
    manufacturer?: string;
    model?: string;
  };
  asset?: {
    id: string;
    name: string;
    asset_number: string;
  };
}

interface IoTDeviceCardProps {
  device: IoTDevice;
  onEdit?: (device: IoTDevice) => void;
  onDelete?: (deviceId: string) => void;
}

function IoTDeviceStatusBadge({ device }: { device: IoTDevice }) {
  if (device.status === 'inactive') {
    return <Badge variant="secondary">Inactive</Badge>;
  }
  
  if (device.status === 'error') {
    return <Badge variant="destructive">Error</Badge>;
  }

  if (!device.last_seen_at) {
    return <Badge variant="destructive">Never Seen</Badge>;
  }

  const minutesSinceLastSeen = (Date.now() - new Date(device.last_seen_at).getTime()) / 60000;

  if (minutesSinceLastSeen > 1440) {
    return <Badge variant="destructive">Offline</Badge>;
  }
  
  if (minutesSinceLastSeen > 60) {
    return <Badge className="bg-warning text-warning-foreground">Stale</Badge>;
  }

  return <Badge className="bg-accent-success text-accent-success-foreground">Online</Badge>;
}

function formatDevEUI(devEui: string): string {
  return devEui.match(/.{1,2}/g)?.join(':') || devEui;
}

export function IoTDeviceCard({ device, onEdit, onDelete }: IoTDeviceCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-muted-foreground" />
            <span>{device.device_name}</span>
          </div>
          <IoTDeviceStatusBadge device={device} />
        </CardTitle>
        <CardDescription>
          DevEUI: <code className="text-xs">{formatDevEUI(device.dev_eui)}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Device Type */}
        <div>
          <p className="text-xs text-muted-foreground">Device Type</p>
          <p className="text-sm font-medium">
            {device.device_type?.name || "No type configured"}
          </p>
          {device.device_type?.manufacturer && device.device_type?.model && (
            <p className="text-xs text-muted-foreground">
              {device.device_type.manufacturer} {device.device_type.model}
            </p>
          )}
        </div>

        {/* Linked Asset */}
        {device.asset && (
          <div>
            <p className="text-xs text-muted-foreground">Linked Asset</p>
            <Link 
              to={`/assets/${device.asset.id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {device.asset.name} ({device.asset.asset_number})
            </Link>
          </div>
        )}

        {/* Last Seen */}
        <div>
          <p className="text-xs text-muted-foreground">Last Seen</p>
          <p className="text-sm font-medium">
            {device.last_seen_at 
              ? formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })
              : "Never"
            }
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/iot-devices/${device.id}`}>View Data</Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit?.(device)}>
          Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onDelete?.(device.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
