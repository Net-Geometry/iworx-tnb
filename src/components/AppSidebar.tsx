import {
  Settings,
  Wrench,
  Calendar,
  Package,
  FileSpreadsheet,
  Brain,
  Smartphone,
  Link,
  Shield,
  MapPin,
  BarChart3,
  Home,
  ChevronDown,
  ArrowRightLeft,
  Building,
  FileBarChart,
  Package2,
  RotateCcw,
  ShoppingCart,
  AlertTriangle,
  AlertCircle,
  Lock,
  CheckCircle,
  BookOpen,
  UserPlus,
  Users,
  UserCheck,
  GraduationCap,
  Hammer,
  Database,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
];

// Asset & Maintenance modules
const assetMaintenanceModules = [
  {
    title: "Asset Management",
    url: "/assets",
    icon: Settings,
  },
  {
    title: "Work Management", 
    url: "/work-orders",
    icon: Wrench,
  },
  {
    title: "Job Plans",
    url: "/job-plans",
    icon: FileSpreadsheet,
  },
  {
    title: "Preventive Maintenance",
    url: "/preventive-maintenance",
    icon: Calendar,
  },
  {
    title: "Bill of Materials",
    url: "/bom",
    icon: FileSpreadsheet,
  },
];

// Analytics & Intelligence modules
const analyticsModules = [
  {
    title: "Advanced Analytics & AI",
    url: "/analytics",
    icon: Brain,
  },
  {
    title: "Reporting & BI",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Spatial Intelligence",
    url: "/spatial",
    icon: MapPin,
  },
];

// Platform & Integration modules
const platformModules = [
  {
    title: "Integration Platform",
    url: "/integrations",
    icon: Link,
  },
];

// Safety & HSE sub-modules
const safetySubModules = [
  { title: "Safety Overview", url: "/safety", icon: Shield },
  { title: "Incident Management", url: "/safety/incidents", icon: AlertTriangle },
  { title: "Hazard & Risk Register", url: "/safety/hazards", icon: AlertCircle },
  { title: "LOTO Procedures", url: "/safety/loto", icon: Lock },
  { title: "Precaution Library", url: "/safety/precautions", icon: BookOpen },
  { title: "CAPA Management", url: "/safety/capa", icon: CheckCircle },
  { title: "Safety Reports", url: "/safety/reports", icon: BarChart3 },
];

const inventorySubModules = [
  { title: "Inventory Overview", url: "/inventory", icon: BarChart3 },
  { title: "Items & Stock", url: "/inventory/items", icon: Package },
  { title: "Locations", url: "/inventory/locations", icon: MapPin },
  { title: "Reorder Management", url: "/inventory/reorder", icon: RotateCcw },
  { title: "Transfers & Loans", url: "/inventory/transfers", icon: ArrowRightLeft },
  { title: "Purchase Orders", url: "/inventory/purchase-orders", icon: ShoppingCart },
  { title: "Suppliers", url: "/inventory/suppliers", icon: Building },
  { title: "Reports", url: "/inventory/reports", icon: FileBarChart },
];

// People & Labor modules
const peopleAndLaborModules = [
  { title: "People & Labor Overview", url: "/people-labor", icon: Users },
  { title: "People Management", url: "/people-labor/people", icon: UserCheck },
  { title: "Teams & Groups", url: "/people-labor/teams", icon: Users },
  { title: "Skills Library", url: "/people-labor/skills", icon: GraduationCap },
];

// System Administration modules
const systemAdminModules = [
  { title: "System Settings", url: "/admin/settings", icon: Settings },
  { title: "User Registration", url: "/admin/users/register", icon: UserPlus },
  { title: "Role Management", url: "/admin/roles", icon: Shield },
  { title: "Verticals", url: "/admin/organizations", icon: Building },
  { title: "Reference Data", url: "/admin/reference-data", icon: Database },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const isAssetMaintenanceExpanded = assetMaintenanceModules.some((item) => isActive(item.url));
  const isAnalyticsExpanded = analyticsModules.some((item) => isActive(item.url));
  const isPlatformExpanded = platformModules.some((item) => isActive(item.url));
  const isInventoryExpanded = currentPath.startsWith('/inventory');
  const isSafetyExpanded = currentPath.startsWith('/safety');
  const isPeopleAndLaborExpanded = currentPath.startsWith('/people-labor');
  const isAdminExpanded = currentPath.startsWith('/admin');

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">iW</span>
          </div>
          {state === "expanded" && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">iWorx</h2>
              <p className="text-xs text-sidebar-foreground/70">Asset Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={state === "collapsed" ? item.title : undefined}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Asset & Maintenance */}
        <Collapsible defaultOpen={isAssetMaintenanceExpanded} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Asset & Maintenance
                </div>
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {assetMaintenanceModules.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={state === "collapsed" ? item.title : undefined}
                      >
                        <NavLink to={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Analytics & Intelligence */}
        <Collapsible defaultOpen={isAnalyticsExpanded} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Analytics & Intelligence
                </div>
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {analyticsModules.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={state === "collapsed" ? item.title : undefined}
                      >
                        <NavLink to={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Platform & Integration */}
        <Collapsible defaultOpen={isPlatformExpanded} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Platform & Integration
                </div>
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {platformModules.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={state === "collapsed" ? item.title : undefined}
                      >
                        <NavLink to={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Safety & HSE Submenu */}
        <Collapsible defaultOpen={isSafetyExpanded} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Safety & HSE
                </div>
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {safetySubModules.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={state === "collapsed" ? item.title : undefined}
                      >
                        <NavLink to={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Inventory & Procurement Submenu */}
        <Collapsible defaultOpen={isInventoryExpanded} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Inventory & Procurement
                </div>
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {inventorySubModules.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={state === "collapsed" ? item.title : undefined}
                      >
                        <NavLink to={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* People & Labor */}
        <Collapsible defaultOpen={isPeopleAndLaborExpanded} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  People & Labor
                </div>
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {peopleAndLaborModules.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={state === "collapsed" ? item.title : undefined}
                      >
                        <NavLink to={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* System Administration */}
        <Collapsible defaultOpen={isAdminExpanded} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  System Administration
                </div>
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {systemAdminModules.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={state === "collapsed" ? item.title : undefined}
                      >
                        <NavLink to={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}