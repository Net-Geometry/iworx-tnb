import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const KPIMetrics = () => {
  const metrics = [
    {
      title: "Overall Equipment Effectiveness",
      value: "87.3%",
      change: "+2.4%",
      trend: "up" as const,
      description: "Last 30 days performance"
    },
    {
      title: "Mean Time Between Failures",
      value: "247 hrs",
      change: "+12.5%",
      trend: "up" as const,
      description: "Average across all assets"
    },
    {
      title: "Planned vs Unplanned Work",
      value: "78:22",
      change: "+5.2%",
      trend: "up" as const,
      description: "Optimal ratio achieved"
    },
    {
      title: "Asset Utilization Rate",
      value: "92.1%",
      change: "-1.2%",
      trend: "down" as const,
      description: "Slight decrease from last month"
    }
  ];

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-accent-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-accent-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-gradient-card border border-border/50 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KPIMetrics;