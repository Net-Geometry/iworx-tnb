import { TrendingUp, AlertTriangle, Activity, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

const kpiData = [
  {
    title: "Total Assets",
    value: "1,247",
    trend: "+12%",
    trendUp: true,
    icon: Activity,
    bgColor: "bg-gradient-to-br from-blue-500/10 to-blue-600/5",
    iconColor: "text-blue-500"
  },
  {
    title: "Critical Assets",
    value: "23",
    trend: "-5%",
    trendUp: false,
    icon: AlertTriangle,
    bgColor: "bg-gradient-to-br from-red-500/10 to-red-600/5",
    iconColor: "text-red-500"
  },
  {
    title: "Health Score",
    value: "94.2%",
    trend: "+2.1%",
    trendUp: true,
    icon: TrendingUp,
    bgColor: "bg-gradient-to-br from-green-500/10 to-green-600/5",
    iconColor: "text-green-500"
  },
  {
    title: "Maintenance Due",
    value: "156",
    trend: "+8%",
    trendUp: true,
    icon: Calendar,
    bgColor: "bg-gradient-to-br from-orange-500/10 to-orange-600/5",
    iconColor: "text-orange-500"
  }
];

export function AssetKPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className={`p-6 border-border/50 ${kpi.bgColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-2xl font-bold text-foreground">{kpi.value}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    kpi.trendUp 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {kpi.trend}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                <Icon className={`h-6 w-6 ${kpi.iconColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}