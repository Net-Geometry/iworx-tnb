import { useState, useMemo } from "react";
import { Check, Search, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useInventoryItems, InventoryItem } from "@/hooks/useInventoryItems";

interface InventoryItemSelectorProps {
  selectedItem: InventoryItem | null;
  onSelectItem: (item: InventoryItem | null) => void;
  className?: string;
}

export const InventoryItemSelector = ({ selectedItem, onSelectItem, className }: InventoryItemSelectorProps) => {
  const { data: inventoryItems = [], isLoading } = useInventoryItems();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(inventoryItems.map(item => item.category).filter(Boolean));
    return Array.from(cats);
  }, [inventoryItems]);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      if (!item.is_active) return false;
      
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [inventoryItems, searchTerm, selectedCategory]);

  const getStockStatus = (item: InventoryItem) => {
    const stock = item.current_stock || 0;
    const reorderPoint = item.reorder_point || 0;
    
    if (stock <= 0) return { status: "out", label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (stock <= reorderPoint) return { status: "low", label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { status: "in", label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-sm font-medium">Select Inventory Item</div>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Select from Inventory</label>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedItem ? (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="truncate">{selectedItem.name}</span>
                  {selectedItem.item_number && (
                    <span className="text-muted-foreground">({selectedItem.item_number})</span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">Search inventory items...</span>
              )}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <div className="flex items-center gap-2 p-3 border-b">
                <CommandInput
                  placeholder="Search items..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  className="flex-1"
                />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CommandList>
                <CommandEmpty>No inventory items found.</CommandEmpty>
                <CommandGroup>
                  {filteredItems.map((item) => {
                    const stockInfo = getStockStatus(item);
                    return (
                      <CommandItem
                        key={item.id}
                        value={`${item.name} ${item.item_number || ''} ${item.description || ''}`}
                        onSelect={() => {
                          onSelectItem(item);
                          setOpen(false);
                        }}
                        className="flex items-center justify-between p-3"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.item_number && <span>#{item.item_number} • </span>}
                              {item.category && <span>{item.category}</span>}
                            </div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            <Badge className={stockInfo.color} variant="outline">
                              {stockInfo.label}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              Stock: {item.current_stock || 0} {item.unit_of_measure}
                            </div>
                            {item.unit_cost && (
                              <div className="text-xs text-muted-foreground">
                                ${item.unit_cost.toFixed(2)}/{item.unit_of_measure}
                              </div>
                            )}
                          </div>
                        </div>
                        <Check
                          className={cn(
                            "ml-3 h-4 w-4",
                            selectedItem?.id === item.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedItem && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">{selectedItem.name}</span>
                  {selectedItem.item_number && (
                    <Badge variant="outline">#{selectedItem.item_number}</Badge>
                  )}
                </div>
                {selectedItem.description && (
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Category: {selectedItem.category || 'Uncategorized'}</span>
                  <span>Unit: {selectedItem.unit_of_measure}</span>
                  {selectedItem.unit_cost && (
                    <span>Cost: ${selectedItem.unit_cost.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <div className="text-right space-y-1">
                <Badge className={getStockStatus(selectedItem).color} variant="outline">
                  {getStockStatus(selectedItem).label}
                </Badge>
                <div className="text-sm">
                  <div>Stock: {selectedItem.current_stock || 0} {selectedItem.unit_of_measure}</div>
                  {selectedItem.current_stock && selectedItem.current_stock <= (selectedItem.reorder_point || 0) && (
                    <div className="flex items-center gap-1 text-yellow-600 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      Below reorder point
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectItem(null)}
                className="text-xs"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};