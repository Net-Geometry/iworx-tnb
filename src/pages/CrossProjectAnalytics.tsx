import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Package, Wrench, AlertTriangle, TrendingUp, Users, FileText, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface OrganizationStats {
  organization_id: string;
  organization_name: string;
  organization_code: string;
  asset_count: number;
  work_order_count: number;
  active_work_orders: number;
  safety_incidents: number;
  inventory_items: number;
  low_stock_items: number;
}

const CHART_COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(270, 80%, 60%)'];

const CrossProjectAnalytics = () => {
  const { hasCrossProjectAccess, currentOrganization } = useAuth();
  const navigate = useNavigate();
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([]);

  // Redirect if no cross-project access
  useEffect(() => {
    if (!hasCrossProjectAccess) {
      navigate("/analytics");
    }
  }, [hasCrossProjectAccess, navigate]);

  // Fetch all organizations
  const { data: organizations = [] } = useQuery({
    queryKey: ["all_organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: hasCrossProjectAccess
  });

  // Fetch cross-project statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["cross_project_stats", selectedOrgIds],
    queryFn: async () => {
      const orgFilter = selectedOrgIds.length > 0 ? selectedOrgIds : organizations.map(o => o.id);

      const [assets, workOrders, incidents, inventoryItems] = await Promise.all([
        supabase
          .from("assets")
          .select("id, organization_id, organizations(name, code)")
          .in("organization_id", orgFilter),
        supabase
          .from("work_orders")
          .select("id, status, organization_id, organizations(name, code)")
          .in("organization_id", orgFilter),
        supabase
          .from("safety_incidents")
          .select("id, organization_id, organizations(name, code)")
          .in("organization_id", orgFilter),
        supabase
          .from("inventory_items")
          .select("id, current_stock, reorder_point, organization_id, organizations(name, code)")
          .in("organization_id", orgFilter)
      ]);

      // Aggregate by organization
      const orgMap = new Map<string, OrganizationStats>();

      organizations.forEach(org => {
        orgMap.set(org.id, {
          organization_id: org.id,
          organization_name: org.name,
          organization_code: org.code,
          asset_count: 0,
          work_order_count: 0,
          active_work_orders: 0,
          safety_incidents: 0,
          inventory_items: 0,
          low_stock_items: 0
        });
      });

      assets.data?.forEach(asset => {
        const stats = orgMap.get(asset.organization_id);
        if (stats) stats.asset_count++;
      });

      workOrders.data?.forEach(wo => {
        const stats = orgMap.get(wo.organization_id);
        if (stats) {
          stats.work_order_count++;
          if (wo.status === "scheduled" || wo.status === "in_progress") {
            stats.active_work_orders++;
          }
        }
      });

      incidents.data?.forEach(incident => {
        const stats = orgMap.get(incident.organization_id);
        if (stats) stats.safety_incidents++;
      });

      inventoryItems.data?.forEach(item => {
        const stats = orgMap.get(item.organization_id);
        if (stats) {
          stats.inventory_items++;
          if (item.current_stock <= item.reorder_point) {
            stats.low_stock_items++;
          }
        }
      });

      return Array.from(orgMap.values()).filter(s => orgFilter.includes(s.organization_id));
    },
    enabled: hasCrossProjectAccess && organizations.length > 0
  });

  if (!hasCrossProjectAccess) return null;

  const totalAssets = stats?.reduce((sum, s) => sum + s.asset_count, 0) || 0;
  const totalWorkOrders = stats?.reduce((sum, s) => sum + s.work_order_count, 0) || 0;
  const totalIncidents = stats?.reduce((sum, s) => sum + s.safety_incidents, 0) || 0;
  const totalInventoryItems = stats?.reduce((sum, s) => sum + s.inventory_items, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cross-Project Analytics</h1>
            <p className="text-muted-foreground">Aggregated insights across all organizations</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Organization Filter */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Filter Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedOrgIds.length === 0 ? "all" : selectedOrgIds[0]}
            onValueChange={(value) => {
              if (value === "all") {
                setSelectedOrgIds([]);
              } else {
                setSelectedOrgIds([value]);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {organizations.map(org => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name} ({org.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Summary KPIs */}
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
              <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{organizations.length}</div>
              <p className="text-xs text-muted-foreground">Active projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalAssets}</div>
              <p className="text-xs text-muted-foreground">Across all organizations</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
              <Wrench className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalWorkOrders}</div>
              <p className="text-xs text-muted-foreground">In progress or scheduled</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Safety Incidents</CardTitle>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalIncidents}</div>
              <p className="text-xs text-muted-foreground">Reported incidents</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets by Organization */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Assets by Organization</CardTitle>
            <CardDescription>Total asset count per project</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="organization_code" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem"
                    }}
                  />
                  <Bar dataKey="asset_count" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Work Orders by Organization */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Work Orders by Organization</CardTitle>
            <CardDescription>Active vs total work orders</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="organization_code" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="work_order_count" fill="hsl(142, 76%, 36%)" radius={[8, 8, 0, 0]} name="Total" />
                  <Bar dataKey="active_work_orders" fill="hsl(38, 92%, 50%)" radius={[8, 8, 0, 0]} name="Active" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Safety Incidents */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Safety Incidents by Organization</CardTitle>
            <CardDescription>Incident count per project</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="organization_code" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem"
                    }}
                  />
                  <Bar dataKey="safety_incidents" fill="hsl(0, 84%, 60%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>Stock levels across organizations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="organization_code" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="inventory_items" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} name="Total Items" />
                  <Bar dataKey="low_stock_items" fill="hsl(0, 84%, 60%)" radius={[8, 8, 0, 0]} name="Low Stock" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Organization Details Table */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Detailed breakdown by organization</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Organization</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Assets</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Work Orders</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Active WOs</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Incidents</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Inventory</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.map((org) => (
                    <tr key={org.organization_id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-foreground">{org.organization_name}</div>
                          <div className="text-sm text-muted-foreground">{org.organization_code}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-foreground">{org.asset_count}</td>
                      <td className="py-3 px-4 text-right text-foreground">{org.work_order_count}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={org.active_work_orders > 0 ? "default" : "secondary"}>
                          {org.active_work_orders}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={org.safety_incidents > 0 ? "destructive" : "secondary"}>
                          {org.safety_incidents}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-foreground">{org.inventory_items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossProjectAnalytics;
