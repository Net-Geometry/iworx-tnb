/**
 * IoT Device Details Modal
 * 
 * Read-only view of IoT device information
 */

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Radio, Activity, MapPin, Clock, Link as LinkIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface IoTDeviceDetailsModalProps {
  device: any;
  isOpen: boolean;
  onClose: () => void;
}

export function IoTDeviceDetailsModal({ device, isOpen, onClose }: IoTDeviceDetailsModalProps) {
  if (!device) return null;

  const formatDevEUI = (devEui: string) => {
    return devEui.match(/.{1,2}/g)?.join(':').toUpperCase() || devEui;
  };

  const getStatusInfo = () => {
    if (device.status !== 'active') {
      return { label: device.status === 'inactive' ? 'Inactive' : 'Error', variant: 'secondary' as const };
    }
    if (!device.last_seen_at) {
      return { label: 'Never Seen', variant: 'secondary' as const };
    }
    const minutesSince = (Date.now() - new Date(device.last_seen_at).getTime()) / 60000;
    if (minutesSince < 60) return { label: 'Online', variant: 'default' as const };
    if (minutesSince < 1440) return { label: 'Stale', variant: 'secondary' as const };
    return { label: 'Offline', variant: 'destructive' as const };
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            {device.device_name}
          </DialogTitle>
          <DialogDescription>
            IoT Device Details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            {device.last_seen_at && (
              <span className="text-sm text-muted-foreground">
                Last seen {formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })}
              </span>
            )}
          </div>

          <Separator />

          {/* Device Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Device Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Device Name</Label>
                <p className="text-sm font-medium">{device.device_name}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Device EUI</Label>
                <p className="text-sm font-mono">{formatDevEUI(device.dev_eui)}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Network Provider</Label>
                <p className="text-sm font-medium uppercase">{device.network_provider}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Status</Label>
                <p className="text-sm font-medium capitalize">{device.status}</p>
              </div>
            </div>
          </div>

          {/* Device Type */}
          {device.device_type && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Device Type
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Type Name</Label>
                    <p className="text-sm font-medium">{device.device_type.name}</p>
                  </div>

                  {device.device_type.manufacturer && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Manufacturer</Label>
                      <p className="text-sm font-medium">{device.device_type.manufacturer}</p>
                    </div>
                  )}

                  {device.device_type.model && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Model</Label>
                      <p className="text-sm font-medium">{device.device_type.model}</p>
                    </div>
                  )}

                  {device.device_type.description && (
                    <div className="space-y-1 col-span-2">
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="text-sm">{device.device_type.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Linked Asset */}
          {device.asset && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Linked Asset
                </h3>
                
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Asset</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {device.asset.name} ({device.asset.asset_number})
                    </p>
                    <Link to={`/assets/${device.asset.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <LinkIcon className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Connection History */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Connection History
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Created</Label>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(device.created_at), { addSuffix: true })}
                </p>
              </div>

              {device.last_seen_at && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Last Seen</Label>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* LoRaWAN Configuration */}
          {device.lorawan_config && Object.keys(device.lorawan_config).length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">LoRaWAN Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {device.lorawan_config.activation_mode && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Activation Mode</Label>
                      <p className="text-sm font-medium">{device.lorawan_config.activation_mode}</p>
                    </div>
                  )}

                  {device.lorawan_config.frequency_plan && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Frequency Plan</Label>
                      <p className="text-sm font-medium">{device.lorawan_config.frequency_plan}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
