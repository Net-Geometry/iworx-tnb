import { TrendingUp, AlertTriangle, Activity, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAssetKPIs } from "@/hooks/useAssetKPIs";
import { Skeleton } from "@/components/ui/skeleton";

const kpiConfig = [
  {
    key: "totalAssets" as const,
    title: "Total Assets",
    icon: Activity,
    bgColor: "bg-gradient-to-br from-blue-500/10 to-blue-600/5",
    iconColor: "text-blue-500",
    format: (value: number) => value.toLocaleString()
  },
  {
    key: "criticalAssets" as const,
    title: "Critical Assets",
    icon: AlertTriangle,
    bgColor: "bg-gradient-to-br from-red-500/10 to-red-600/5",
    iconColor: "text-red-500",
    format: (value: number) => value.toLocaleString()
  },
  {
    key: "healthScore" as const,
    title: "Health Score",
    icon: TrendingUp,
    bgColor: "bg-gradient-to-br from-green-500/10 to-green-600/5",
    iconColor: "text-green-500",
    format: (value: number) => `${value}%`
  },
  {
    key: "maintenanceDue" as const,
    title: "Maintenance Due",
    icon: Calendar,
    bgColor: "bg-gradient-to-br from-orange-500/10 to-orange-600/5",
    iconColor: "text-orange-500",
    format: (value: number) => value.toLocaleString()
  }
];

export function AssetKPICards() {
  const { kpis, loading, error } = useAssetKPIs();

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiConfig.map((config) => (
          <Card key={config.title} className="p-6 border-border/50 border-destructive/20">
            <div className="flex items-center justify-center h-20">
              <p className="text-sm text-destructive">Failed to load {config.title.toLowerCase()}</p>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiConfig.map((config) => {
        const Icon = config.icon;
        const value = kpis[config.key];
        
        return (
          <Card key={config.title} className={`p-6 border-border/50 ${config.bgColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{config.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <h3 className="text-2xl font-bold text-foreground">
                      {config.format(value)}
                    </h3>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${config.bgColor}`}>
                <Icon className={`h-6 w-6 ${config.iconColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}