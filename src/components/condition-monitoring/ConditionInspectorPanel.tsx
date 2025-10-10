import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssetConditionStatus } from '@/hooks/useConditionMonitoring';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle } from 'lucide-react';

interface ConditionInspectorPanelProps {
  assetId: string | null;
}

export function ConditionInspectorPanel({ assetId }: ConditionInspectorPanelProps) {
  const { data: status, isLoading } = useAssetConditionStatus(assetId || undefined);

  if (!assetId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Select an asset to view details</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Failed to load asset status</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Asset Condition</span>
          <Badge variant={
            status.condition === 'critical' ? 'destructive' :
            status.condition === 'warning' ? 'default' : 'secondary'
          }>
            {status.condition}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Asset Details</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{status.asset?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span>{status.asset?.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span>{status.asset?.status}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Active Alarms</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Critical:</span>
              <Badge variant="destructive">{status.critical_alarms_count}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Warning:</span>
              <Badge className="bg-yellow-500/10 text-yellow-700">
                {status.warning_alarms_count}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Recent Readings</h3>
          <div className="space-y-1 text-sm">
            {status.recent_readings?.slice(0, 5).map((reading: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span className="text-muted-foreground">{reading.metric_name}:</span>
                <span className="font-medium">{reading.value} {reading.unit}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">IoT Devices ({status.devices?.length || 0})</h3>
          <div className="space-y-1 text-sm">
            {status.devices?.map((device: any) => (
              <div key={device.id} className="flex justify-between">
                <span className="text-muted-foreground">{device.device_name}</span>
                <Badge variant={device.status === 'active' ? 'secondary' : 'outline'}>
                  {device.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
