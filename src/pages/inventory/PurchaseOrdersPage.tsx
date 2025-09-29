import { ShoppingCart, Plus, Eye, Edit, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PurchaseOrdersPage = () => {
  // Mock data for demonstration
  const purchaseOrders = [
    {
      id: "1",
      poNumber: "PO-2024-001",
      supplier: "Industrial Parts Co",
      status: "approved",
      orderDate: "2024-01-15",
      expectedDelivery: "2024-01-25",
      totalAmount: 2450.75,
      itemsCount: 5,
      requestedBy: "John Smith",
      approvedBy: "Sarah Johnson"
    },
    {
      id: "2",
      poNumber: "PO-2024-002", 
      supplier: "Bearing Solutions",
      status: "pending_approval",
      orderDate: "2024-01-14",
      expectedDelivery: "2024-01-28",
      totalAmount: 890.50,
      itemsCount: 3,
      requestedBy: "Mike Davis",
      approvedBy: null
    },
    {
      id: "3",
      poNumber: "PO-2024-003",
      supplier: "Safety First Ltd",
      status: "sent",
      orderDate: "2024-01-12",
      expectedDelivery: "2024-01-22",
      totalAmount: 675.25,
      itemsCount: 8,
      requestedBy: "Lisa Chen",
      approvedBy: "Sarah Johnson"
    },
    {
      id: "4",
      poNumber: "PO-2024-004",
      supplier: "Power Transmission Inc",
      status: "partially_received",
      orderDate: "2024-01-10",
      expectedDelivery: "2024-01-20",
      totalAmount: 1825.00,
      itemsCount: 4,
      requestedBy: "Tom Wilson",
      approvedBy: "Sarah Johnson"
    },
    {
      id: "5",
      poNumber: "PO-2024-005",
      supplier: "Filter Tech Corp",
      status: "received",
      orderDate: "2024-01-08",
      expectedDelivery: "2024-01-18",
      totalAmount: 1150.00,
      itemsCount: 6,
      requestedBy: "Anna Brown",
      approvedBy: "Sarah Johnson"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "pending_approval":
        return <Badge variant="secondary">Pending Approval</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "sent":
        return <Badge className="bg-blue-500 text-white">Sent</Badge>;
      case "partially_received":
        return <Badge className="bg-orange-500 text-white">Partially Received</Badge>;
      case "received":
        return <Badge className="bg-green-500 text-white">Received</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const statusStats = {
    draft: purchaseOrders.filter(po => po.status === 'draft').length,
    pending: purchaseOrders.filter(po => po.status === 'pending_approval').length,
    approved: purchaseOrders.filter(po => po.status === 'approved').length,
    sent: purchaseOrders.filter(po => po.status === 'sent').length,
    received: purchaseOrders.filter(po => po.status === 'received').length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
            <p className="text-muted-foreground">Create, manage, and track purchase orders</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.draft}</div>
            <div className="text-xs text-muted-foreground">Not submitted</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{statusStats.pending}</div>
            <div className="text-xs text-muted-foreground">Awaiting approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusStats.approved}</div>
            <div className="text-xs text-muted-foreground">Ready to send</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statusStats.sent}</div>
            <div className="text-xs text-muted-foreground">With supplier</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{statusStats.received}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input placeholder="Search PO number, supplier..." />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="partially_received">Partially Received</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="industrial">Industrial Parts Co</SelectItem>
                <SelectItem value="bearing">Bearing Solutions</SelectItem>
                <SelectItem value="safety">Safety First Ltd</SelectItem>
                <SelectItem value="power">Power Transmission Inc</SelectItem>
                <SelectItem value="filter">Filter Tech Corp</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>Complete list of purchase orders</CardDescription>
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
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.poNumber}</TableCell>
                    <TableCell>{po.supplier}</TableCell>
                    <TableCell>{getStatusBadge(po.status)}</TableCell>
                    <TableCell>{po.orderDate}</TableCell>
                    <TableCell>{po.expectedDelivery}</TableCell>
                    <TableCell>{po.itemsCount} items</TableCell>
                    <TableCell>${po.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{po.requestedBy}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOrders.length}</div>
            <div className="text-xs text-muted-foreground">+15% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">+8% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 days</div>
            <div className="text-xs text-muted-foreground">From order to delivery</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseOrdersPage;