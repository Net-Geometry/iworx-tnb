import { useAssets } from '@/hooks/useAssets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface AssetSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function AssetSelector({ value, onValueChange, disabled }: AssetSelectorProps) {
  const { assets, loading } = useAssets(true);

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select an asset" />
      </SelectTrigger>
      <SelectContent className="bg-background">
        {assets.map((asset) => (
          <SelectItem key={asset.id} value={asset.id}>
            {asset.name} {asset.asset_number ? `(${asset.asset_number})` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
