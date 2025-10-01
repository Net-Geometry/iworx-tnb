import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAssets } from "@/hooks/useAssets";

interface RouteAssetSelectorProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  excludeAssetIds?: string[];
}

/**
 * Asset selector component for routes
 * Allows selecting an asset while excluding already assigned assets
 */
export function RouteAssetSelector({
  value,
  onValueChange,
  excludeAssetIds = [],
}: RouteAssetSelectorProps) {
  const [open, setOpen] = useState(false);
  const { assets = [], loading } = useAssets();

  // Filter out excluded assets
  const availableAssets = useMemo(() => {
    return assets.filter((asset) => !excludeAssetIds.includes(asset.id));
  }, [assets, excludeAssetIds]);

  const selectedAsset = availableAssets.find((asset) => asset.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedAsset ? (
            <span className="truncate">
              {selectedAsset.name}
              {selectedAsset.asset_number && ` (${selectedAsset.asset_number})`}
            </span>
          ) : (
            "Select asset..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search assets..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading assets..." : "No assets found."}
            </CommandEmpty>
            <CommandGroup>
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
                  <div className="flex flex-col">
                    <span>{asset.name}</span>
                    {asset.asset_number && (
                      <span className="text-xs text-muted-foreground">
                        {asset.asset_number}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
