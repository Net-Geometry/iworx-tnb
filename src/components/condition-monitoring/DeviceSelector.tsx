import { useIoTDevicesByAsset } from '@/hooks/useIoTDevicesByAsset';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface DeviceSelectorProps {
  assetId?: string;
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function DeviceSelector({ assetId, value, onValueChange, disabled }: DeviceSelectorProps) {
  const { data: devices, isLoading } = useIoTDevicesByAsset(assetId);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const isDisabled = disabled || !assetId || !devices || devices.length === 0;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={isDisabled}>
      <SelectTrigger>
        <SelectValue placeholder={!assetId ? "Select asset first" : "Select device (optional)"} />
      </SelectTrigger>
      <SelectContent className="bg-background">
        {devices && devices.map((device) => (
          <SelectItem key={device.id} value={device.id}>
            <div className="flex items-center gap-2">
              <span>{device.device_name}</span>
              {device.status === 'active' && (
                <Badge variant="secondary" className="text-xs">Active</Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
