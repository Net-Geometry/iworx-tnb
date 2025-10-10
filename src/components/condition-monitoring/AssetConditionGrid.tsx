import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useMonitoredAssets } from '@/hooks/useConditionMonitoring';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, AlertTriangle, MapPin, Activity } from 'lucide-react';

interface AssetConditionGridProps {
  onAssetSelect: (assetId: string) => void;
  selectedAssetId?: string | null;
}

export function AssetConditionGrid({ onAssetSelect, selectedAssetId }: AssetConditionGridProps) {
  const { data: assets, isLoading } = useMonitoredAssets();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No monitored assets found</p>
        <p className="text-sm mt-2">Add IoT devices to assets to start monitoring</p>
      </div>
    );
  }

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'critical':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Critical
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="flex items-center gap-1 bg-yellow-500/10 text-yellow-700 border-yellow-200">
            <AlertCircle className="w-3 h-3" />
            Warning
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/10 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3" />
            Healthy
          </Badge>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assets.map((asset: any) => (
        <Card
          key={asset.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedAssetId === asset.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onAssetSelect(asset.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{asset.name}</h3>
                <p className="text-sm text-muted-foreground">{asset.asset_number}</p>
              </div>
              {getConditionBadge(asset.condition)}
            </div>

            {asset.active_alarms_count > 0 && (
              <div className="text-sm text-red-600 font-medium mb-2">
                {asset.active_alarms_count} active alarm{asset.active_alarms_count > 1 ? 's' : ''}
              </div>
            )}

            <div className="space-y-1">
              {asset.latest_readings?.slice(0, 3).map((reading: any, idx: number) => (
                <div key={idx} className="text-sm flex justify-between">
                  <span className="text-muted-foreground">{reading.metric_name}:</span>
                  <span className="font-medium">
                    {reading.value} {reading.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
