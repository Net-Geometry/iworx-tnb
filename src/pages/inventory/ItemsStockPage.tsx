import { Package, Plus, Search, Filter, Download, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { AddItemDialog } from "@/components/inventory/AddItemDialog";

const ItemsStockPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const { data: rawInventoryItems = [], isLoading } = useInventoryItems();

  // Transform and filter data
  const inventoryItems = useMemo(() => {
    return rawInventoryItems
      .filter(item => {
        // Search filter
        if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !item.item_number?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Category filter
        if (selectedCategory !== "all" && item.category?.toLowerCase() !== selectedCategory) {
          return false;
        }
        
        return true;
      })
      .map(item => {
        // Calculate stock status
        const currentStock = item.current_stock || 0;
        const reorderPoint = item.reorder_point || 0;
        const availableStock = item.available_stock || 0;
        
        let status = "Normal";
        if (currentStock === 0) {
          status = "Out of Stock";
        } else if (currentStock <= reorderPoint) {
          status = "Low Stock";
        }
        
        // Apply status filter
        const statusFilterValue = selectedStatus.replace("-", " ").toLowerCase();
        if (selectedStatus !== "all" && status.toLowerCase() !== statusFilterValue) {
          return null;
        }
        
        return {
          id: item.id,
          itemNumber: item.item_number || "N/A",
          name: item.name,
          category: item.category || "Uncategorized",
          currentStock,
          reservedStock: item.reserved_stock || 0,
          availableStock,
          reorderPoint,
          unitCost: item.unit_cost || 0,
          supplier: (item as any).suppliers?.name || "No Supplier",
          location: (item as any).inventory_item_locations?.[0]?.inventory_locations?.name || "No Location",
          status
        };
      })
      .filter(Boolean);
  }, [rawInventoryItems, searchTerm, selectedCategory, selectedStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Normal":
        return <Badge variant="default">Normal</Badge>;
      case "Low Stock":
        return <Badge variant="secondary">Low Stock</Badge>;
      case "Out of Stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Items & Stock</h1>
            <p className="text-muted-foreground">Manage inventory items and track stock levels</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Items
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="hydraulics">Hydraulics</SelectItem>
                <SelectItem value="bearings">Bearings</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="couplings">Couplings</SelectItem>
                <SelectItem value="filters">Filters</SelectItem>
                <SelectItem value="motors">Motors</SelectItem>
                <SelectItem value="pumps">Pumps</SelectItem>
                <SelectItem value="valves">Valves</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>Complete list of inventory items with stock information</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Reorder Point</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading items...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : inventoryItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  inventoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemNumber}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>{item.availableStock}</TableCell>
                      <TableCell>{item.reorderPoint}</TableCell>
                      <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Adjust Stock</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <div className="text-xs text-muted-foreground">Active inventory items</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Current stock value</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {inventoryItems.filter(item => item.status === "Low Stock" || item.status === "Out of Stock").length}
            </div>
            <div className="text-xs text-muted-foreground">Require attention</div>
          </CardContent>
        </Card>
      </div>

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
};

export default ItemsStockPage;