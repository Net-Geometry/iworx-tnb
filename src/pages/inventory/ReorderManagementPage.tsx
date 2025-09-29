import { RotateCcw, AlertTriangle, TrendingDown, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ReorderManagementPage = () => {
  // Mock data for demonstration
  const reorderItems = [
    {
      id: "1",
      itemNumber: "HYD-001",
      name: "Hydraulic Pump Seal",
      currentStock: 3,
      reorderPoint: 5,
      reorderQuantity: 20,
      leadTimeDays: 7,
      supplier: "Industrial Parts Co",
      unitCost: 45.99,
      safetyStock: 2,
      avgDemand: 2.5,
      status: "Below Reorder Point",
      suggestedAction: "Create PO"
    },
    {
      id: "2",
      name: "Motor Bearing 6205", 
      itemNumber: "BRG-205",
      currentStock: 0,
      reorderPoint: 10,
      reorderQuantity: 50,
      leadTimeDays: 14,
      supplier: "Bearing Solutions",
      unitCost: 12.50,
      safetyStock: 5,
      avgDemand: 8.2,
      status: "Out of Stock",
      suggestedAction: "Urgent PO"
    },
    {
      id: "3",
      itemNumber: "SAF-100",
      name: "Safety Valve Spring",
      currentStock: 1,
      reorderPoint: 3,
      reorderQuantity: 15,
      leadTimeDays: 5,
      supplier: "Safety First Ltd",
      unitCost: 8.75,
      safetyStock: 1,
      avgDemand: 1.8,
      status: "Critical Low",
      suggestedAction: "Immediate PO"
    },
    {
      id: "4",
      itemNumber: "FIL-200",
      name: "Oil Filter Element",
      currentStock: 18,
      reorderPoint: 20,
      reorderQuantity: 100,
      leadTimeDays: 10,
      supplier: "Filter Tech Corp",
      unitCost: 15.25,
      safetyStock: 8,
      avgDemand: 12.5,
      status: "Near Reorder Point",
      suggestedAction: "Monitor"
    }
  ];

  const reorderPolicies = [
    {
      category: "Hydraulics",
      method: "Min/Max",
      reviewCycle: "Weekly",
      activeItems: 15,
      avgLeadTime: 8
    },
    {
      category: "Bearings", 
      method: "Reorder Point",
      reviewCycle: "Daily",
      activeItems: 32,
      avgLeadTime: 12
    },
    {
      category: "Safety",
      method: "Fixed Order Quantity",
      reviewCycle: "Monthly",
      activeItems: 8,
      avgLeadTime: 6
    },
    {
      category: "Filters",
      method: "Economic Order Quantity",
      reviewCycle: "Bi-weekly", 
      activeItems: 22,
      avgLeadTime: 10
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Out of Stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      case "Critical Low":
        return <Badge variant="destructive">Critical Low</Badge>;
      case "Below Reorder Point":
        return <Badge variant="secondary">Below Reorder Point</Badge>;
      case "Near Reorder Point":
        return <Badge variant="outline">Near Reorder Point</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActionButton = (action: string) => {
    switch (action) {
      case "Urgent PO":
      case "Immediate PO":
        return <Button size="sm" variant="destructive">{action}</Button>;
      case "Create PO":
        return <Button size="sm">{action}</Button>;
      case "Monitor":
        return <Button size="sm" variant="outline">{action}</Button>;
      default:
        return <Button size="sm" variant="outline">{action}</Button>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <RotateCcw className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reorder Management</h1>
            <p className="text-muted-foreground">Automated reorder points, policies, and procurement planning</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Manage Policies
          </Button>
          <Button>Run Reorder Analysis</Button>
        </div>
      </div>

      {/* Alerts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {reorderItems.filter(item => item.status === "Out of Stock").length}
            </div>
            <div className="text-xs text-muted-foreground">Immediate attention required</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {reorderItems.filter(item => item.status === "Critical Low").length}
            </div>
            <div className="text-xs text-muted-foreground">Below safety stock</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Below Reorder Point</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reorderItems.filter(item => item.status === "Below Reorder Point").length}
            </div>
            <div className="text-xs text-muted-foreground">Ready to reorder</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Near Reorder Point</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reorderItems.filter(item => item.status === "Near Reorder Point").length}
            </div>
            <div className="text-xs text-muted-foreground">Monitor closely</div>
          </CardContent>
        </Card>
      </div>

      {/* Reorder Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items Requiring Attention</CardTitle>
          <CardDescription>Items that need reordering or are approaching reorder points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Reorder Point</TableHead>
                  <TableHead>Suggested Quantity</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reorderItems.map((item) => {
                  const stockPercentage = (item.currentStock / (item.reorderPoint + item.safetyStock)) * 100;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.itemNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={Math.min(stockPercentage, 100)} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {Math.round(stockPercentage)}% of target
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.reorderPoint}</TableCell>
                      <TableCell>{item.reorderQuantity}</TableCell>
                      <TableCell>{item.leadTimeDays} days</TableCell>
                      <TableCell className="max-w-[150px] truncate">{item.supplier}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        {getActionButton(item.suggestedAction)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reorder Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Reorder Policies by Category</CardTitle>
          <CardDescription>Configuration and performance of reorder policies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reorderPolicies.map((policy, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{policy.category}</h3>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span>{policy.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Review Cycle:</span>
                    <span>{policy.reviewCycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Items:</span>
                    <span>{policy.activeItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Lead Time:</span>
                    <span>{policy.avgLeadTime} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stockout Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">2.3%</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              -0.5% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Lead Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9.2 days</div>
            <div className="text-xs text-muted-foreground">Across all suppliers</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Turnover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4x</div>
            <div className="text-xs text-muted-foreground">Annual turnover rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReorderManagementPage;