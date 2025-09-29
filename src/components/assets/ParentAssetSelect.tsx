import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAssets } from '@/hooks/useAssets';
import { cn } from '@/lib/utils';

interface ParentAssetSelectProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  excludeAssetId?: string;
}

export const ParentAssetSelect: React.FC<ParentAssetSelectProps> = ({
  value,
  onValueChange,
  excludeAssetId
}) => {
  const [open, setOpen] = useState(false);
  const { assets, loading } = useAssets();

  const availableAssets = useMemo(() => {
    return assets.filter(asset => asset.id !== excludeAssetId);
  }, [assets, excludeAssetId]);

  const selectedAsset = availableAssets.find(asset => asset.id === value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Parent Asset (Optional)</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {selectedAsset ? selectedAsset.name : "Select parent asset..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search assets..." className="h-9" />
            <CommandList>
              <CommandEmpty>No assets found.</CommandEmpty>
              <CommandGroup>
                {value && (
                  <CommandItem
                    value="none"
                    onSelect={() => {
                      onValueChange(undefined);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <div className="ml-2">
                        <span className="text-muted-foreground">None (Remove parent)</span>
                      </div>
                    </div>
                  </CommandItem>
                )}
                {availableAssets.map((asset) => (
                  <CommandItem
                    key={asset.id}
                    value={asset.id}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? undefined : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === asset.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      {asset.asset_number && (
                        <div className="text-sm text-muted-foreground">
                          Tag: {asset.asset_number}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};