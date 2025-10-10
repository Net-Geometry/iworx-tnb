import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IoTDevice } from "@/types/iot";

interface IoTDeviceConfigTabProps {
  device: IoTDevice;
}

export const IoTDeviceConfigTab = ({ device }: IoTDeviceConfigTabProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Device Configuration</CardTitle>
          <CardDescription>Network and device settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Device Identifier</p>
              <p className="font-mono text-sm">{device.device_identifier}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">DevEUI</p>
              <p className="font-mono text-sm">{device.dev_eui}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Network Provider</p>
              <Badge variant="outline">{device.network_provider.toUpperCase()}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                {device.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LoRaWAN Configuration</CardTitle>
          <CardDescription>LoRaWAN network settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {device.lorawan_config.app_eui && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">AppEUI</p>
                <p className="font-mono text-sm">{device.lorawan_config.app_eui}</p>
              </div>
            )}
            {device.lorawan_config.join_eui && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">JoinEUI</p>
                <p className="font-mono text-sm">{device.lorawan_config.join_eui}</p>
              </div>
            )}
            {device.lorawan_config.frequency_plan && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Frequency Plan</p>
                <p className="text-sm">{device.lorawan_config.frequency_plan}</p>
              </div>
            )}
            {device.lorawan_config.activation_mode && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activation Mode</p>
                <Badge variant="secondary">{device.lorawan_config.activation_mode}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {device.device_type && (
        <Card>
          <CardHeader>
            <CardTitle>Device Type</CardTitle>
            <CardDescription>Device type information and capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-sm">{device.device_type.name}</p>
              </div>
              {device.device_type.manufacturer && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                  <p className="text-sm">{device.device_type.manufacturer}</p>
                </div>
              )}
              {device.device_type.model && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Model</p>
                  <p className="text-sm">{device.device_type.model}</p>
                </div>
              )}
            </div>
            {device.device_type.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{device.device_type.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
