import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, AlertCircle } from "lucide-react";
import { useAssetBOMs } from "@/hooks/useBOMs";
import { useBOMItems } from "@/hooks/useBOMs";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

/**
 * PMScheduleBOMView Component
 * Displays BOMs assigned to the selected asset with quantity planning
 */

interface PMScheduleBOMViewProps {
  assetId?: string;
  plannedQuantities?: Array<{ bomItemId: string; quantity: number }>;
  onQuantitiesChange?: (quantities: Array<{ bomItemId: string; quantity: number }>) => void;
  onMaterialsChange?: (materials: Array<{ bomItemId: string; quantity: number; estimatedCost: number }>) => void;
}

export const PMScheduleBOMView = ({ 
  assetId, 
  plannedQuantities = [],
  onQuantitiesChange,
  onMaterialsChange 
}: PMScheduleBOMViewProps) => {
  const { assetBOMs, loading: bomsLoading } = useAssetBOMs(assetId);
  const primaryBOM = assetBOMs?.find(ab => ab.is_primary)?.bom || assetBOMs?.[0]?.bom;
  const { items: bomItems, loading: itemsLoading } = useBOMItems(primaryBOM?.id);
  const { data: inventoryItems = [] } = useInventoryItems();
  
  const quantities = plannedQuantities.reduce((acc, item) => {
    acc[item.bomItemId] = item.quantity;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total estimated cost
  const calculateTotalCost = () => {
    return bomItems.reduce((total, item) => {
      const qty = quantities[item.id] || item.quantity;
      const cost = item.cost_per_unit || 0;
      return total + (qty * cost);
    }, 0);
  };

  // Handle quantity change
  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseFloat(value) || 0;
    
    const updatedQuantities = [...plannedQuantities];
    const existingIndex = updatedQuantities.findIndex(q => q.bomItemId === itemId);
    
    if (existingIndex >= 0) {
      updatedQuantities[existingIndex] = { bomItemId: itemId, quantity };
    } else {
      updatedQuantities.push({ bomItemId: itemId, quantity });
    }
    
    if (onQuantitiesChange) {
      onQuantitiesChange(updatedQuantities);
    }
    
    if (onMaterialsChange && bomItems) {
      const materials = bomItems.map(item => ({
        bomItemId: item.id,
        quantity: updatedQuantities.find(q => q.bomItemId === item.id)?.quantity || item.quantity,
        estimatedCost: (updatedQuantities.find(q => q.bomItemId === item.id)?.quantity || item.quantity) * (item.cost_per_unit || 0)
      }));
      onMaterialsChange(materials);
    }
  };

  // Get stock status
  const getStockStatus = (bomItem: any) => {
    if (!bomItem.inventory_item_id) return null;
    
    const inventoryItem = inventoryItems.find(i => i.id === bomItem.inventory_item_id);
    if (!inventoryItem) return null;

    const required = quantities[bomItem.id] || bomItem.quantity;
    const available = inventoryItem.available_stock || 0;

    if (available >= required) {
      return { status: "In Stock", variant: "default" as const };
    } else if (available > 0) {
      return { status: `Low (${available} available)`, variant: "secondary" as const };
    } else {
      return { status: "Out of Stock", variant: "destructive" as const };
    }
  };

  if (!assetId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mb-4 opacity-50" />
            <p>Please select an asset to view associated BOMs</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bomsLoading || itemsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!primaryBOM || bomItems.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-center">No BOM assigned to this asset.<br />Please assign a BOM to the asset first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Materials & BOM
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Total Cost: <span className="font-semibold text-foreground">${calculateTotalCost().toFixed(2)}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          BOM: {primaryBOM.name} (v{primaryBOM.version})
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Planned Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Stock Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bomItems.map((item) => {
              const qty = quantities[item.id] || item.quantity;
              const unitCost = item.cost_per_unit || 0;
              const totalCost = qty * unitCost;
              const stockStatus = getStockStatus(item);

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.item_name}</div>
                      {item.item_number && (
                        <div className="text-xs text-muted-foreground">{item.item_number}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.item_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={quantities[item.id] || item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>${unitCost.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">${totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    {stockStatus && (
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.status}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
