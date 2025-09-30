import { Card, CardContent } from "@/components/ui/card";
import { Calendar, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { usePMScheduleStats } from "@/hooks/usePMSchedules";

/**
 * PMKPICards Component
 * Displays 4 key performance indicator cards for PM schedules
 */
const PMKPICards = () => {
  const { data: stats, isLoading } = usePMScheduleStats();

  const metrics = [
    {
      title: "Active PM Schedules",
      value: stats?.total_active || 0,
      icon: Calendar,
      description: "Total active schedules",
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      title: "Overdue",
      value: stats?.overdue || 0,
      icon: AlertCircle,
      description: "PMs past due date",
      colorClass: "text-destructive",
      bgClass: "bg-destructive/10",
    },
    {
      title: "Due This Week",
      value: stats?.due_this_week || 0,
      icon: Clock,
      description: "PMs due in next 7 days",
      colorClass: "text-warning",
      bgClass: "bg-warning/10",
    },
    {
      title: "Completed This Month",
      value: stats?.completed_this_month || 0,
      icon: CheckCircle,
      description: "PMs completed this month",
      colorClass: "text-success",
      bgClass: "bg-success/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${metric.bgClass}`}>
                  <Icon className={`w-6 h-6 ${metric.colorClass}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PMKPICards;
