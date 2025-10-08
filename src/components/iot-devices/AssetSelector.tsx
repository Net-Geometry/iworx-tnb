/**
 * Asset Selector for IoT Devices
 * 
 * Searchable dropdown to link an IoT device to a physical asset
 */

import { useState } from "react";
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

interface AssetSelectorProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  organizationId?: string;
}

export function AssetSelector({ value, onValueChange, organizationId }: AssetSelectorProps) {
  const [open, setOpen] = useState(false);
  const { assets = [], loading } = useAssets();

  const selectedAsset = assets.find((asset) => asset.id === value);

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
            "Select asset to monitor (optional)..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-50 bg-popover" align="start">
        <Command>
          <CommandInput placeholder="Search assets..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading assets..." : "No assets found."}
            </CommandEmpty>
            <CommandGroup>
              {/* Option to clear selection */}
              {value && (
                <CommandItem
                  value="none"
                  onSelect={() => {
                    onValueChange(undefined);
                    setOpen(false);
                  }}
                >
                  <span className="text-muted-foreground">— No Asset —</span>
                </CommandItem>
              )}
              {assets.map((asset) => (
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
