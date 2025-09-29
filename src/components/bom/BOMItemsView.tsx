import { useState } from "react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BOMItemForm } from "./BOMItemForm";
import { useBOMItems, BOMItem } from "@/hooks/useBOMs";

interface BOMItemsViewProps {
  bomId: string;
}

export const BOMItemsView = ({ bomId }: BOMItemsViewProps) => {
  const { items, loading, deleteBOMItem, refetch } = useBOMItems(bomId);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BOMItem | null>(null);

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteBOMItem(itemId);
    } catch (error) {
      console.error('Failed to delete BOM item:', error);
    }
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'part': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'material': return 'bg-green-100 text-green-800 border-green-200';
      case 'tool': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'consumable': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateTotalCost = (item: BOMItem) => {
    const cost = item.cost_per_unit || 0;
    const quantity = item.quantity || 0;
    return cost * quantity;
  };

  const totalBOMCost = items.reduce((sum, item) => sum + calculateTotalCost(item), 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
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
            BOM Items ({items.length})
          </CardTitle>
          <div className="flex items-center gap-4">
            {totalBOMCost > 0 && (
              <div className="text-sm text-muted-foreground">
                Total Cost: <span className="font-medium">${totalBOMCost.toFixed(2)}</span>
              </div>
            )}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add BOM Item</DialogTitle>
                </DialogHeader>
                <BOMItemForm 
                  bomId={bomId}
                  onSuccess={() => {
                    setAddDialogOpen(false);
                    refetch();
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Items Added</h3>
            <p className="text-muted-foreground mb-4">
              Start building your BOM by adding parts, materials, tools, or consumables.
            </p>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add BOM Item</DialogTitle>
                </DialogHeader>
                <BOMItemForm 
                  bomId={bomId}
                  onSuccess={() => {
                    setAddDialogOpen(false);
                    refetch();
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Item Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.item_name}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.item_number || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getItemTypeColor(item.item_type)}>
                        {item.item_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">
                      {item.cost_per_unit ? `$${item.cost_per_unit.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.cost_per_unit ? `$${calculateTotalCost(item).toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>{item.supplier || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Dialog open={editingItem?.id === item.id} onOpenChange={(open) => setEditingItem(open ? item : null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit BOM Item</DialogTitle>
                            </DialogHeader>
                            <BOMItemForm 
                              bomId={bomId}
                              item={editingItem || undefined}
                              onSuccess={() => {
                                setEditingItem(null);
                                refetch();
                              }} 
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete BOM Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.item_name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};