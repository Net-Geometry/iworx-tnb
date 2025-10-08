/**
 * Asset Inspector Panel Component
 * 
 * Right sidebar showing detailed asset information and real-time data
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, TrendingUp, Wrench } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import { useRealtimeIoTData } from '@/hooks/useRealtimeIoTData';

interface AssetInspectorPanelProps {
  assetId: string | null;
  showLiveData?: boolean;
  onClose: () => void;
}

export function AssetInspectorPanel({
  assetId,
  showLiveData = false,
  onClose,
}: AssetInspectorPanelProps) {
  const { assets } = useAssets();
  const { readings } = useRealtimeIoTData(assetId ? [assetId] : []);

  const asset = assets.find(a => a.id === assetId);

  if (!assetId || !asset) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Select an asset to view details
        </CardContent>
      </Card>
    );
  }

  const assetReadings = readings[assetId] || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{asset.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{asset.asset_number}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant={asset.status === 'operational' ? 'default' : 'destructive'}
            className="text-xs"
          >
            {asset.status?.toUpperCase()}
          </Badge>
          {asset.health_score && (
            <Badge variant="outline" className="text-xs">
              Health: {asset.health_score}%
            </Badge>
          )}
        </div>

        {/* Asset Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium">{asset.type}</span>
          </div>
          {asset.category && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{asset.category}</span>
            </div>
          )}
          {asset.criticality && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Criticality:</span>
              <span className="font-medium">{asset.criticality}</span>
            </div>
          )}
        </div>

        {/* Live Sensor Data */}
        {showLiveData && assetReadings.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Live Sensor Data
            </h4>
            {assetReadings.slice(0, 4).map((reading) => (
              <div key={reading.id} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground capitalize">
                  {reading.sensor_type}:
                </span>
                <span className={`font-mono ${reading.alert_threshold_exceeded ? 'text-destructive font-bold' : ''}`}>
                  {reading.reading_value.toFixed(2)} {reading.unit}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t space-y-2">
          <Button className="w-full" size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            View History
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            <Wrench className="mr-2 h-4 w-4" />
            Create Work Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
