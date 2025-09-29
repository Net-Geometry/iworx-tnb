import { Package, Plus, Search, Filter, Download, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ItemsStockPage = () => {
  // Mock data for demonstration
  const inventoryItems = [
    {
      id: "1",
      itemNumber: "HYD-001",
      name: "Hydraulic Pump Seal",
      category: "Hydraulics",
      currentStock: 15,
      reservedStock: 3,
      availableStock: 12,
      reorderPoint: 5,
      unitCost: 45.99,
      supplier: "Industrial Parts Co",
      location: "Warehouse A",
      status: "Normal"
    },
    {
      id: "2", 
      itemNumber: "BRG-205",
      name: "Motor Bearing 6205",
      category: "Bearings",
      currentStock: 8,
      reservedStock: 0,
      availableStock: 8,
      reorderPoint: 10,
      unitCost: 12.50,
      supplier: "Bearing Solutions",
      location: "Warehouse A",
      status: "Low Stock"
    },
    {
      id: "3",
      itemNumber: "SAF-100", 
      name: "Safety Valve Spring",
      category: "Safety",
      currentStock: 0,
      reservedStock: 0,
      availableStock: 0,
      reorderPoint: 3,
      unitCost: 8.75,
      supplier: "Safety First Ltd",
      location: "Warehouse B",
      status: "Out of Stock"
    },
    {
      id: "4",
      itemNumber: "COU-050",
      name: "Coupling Insert", 
      category: "Couplings",
      currentStock: 25,
      reservedStock: 2,
      availableStock: 23,
      reorderPoint: 8,
      unitCost: 22.00,
      supplier: "Power Transmission Inc",
      location: "Warehouse A", 
      status: "Normal"
    },
    {
      id: "5",
      itemNumber: "FIL-200",
      name: "Oil Filter Element",
      category: "Filters",
      currentStock: 50,
      reservedStock: 5,
      availableStock: 45,
      reorderPoint: 20,
      unitCost: 15.25,
      supplier: "Filter Tech Corp",
      location: "Warehouse C",
      status: "Normal"
    }
  ];

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
          <Button size="sm">
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
              />
            </div>
            <Select>
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
              </SelectContent>
            </Select>
            <Select>
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
            <Button variant="outline">
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
                {inventoryItems.map((item) => (
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
                ))}
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
    </div>
  );
};

export default ItemsStockPage;