import { BarChart3, Package, AlertTriangle, TrendingUp, DollarSign, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryStats } from "@/hooks/useInventoryStats";
import { useInventoryLowStock } from "@/hooks/useInventoryLowStock";
import { useInventoryTransactions } from "@/hooks/useInventoryTransactions";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const InventoryOverviewPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useInventoryStats();
  const { data: lowStockItems, isLoading: lowStockLoading } = useInventoryLowStock(4);
  const { data: recentTransactions, isLoading: transactionsLoading } = useInventoryTransactions(4);

  const overviewStats = [
    {
      title: "Total Items",
      value: stats?.totalItems.toLocaleString() || "0",
      change: "+12%",
      trend: "up",
      icon: Package,
    },
    {
      title: "Total Value",
      value: `$${(stats?.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+8%", 
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockCount.toString() || "0",
      change: "-5%",
      trend: "down",
      icon: AlertTriangle,
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrdersCount.toString() || "0",
      change: "+3%",
      trend: "up", 
      icon: Truck,
    },
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
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          overviewStats.map((stat) => (
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
          ))
        )}
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
            {lowStockLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : lowStockItems && lowStockItems.length > 0 ? (
              <>
                <div className="space-y-4">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.category}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.current_stock === 0 ? "destructive" : item.current_stock <= item.reorder_point ? "secondary" : "default"}>
                          Stock: {item.current_stock}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          Reorder at: {item.reorder_point}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/inventory/items')}>
                    View All Low Stock Items
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No low stock items</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest inventory movements</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : recentTransactions && recentTransactions.length > 0 ? (
              <>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <div className="font-medium">{transaction.item?.name || 'Unknown Item'}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.transaction_type} • {transaction.reference_type || 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          transaction.quantity > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/inventory/items')}>
                    View All Transactions
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
            )}
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
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/inventory/items')}
            >
              <Package className="w-5 h-5" />
              Add New Item
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/inventory/purchase-orders')}
            >
              <Truck className="w-5 h-5" />
              Create PO
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/inventory/items')}
            >
              <AlertTriangle className="w-5 h-5" />
              Stock Adjustment
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/inventory/reports')}
            >
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
