/**
 * Asset IoT Devices Tab
 * 
 * Shows all IoT devices monitoring a specific asset
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, ExternalLink, Plus } from "lucide-react";
import { useAssetIoTDevices } from "@/hooks/useAssetIoTDevices";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface AssetIoTDevicesTabProps {
  assetId: string;
}

export function AssetIoTDevicesTab({ assetId }: AssetIoTDevicesTabProps) {
  const navigate = useNavigate();
  const { data: devices = [], isLoading } = useAssetIoTDevices(assetId);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading IoT devices...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">IoT Devices Monitoring This Asset</h3>
          <p className="text-sm text-muted-foreground">
            Real-time sensors and devices collecting data from this asset
          </p>
        </div>
        <Button onClick={() => navigate('/iot-devices')}>
          <Plus className="h-4 w-4 mr-2" />
          Assign Device
        </Button>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">No IoT Devices Assigned</h4>
            <p className="text-muted-foreground mb-4">
              This asset is not being monitored by any IoT devices
            </p>
            <Button variant="outline" onClick={() => navigate('/iot-devices')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to IoT Devices
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device: any) => (
            <Card key={device.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{device.device_name}</CardTitle>
                      <CardDescription className="text-xs">
                        {device.device_type?.name || 'No type specified'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                    {device.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">DevEUI:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {device.dev_eui}
                  </code>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="font-medium">{device.network_provider.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Seen:</span>
                  <span className="font-medium">
                    {device.last_seen_at 
                      ? formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })
                      : 'Never'
                    }
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => navigate('/iot-devices')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Device Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
