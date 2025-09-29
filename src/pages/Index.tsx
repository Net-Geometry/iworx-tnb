import Header from "@/components/Header";
import ModuleCard from "@/components/ModuleCard";
import KPIMetrics from "@/components/KPIMetrics";
import QuickActions from "@/components/QuickActions";
import heroImage from "@/assets/iworx-hero.jpg";
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
  BarChart3
} from "lucide-react";

const Index = () => {
  const modules = [
    {
      title: "Asset Management",
      description: "Asset creation, health monitoring, criticality assessment, and BOM management with comprehensive lifecycle tracking.",
      icon: Settings,
      stats: [
        { label: "Total Assets", value: "12,847", trend: "up" as const },
        { label: "Critical Assets", value: "342", trend: "stable" as const }
      ],
      status: "active" as const,
      gradient: "bg-gradient-primary"
    },
    {
      title: "Work Management",
      description: "Work order creation, execution, templates, and standardization with calendar and board views.",
      icon: Wrench,
      stats: [
        { label: "Open Orders", value: "156", trend: "down" as const },
        { label: "Completed Today", value: "23", trend: "up" as const }
      ],
      status: "active" as const,
      gradient: "bg-gradient-secondary"
    },
    {
      title: "Preventive Maintenance",
      description: "PM template creation, schedule management, automation, and job plan designer with template library.",
      icon: Calendar,
      stats: [
        { label: "Scheduled PMs", value: "89", trend: "up" as const },
        { label: "Completion Rate", value: "94%", trend: "up" as const }
      ],
      status: "active" as const,
      gradient: "bg-gradient-success"
    },
    {
      title: "Inventory & Procurement",
      description: "Comprehensive inventory tracking, reorder management, transfers, purchase orders, and procurement workflows.",
      icon: Package,
      stats: [
        { label: "Stock Items", value: "4,521", trend: "stable" as const },
        { label: "Low Stock", value: "12", trend: "down" as const }
      ],
      status: "warning" as const,
      gradient: "bg-warning"
    },
    {
      title: "Advanced Analytics & AI",
      description: "Predictive maintenance engine, ML feature store, AI-powered asset health computation, and CBM rules engine.",
      icon: Brain,
      stats: [
        { label: "AI Models", value: "8", trend: "up" as const },
        { label: "Predictions", value: "1,247", trend: "up" as const }
      ],
      status: "active" as const,
      gradient: "bg-info"
    },
    {
      title: "Mobile & Field Operations",
      description: "Mobile work order execution, inventory scanner, inspection interface, and dispatch board with offline sync.",
      icon: Smartphone,
      stats: [
        { label: "Mobile Users", value: "127", trend: "up" as const },
        { label: "Offline Syncs", value: "45", trend: "stable" as const }
      ],
      status: "active" as const,
      gradient: "bg-gradient-primary"
    },
    {
      title: "Integration Platform",
      description: "Integration hub with connector management, orchestrator for complex workflows, and real-time IoT data ingestion.",
      icon: Link,
      stats: [
        { label: "Active Integrations", value: "14", trend: "up" as const },
        { label: "IoT Devices", value: "2,103", trend: "up" as const }
      ],
      status: "active" as const,
      gradient: "bg-gradient-secondary"
    },
    {
      title: "Safety & HSE",
      description: "Safety incident management, hazard management, LOTO procedures, and CAPA creation with comprehensive tracking.",
      icon: Shield,
      stats: [
        { label: "Incidents YTD", value: "3", trend: "down" as const },
        { label: "Safety Score", value: "98.7%", trend: "up" as const }
      ],
      status: "active" as const,
      gradient: "bg-accent-success"
    },
    {
      title: "Spatial Intelligence",
      description: "Interactive spatial maps, location hierarchy management, GIS integration, and route optimization capabilities.",
      icon: MapPin,
      stats: [
        { label: "Mapped Assets", value: "11,892", trend: "up" as const },
        { label: "Locations", value: "847", trend: "stable" as const }
      ],
      status: "active" as const,
      gradient: "bg-gradient-success"
    },
    {
      title: "Reporting & BI",
      description: "Executive dashboards with KPIs, customizable dashboard builder, advanced analytics, and custom report builder.",
      icon: BarChart3,
      stats: [
        { label: "Reports Generated", value: "156", trend: "up" as const },
        { label: "Dashboards", value: "12", trend: "stable" as const }
      ],
      status: "active" as const,
      gradient: "bg-destructive"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <Header />
      
      <main className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="relative bg-gradient-card rounded-xl overflow-hidden shadow-enterprise border border-border/50">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="iWorx Enterprise Asset Management Infrastructure" 
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/80"></div>
          </div>
          <div className="relative p-8">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-bold text-foreground mb-3">
                Welcome to iWorx Asset Management Suite
              </h1>
              <p className="text-xl text-muted-foreground mb-6 max-w-3xl">
                Comprehensive enterprise asset management solution with microservices architecture, 
                designed specifically for utility organizations like TNB. Supporting multiple verticals under one unified system.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-primary/15 text-primary text-sm rounded-full font-medium">Microservices Architecture</span>
                <span className="px-4 py-2 bg-secondary-accent/15 text-secondary-accent text-sm rounded-full font-medium">Multi-Vertical Support</span>
                <span className="px-4 py-2 bg-accent-success/15 text-accent-success text-sm rounded-full font-medium">Modern Interface</span>
                <span className="px-4 py-2 bg-info/15 text-info text-sm rounded-full font-medium">AI-Powered Analytics</span>
                <span className="px-4 py-2 bg-warning/15 text-warning text-sm rounded-full font-medium">Real-time IoT Integration</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Metrics */}
        <KPIMetrics />

        {/* Quick Actions */}
        <QuickActions />

        {/* Modules Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Functional Modules</h2>
            <p className="text-muted-foreground">
              End-to-end EAM capabilities across all integrated areas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <ModuleCard key={index} {...module} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border/50 text-center">
          <p className="text-muted-foreground">
            iWorx - Next-Generation Asset Management Solution for Enterprise Utility Organizations
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Unified platform eliminating integration complexity with modern, mobile-first interface
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;