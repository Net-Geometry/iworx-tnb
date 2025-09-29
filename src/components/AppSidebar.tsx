import {
  Settings,
  Wrench,
  Calendar,
  Package,
  Brain,
  Smartphone,
  Link,
  Shield,
  MapPin,
  BarChart3,
  Home,
  ChevronDown,
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

const moduleItems = [
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
    title: "Preventive Maintenance",
    url: "/preventive-maintenance",
    icon: Calendar,
  },
  {
    title: "Inventory & Procurement",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Advanced Analytics & AI",
    url: "/analytics",
    icon: Brain,
  },
  {
    title: "Mobile & Field Operations",
    url: "/mobile-operations",
    icon: Smartphone,
  },
  {
    title: "Integration Platform",
    url: "/integrations",
    icon: Link,
  },
  {
    title: "Safety & HSE",
    url: "/safety",
    icon: Shield,
  },
  {
    title: "Spatial Intelligence",
    url: "/spatial",
    icon: MapPin,
  },
  {
    title: "Reporting & BI",
    url: "/reports",
    icon: BarChart3,
  },
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

  const isModulesExpanded = moduleItems.some((item) => isActive(item.url));

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

        {/* Modules Section */}
        <Collapsible defaultOpen={isModulesExpanded} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                Functional Modules
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {moduleItems.map((item) => (
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
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}