import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Package, Wrench, Shield, FileDown, Calendar, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
}

const ReportsPage = () => {
  const { currentOrganization, hasCrossProjectAccess, userOrganizations } = useAuth();
  const navigate = useNavigate();
  const [selectedOrgId, setSelectedOrgId] = useState<string>(currentOrganization?.id || "");

  // Fetch organizations for filter
  const { data: organizations = [] } = useQuery({
    queryKey: ["user_organizations"],
    queryFn: async () => {
      if (hasCrossProjectAccess) {
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("is_active", true)
          .order("name");
        if (error) throw error;
        return data;
      }
      return userOrganizations?.map(uo => uo.organization) || [];
    }
  });

  // Fetch report statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["report_stats", selectedOrgId],
    queryFn: async () => {
      const orgId = selectedOrgId || currentOrganization?.id;
      if (!orgId) return null;

      const [assets, workOrders, inventoryItems, incidents] = await Promise.all([
        supabase
          .from("assets")
          .select("id, status, health_score")
          .eq("organization_id", orgId),
        supabase
          .from("work_orders")
          .select("id, status, priority")
          .eq("organization_id", orgId),
        supabase
          .from("inventory_items")
          .select("id, current_stock, reorder_point")
          .eq("organization_id", orgId),
        supabase
          .from("safety_incidents")
          .select("id, severity")
          .eq("organization_id", orgId)
      ]);

      return {
        totalAssets: assets.data?.length || 0,
        operationalAssets: assets.data?.filter(a => a.status === "operational").length || 0,
        avgHealthScore: assets.data?.reduce((sum, a) => sum + (a.health_score || 0), 0) / (assets.data?.length || 1) || 0,
        totalWorkOrders: workOrders.data?.length || 0,
        openWorkOrders: workOrders.data?.filter(w => w.status !== "completed").length || 0,
        highPriorityWOs: workOrders.data?.filter(w => w.priority === "critical" || w.priority === "high").length || 0,
        totalInventoryItems: inventoryItems.data?.length || 0,
        lowStockItems: inventoryItems.data?.filter(i => i.current_stock <= i.reorder_point).length || 0,
        totalIncidents: incidents.data?.length || 0,
        criticalIncidents: incidents.data?.filter(i => i.severity === "critical").length || 0
      };
    },
    enabled: !!currentOrganization
  });

  const reportTemplates: ReportTemplate[] = [
    {
      id: "asset_inventory",
      name: "Asset Inventory Report",
      description: "Complete inventory of all assets with current status",
      category: "assets",
      icon: Package
    },
    {
      id: "asset_health",
      name: "Asset Health Summary",
      description: "Health scores and maintenance needs by asset",
      category: "assets",
      icon: TrendingUp
    },
    {
      id: "maintenance_history",
      name: "Maintenance History",
      description: "Historical maintenance records and costs",
      category: "assets",
      icon: Calendar
    },
    {
      id: "work_order_summary",
      name: "Work Order Summary",
      description: "Open, closed, and pending work orders",
      category: "work_orders",
      icon: Wrench
    },
    {
      id: "wo_completion_rates",
      name: "Work Order Completion Rates",
      description: "Completion statistics and trends",
      category: "work_orders",
      icon: TrendingUp
    },
    {
      id: "stock_levels",
      name: "Stock Levels Report",
      description: "Current inventory levels and locations",
      category: "inventory",
      icon: Package
    },
    {
      id: "reorder_requirements",
      name: "Reorder Requirements",
      description: "Items below reorder point requiring purchase",
      category: "inventory",
      icon: TrendingUp
    },
    {
      id: "incident_rate",
      name: "Incident Rate Report",
      description: "Safety incident frequency and severity analysis",
      category: "safety",
      icon: Shield
    },
    {
      id: "compliance_report",
      name: "Compliance Report",
      description: "Safety compliance and training status",
      category: "safety",
      icon: Shield
    }
  ];

  const getCategoryReports = (category: string) => {
    return reportTemplates.filter(r => r.category === category);
  };

  const handleGenerateReport = (reportId: string) => {
    console.log("Generating report:", reportId, "for organization:", selectedOrgId);
    // Future: Implement report generation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reporting & BI</h1>
            <p className="text-muted-foreground">Executive dashboards and advanced analytics</p>
          </div>
        </div>
        {hasCrossProjectAccess && (
          <Button onClick={() => navigate("/analytics/cross-project")} variant="outline">
            Cross-Project Analytics
          </Button>
        )}
      </div>

      {/* Organization Selector */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Select Vertical</CardTitle>
          <CardDescription>Choose which vertical to generate reports for</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedOrgId || currentOrganization?.id}
            onValueChange={setSelectedOrgId}
          >
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Select vertical" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map(org => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name} ({org.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-gradient-card border-border/50">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.totalAssets || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.operationalAssets || 0} operational
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
              <Wrench className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.totalWorkOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.openWorkOrders || 0} open
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.totalInventoryItems || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.lowStockItems || 0} low stock
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Safety Incidents</CardTitle>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.totalIncidents || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.criticalIncidents || 0} critical
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Templates by Category */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Select and generate reports for your vertical</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assets" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="work_orders">Work Orders</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
            </TabsList>

            <TabsContent value="assets" className="space-y-4 mt-4">
              {getCategoryReports("assets").map(report => (
                <Card key={report.id} className="border-border/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <report.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleGenerateReport(report.id)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="work_orders" className="space-y-4 mt-4">
              {getCategoryReports("work_orders").map(report => (
                <Card key={report.id} className="border-border/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <report.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleGenerateReport(report.id)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4 mt-4">
              {getCategoryReports("inventory").map(report => (
                <Card key={report.id} className="border-border/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <report.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleGenerateReport(report.id)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="safety" className="space-y-4 mt-4">
              {getCategoryReports("safety").map(report => (
                <Card key={report.id} className="border-border/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <report.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleGenerateReport(report.id)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;