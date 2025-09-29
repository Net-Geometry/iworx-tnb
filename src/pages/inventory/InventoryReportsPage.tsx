import { FileBarChart, Download, Calendar, TrendingUp, Package, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const InventoryReportsPage = () => {
  // Mock data for reports
  const availableReports = [
    {
      id: "1",
      name: "Inventory Valuation Report",
      description: "Current inventory value by category and location",
      category: "Financial",
      frequency: "Monthly",
      lastGenerated: "2024-01-15",
      format: ["PDF", "Excel"],
      icon: DollarSign
    },
    {
      id: "2", 
      name: "Stock Movement Analysis",
      description: "Detailed analysis of inventory transactions and trends",
      category: "Operational",
      frequency: "Weekly",
      lastGenerated: "2024-01-14",
      format: ["PDF", "Excel", "CSV"],
      icon: TrendingUp
    },
    {
      id: "3",
      name: "Low Stock Alert Report", 
      description: "Items below reorder point or safety stock levels",
      category: "Operational",
      frequency: "Daily",
      lastGenerated: "2024-01-16",
      format: ["PDF", "Email"],
      icon: Package
    },
    {
      id: "4",
      name: "Supplier Performance Report",
      description: "Supplier delivery times, quality metrics, and costs",
      category: "Supplier",
      frequency: "Monthly", 
      lastGenerated: "2024-01-10",
      format: ["PDF", "Excel"],
      icon: TrendingUp
    },
    {
      id: "5",
      name: "ABC Analysis Report",
      description: "Item classification by value and consumption patterns",
      category: "Strategic",
      frequency: "Quarterly",
      lastGenerated: "2024-01-01",
      format: ["PDF", "Excel"],
      icon: FileBarChart
    },
    {
      id: "6",
      name: "Obsolete Inventory Report",
      description: "Items with no movement for extended periods",
      category: "Operational",
      frequency: "Monthly",
      lastGenerated: "2024-01-12",
      format: ["PDF", "Excel"],
      icon: Package
    }
  ];

  const recentReports = [
    {
      name: "Daily Low Stock Alert",
      generatedDate: "2024-01-16",
      generatedBy: "System",
      status: "Completed",
      downloadUrl: "#"
    },
    {
      name: "Weekly Stock Movement", 
      generatedDate: "2024-01-15",
      generatedBy: "Sarah Johnson",
      status: "Completed",
      downloadUrl: "#"
    },
    {
      name: "Monthly Inventory Valuation",
      generatedDate: "2024-01-15",
      generatedBy: "Mike Davis",
      status: "Processing",
      downloadUrl: null
    },
    {
      name: "Supplier Performance Q4",
      generatedDate: "2024-01-10", 
      generatedBy: "Lisa Chen",
      status: "Completed",
      downloadUrl: "#"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Financial":
        return "bg-green-100 text-green-800";
      case "Operational":
        return "bg-blue-100 text-blue-800";
      case "Supplier":
        return "bg-purple-100 text-purple-800";
      case "Strategic":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case "Processing":
        return <Badge className="bg-blue-500 text-white">Processing</Badge>;
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <FileBarChart className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Reports</h1>
            <p className="text-muted-foreground">Generate and schedule inventory reports and analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button>
            <FileBarChart className="w-4 h-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Report Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="strategic">Strategic</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
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
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Standard inventory reports you can generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <report.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{report.name}</CardTitle>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(report.category)}>
                      {report.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{report.description}</CardDescription>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span>{report.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Generated:</span>
                      <span>{report.lastGenerated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Formats:</span>
                      <span>{report.format.join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">Generate Now</Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Recently generated reports and their status</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileBarChart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Generated on {report.generatedDate} by {report.generatedBy}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(report.status)}
                  {report.downloadUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <div className="text-xs text-muted-foreground">+12% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs text-muted-foreground">Active schedules</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Generation Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <div className="text-xs text-muted-foreground">Performance metric</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">99.2%</div>
            <div className="text-xs text-muted-foreground">Report reliability</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryReportsPage;