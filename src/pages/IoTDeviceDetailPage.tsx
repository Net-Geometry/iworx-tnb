import { useParams, useNavigate } from "react-router-dom";
import { useIoTDevice } from "@/hooks/useIoTDevice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Activity, Settings, History, Link as LinkIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { IoTDeviceLiveDataTab } from "@/components/iot-devices/IoTDeviceLiveDataTab";
import { IoTDeviceConfigTab } from "@/components/iot-devices/IoTDeviceConfigTab";
import { useIoTDeviceData } from "@/hooks/useIoTDevice";

export default function IoTDeviceDetailPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { data: device, isLoading } = useIoTDevice(deviceId);
  const { data: recentData = [] } = useIoTDeviceData(deviceId, 10);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Device Not Found</h2>
          <p className="text-muted-foreground">The device you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/iot-devices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Devices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/iot-devices')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Devices
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{device.device_name}</h1>
            <p className="text-muted-foreground">{device.device_identifier}</p>
          </div>
        </div>
        <Badge variant={device.status === 'active' ? 'default' : 'secondary'} className="text-sm">
          {device.status}
        </Badge>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className={`h-4 w-4 ${device.status === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-2xl font-bold">
                {device.status === 'active' ? 'Online' : 'Offline'}
              </span>
            </div>
            {device.last_seen_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Last seen {formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Device Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {device.device_type?.name || 'Generic'}
            </p>
            {device.device_type?.manufacturer && (
              <p className="text-xs text-muted-foreground mt-1">
                {device.device_type.manufacturer}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Linked Asset</CardTitle>
          </CardHeader>
          <CardContent>
            {device.asset ? (
              <div>
                <p className="text-2xl font-bold">{device.asset.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {device.asset.asset_number}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Not linked to any asset</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="live-data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live-data">
            <Activity className="h-4 w-4 mr-2" />
            Live Data
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Connection History
          </TabsTrigger>
          {device.asset && (
            <TabsTrigger value="mappings">
              <LinkIcon className="h-4 w-4 mr-2" />
              Meter Mappings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="live-data">
          <IoTDeviceLiveDataTab deviceId={device.id} />
        </TabsContent>

        <TabsContent value="configuration">
          <IoTDeviceConfigTab device={device} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Connection History</CardTitle>
              <CardDescription>Recent device connectivity events</CardDescription>
            </CardHeader>
            <CardContent>
              {recentData.length > 0 ? (
                <div className="space-y-2">
                  {recentData.map((data) => (
                    <div key={data.id} className="flex justify-between items-center p-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{data.metric_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(data.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {data.value} {data.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No connection history available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {device.asset && (
          <TabsContent value="mappings">
            <Card>
              <CardHeader>
                <CardTitle>Meter Mappings</CardTitle>
                <CardDescription>
                  IoT device to meter mappings for asset {device.asset.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Meter mappings interface (existing component can be integrated here)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
