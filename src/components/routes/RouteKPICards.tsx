import { Card, CardContent } from "@/components/ui/card";
import { Route, CheckCircle2, TrendingUp } from "lucide-react";

/**
 * KPI Cards for Maintenance Routes overview
 * Displays key metrics about routes
 */

interface RouteKPICardsProps {
  totalRoutes: number;
  activeRoutes: number;
  totalAssets: number;
}

export const RouteKPICards = ({
  totalRoutes,
  activeRoutes,
  totalAssets,
}: RouteKPICardsProps) => {
  const kpis = [
    {
      title: "Total Routes",
      value: totalRoutes,
      icon: Route,
      color: "text-primary",
    },
    {
      title: "Active Routes",
      value: activeRoutes,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Total Assets",
      value: totalAssets,
      icon: TrendingUp,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                </div>
                <div className={`${kpi.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
