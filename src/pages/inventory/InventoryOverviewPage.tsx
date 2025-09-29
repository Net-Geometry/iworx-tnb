import { BarChart3, Package, AlertTriangle, TrendingUp, DollarSign, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const InventoryOverviewPage = () => {
  // Mock data for demonstration
  const overviewStats = [
    {
      title: "Total Items",
      value: "2,847",
      change: "+12%",
      trend: "up",
      icon: Package,
    },
    {
      title: "Total Value",
      value: "$1.2M",
      change: "+8%", 
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Low Stock Items",
      value: "23",
      change: "-5%",
      trend: "down",
      icon: AlertTriangle,
    },
    {
      title: "Pending Orders",
      value: "18",
      change: "+3%",
      trend: "up", 
      icon: Truck,
    },
  ];

  const lowStockItems = [
    { name: "Hydraulic Pump Seal", stock: 2, reorderPoint: 5, category: "Hydraulics" },
    { name: "Motor Bearing 6205", stock: 1, reorderPoint: 10, category: "Bearings" },
    { name: "Safety Valve Spring", stock: 0, reorderPoint: 3, category: "Safety" },
    { name: "Coupling Insert", stock: 3, reorderPoint: 8, category: "Couplings" },
  ];

  const recentTransactions = [
    { type: "Receipt", item: "Ball Bearing Set", quantity: 50, date: "2024-01-15", reference: "PO-2024-001" },
    { type: "Issue", item: "Hydraulic Hose", quantity: -5, date: "2024-01-14", reference: "WO-2024-145" },
    { type: "Adjustment", item: "Filter Element", quantity: 2, date: "2024-01-14", reference: "ADJ-001" },
    { type: "Transfer", item: "Motor Oil 5W-30", quantity: -10, date: "2024-01-13", reference: "TRF-024" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Overview</h1>
          <p className="text-muted-foreground">Monitor stock levels, track transactions, and manage inventory health</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className={`mr-1 h-3 w-3 ${
                  stat.trend === 'up' ? 'text-success' : 'text-destructive'
                }`} />
                <span className={stat.trend === 'up' ? 'text-success' : 'text-destructive'}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.category}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.stock === 0 ? "destructive" : item.stock <= item.reorderPoint ? "secondary" : "default"}>
                      Stock: {item.stock}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Reorder at: {item.reorderPoint}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">View All Low Stock Items</Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest inventory movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">{transaction.item}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.type} • {transaction.reference}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      transaction.quantity > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                    </div>
                    <div className="text-xs text-muted-foreground">{transaction.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">View All Transactions</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common inventory management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Package className="w-5 h-5" />
              Add New Item
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Truck className="w-5 h-5" />
              Create PO
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <AlertTriangle className="w-5 h-5" />
              Stock Adjustment
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="w-5 h-5" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryOverviewPage;