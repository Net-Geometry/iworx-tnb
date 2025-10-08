/**
 * IoT Device Table Component
 * 
 * Displays IoT devices in a sortable, actionable table
 */

import { Radio, MoreVertical } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  };
  asset?: {
    id: string;
    name: string;
    asset_number: string;
  };
}

interface IoTDeviceTableProps {
  devices: IoTDevice[];
  isLoading?: boolean;
  onEdit?: (device: IoTDevice) => void;
}

function IoTDeviceStatusBadge({ device }: { device: IoTDevice }) {
  if (device.status === 'inactive') {
    return <Badge variant="secondary">Inactive</Badge>;
  }
  
  if (device.status === 'error') {
    return <Badge variant="destructive">Error</Badge>;
  }

  // Active device - check last seen
  if (!device.last_seen_at) {
    return <Badge variant="destructive">Never Seen</Badge>;
  }

  const minutesSinceLastSeen = (Date.now() - new Date(device.last_seen_at).getTime()) / 60000;

  if (minutesSinceLastSeen > 1440) { // 24 hours
    return <Badge variant="destructive">Offline</Badge>;
  }
  
  if (minutesSinceLastSeen > 60) { // 1 hour
    return <Badge className="bg-warning text-warning-foreground">Stale</Badge>;
  }

  return <Badge className="bg-accent-success text-accent-success-foreground">Online</Badge>;
}

function formatDevEUI(devEui: string): string {
  // Format as AA:BB:CC:DD:EE:FF:00:11
  return devEui.match(/.{1,2}/g)?.join(':') || devEui;
}

export function IoTDeviceTable({ devices, isLoading, onEdit }: IoTDeviceTableProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading devices...</div>;
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-12">
        <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No IoT Devices</h3>
        <p className="text-muted-foreground">
          Register your first IoT device to start collecting sensor data
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device Name</TableHead>
            <TableHead>DevEUI</TableHead>
            <TableHead>Device Type</TableHead>
            <TableHead>Linked Asset</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{device.device_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {formatDevEUI(device.dev_eui)}
                </code>
              </TableCell>
              <TableCell>
                {device.device_type?.name || <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                {device.asset ? (
                  <Link 
                    to={`/assets/${device.asset.id}`} 
                    className="text-primary hover:underline"
                  >
                    {device.asset.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <IoTDeviceStatusBadge device={device} />
              </TableCell>
              <TableCell>
                {device.last_seen_at ? (
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">Never</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(device)}>
                      Edit Configuration
                    </DropdownMenuItem>
                    <DropdownMenuItem>Configure Meter Mapping</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete Device
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
