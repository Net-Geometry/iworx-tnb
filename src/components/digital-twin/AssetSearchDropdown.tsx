/**
 * Asset Search Dropdown for Digital Twin
 * 
 * Searchable dropdown to select and focus on specific assets in 3D view
 */

import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useAssets } from "@/hooks/useAssets";
import { StatusBadge } from "@/components/assets/StatusBadge";
import { HealthIndicator } from "@/components/assets/HealthIndicator";

interface AssetSearchDropdownProps {
  value?: string | null;
  onValueChange: (value: string | null) => void;
}

export function AssetSearchDropdown({ value, onValueChange }: AssetSearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const { assets = [], loading } = useAssets();

  const selectedAsset = assets.find((asset) => asset.id === value);

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-auto py-3"
            >
              {selectedAsset ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-medium truncate">
                      {selectedAsset.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {selectedAsset.asset_number && (
                        <span>{selectedAsset.asset_number}</span>
                      )}
                      {selectedAsset.type && (
                        <>
                          <span>•</span>
                          <span>{selectedAsset.type}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={selectedAsset.status} />
                    {selectedAsset.health_score !== undefined && (
                      <HealthIndicator score={selectedAsset.health_score} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Search and select an asset...</span>
                </div>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[600px] p-0 z-50 bg-popover" align="start">
            <Command>
              <CommandInput placeholder="Search by asset name or number..." />
              <CommandList>
                <CommandEmpty>
                  {loading ? "Loading assets..." : "No assets found."}
                </CommandEmpty>
                <CommandGroup>
                  {/* Option to clear selection and show all */}
                  {value && (
                    <CommandItem
                      value="none"
                      onSelect={() => {
                        onValueChange(null);
                        setOpen(false);
                      }}
                      className="border-b"
                    >
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Clear selection - Show all assets
                      </span>
                    </CommandItem>
                  )}
                  {assets
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((asset) => (
                    <CommandItem
                      key={asset.id}
                      value={`${asset.name} ${asset.asset_number || ''}`}
                      onSelect={() => {
                        onValueChange(asset.id === value ? null : asset.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === asset.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center justify-between flex-1 gap-3">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium truncate">{asset.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {asset.asset_number && (
                              <span>{asset.asset_number}</span>
                            )}
                            {asset.type && (
                              <>
                                <span>•</span>
                                <span className="truncate">{asset.type}</span>
                              </>
                            )}
                            {asset.location && (
                              <>
                                <span>•</span>
                                <span className="truncate">{asset.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={asset.status} />
                          {asset.health_score !== undefined && (
                            <HealthIndicator score={asset.health_score} />
                          )}
                          {asset.model_3d_url && (
                            <Badge variant="secondary" className="text-xs">
                              3D
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Info text */}
      <div className="text-sm text-muted-foreground hidden md:block">
        {assets.length} {assets.length === 1 ? 'asset' : 'assets'} available
      </div>
    </div>
  );
}
