import { ArrowRightLeft, Plus, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TransfersLoansPage = () => {
  // Mock data for transfers
  const transfers = [
    {
      id: "1",
      transferNumber: "TRF-2024-001",
      fromLocation: "Main Warehouse",
      toLocation: "Tool Crib",
      status: "completed",
      requestDate: "2024-01-15",
      shipDate: "2024-01-16",
      receivedDate: "2024-01-16",
      itemsCount: 3,
      requestedBy: "Mike Davis",
      totalValue: 245.50
    },
    {
      id: "2",
      transferNumber: "TRF-2024-002",
      fromLocation: "Storage Room B", 
      toLocation: "Main Warehouse",
      status: "in_transit",
      requestDate: "2024-01-14",
      shipDate: "2024-01-15",
      receivedDate: null,
      itemsCount: 5,
      requestedBy: "Lisa Chen",
      totalValue: 892.75
    },
    {
      id: "3",
      transferNumber: "TRF-2024-003",
      fromLocation: "Main Warehouse",
      toLocation: "Outdoor Storage", 
      status: "pending",
      requestDate: "2024-01-13",
      shipDate: null,
      receivedDate: null,
      itemsCount: 2,
      requestedBy: "Tom Wilson",
      totalValue: 156.25
    }
  ];

  // Mock data for loans
  const loans = [
    {
      id: "1",
      loanNumber: "LOAN-2024-001",
      itemName: "Digital Multimeter",
      borrowerName: "John Smith",
      borrowerDepartment: "Electrical",
      borrowerEmail: "j.smith@company.com",
      fromLocation: "Tool Crib",
      quantity: 1,
      loanDate: "2024-01-10",
      expectedReturnDate: "2024-01-20",
      actualReturnDate: null,
      status: "active",
      daysOverdue: 0
    },
    {
      id: "2",
      loanNumber: "LOAN-2024-002", 
      itemName: "Torque Wrench Set",
      borrowerName: "Sarah Wilson",
      borrowerDepartment: "Mechanical",
      borrowerEmail: "s.wilson@company.com",
      fromLocation: "Tool Crib",
      quantity: 1,
      loanDate: "2024-01-05",
      expectedReturnDate: "2024-01-15",
      actualReturnDate: "2024-01-14",
      status: "returned",
      daysOverdue: 0
    },
    {
      id: "3",
      loanNumber: "LOAN-2024-003",
      itemName: "Oscilloscope",
      borrowerName: "David Chen", 
      borrowerDepartment: "Engineering",
      borrowerEmail: "d.chen@company.com",
      fromLocation: "Tool Crib",
      quantity: 1,
      loanDate: "2023-12-20",
      expectedReturnDate: "2024-01-10",
      actualReturnDate: null,
      status: "overdue",
      daysOverdue: 5
    }
  ];

  const getTransferStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "in_transit":
        return <Badge className="bg-blue-500 text-white">In Transit</Badge>;
      case "completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLoanStatusBadge = (status: string, daysOverdue: number) => {
    switch (status) {
      case "active":
        return daysOverdue > 0 ? 
          <Badge variant="destructive">Overdue ({daysOverdue}d)</Badge> :
          <Badge className="bg-blue-500 text-white">Active</Badge>;
      case "returned":
        return <Badge className="bg-green-500 text-white">Returned</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue ({daysOverdue}d)</Badge>;
      case "lost":
        return <Badge variant="destructive">Lost</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const transferStats = {
    pending: transfers.filter(t => t.status === 'pending').length,
    inTransit: transfers.filter(t => t.status === 'in_transit').length,
    completed: transfers.filter(t => t.status === 'completed').length,
  };

  const loanStats = {
    active: loans.filter(l => l.status === 'active' && l.daysOverdue === 0).length,
    overdue: loans.filter(l => l.status === 'overdue' || l.daysOverdue > 0).length,
    returned: loans.filter(l => l.status === 'returned').length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transfers & Loans</h1>
            <p className="text-muted-foreground">Manage inventory transfers and equipment loans</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Loan
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Transfer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="transfers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="transfers" className="space-y-6">
          {/* Transfer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transferStats.pending}</div>
                <div className="text-xs text-muted-foreground">Awaiting approval</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                  In Transit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{transferStats.inTransit}</div>
                <div className="text-xs text-muted-foreground">Currently moving</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{transferStats.completed}</div>
                <div className="text-xs text-muted-foreground">This month</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${transfers.reduce((sum, t) => sum + t.totalValue, 0).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Current transfers</div>
              </CardContent>
            </Card>
          </div>

          {/* Transfers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Transfers</CardTitle>
              <CardDescription>Inter-location inventory movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer #</TableHead>
                      <TableHead>From → To</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{transfer.fromLocation}</div>
                            <div className="text-muted-foreground">↓</div>
                            <div>{transfer.toLocation}</div>
                          </div>
                        </TableCell>
                        <TableCell>{transfer.itemsCount} items</TableCell>
                        <TableCell>${transfer.totalValue.toFixed(2)}</TableCell>
                        <TableCell>{transfer.requestDate}</TableCell>
                        <TableCell>{getTransferStatusBadge(transfer.status)}</TableCell>
                        <TableCell>{transfer.requestedBy}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            {transfer.status === 'pending' && (
                              <Button size="sm">Approve</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          {/* Loan Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{loanStats.active}</div>
                <div className="text-xs text-muted-foreground">Currently loaned</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{loanStats.overdue}</div>
                <div className="text-xs text-muted-foreground">Require follow-up</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Returned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{loanStats.returned}</div>
                <div className="text-xs text-muted-foreground">This month</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loans.length}</div>
                <div className="text-xs text-muted-foreground">All time</div>
              </CardContent>
            </Card>
          </div>

          {/* Loans Table */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Loans</CardTitle>
              <CardDescription>Track equipment loans and returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan #</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Loan Date</TableHead>
                      <TableHead>Expected Return</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.loanNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{loan.itemName}</div>
                            <div className="text-sm text-muted-foreground">Qty: {loan.quantity}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{loan.borrowerName}</div>
                            <div className="text-sm text-muted-foreground">{loan.borrowerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{loan.borrowerDepartment}</TableCell>
                        <TableCell>{loan.loanDate}</TableCell>
                        <TableCell>{loan.expectedReturnDate}</TableCell>
                        <TableCell>{getLoanStatusBadge(loan.status, loan.daysOverdue)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            {loan.status === 'active' && (
                              <Button size="sm">Process Return</Button>
                            )}
                            {loan.status === 'overdue' && (
                              <Button variant="destructive" size="sm">Send Reminder</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransfersLoansPage;