import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Clock, PlayCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkOrderStats } from "@/hooks/useWorkOrders";

interface WorkOrderKPICardsProps {
  stats: WorkOrderStats;
  loading?: boolean;
}

export const WorkOrderKPICards = ({ stats, loading }: WorkOrderKPICardsProps) => {
  const metrics = [
    {
      title: "Total Work Orders",
      value: stats.total,
      icon: ClipboardList,
      description: "All work orders",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Scheduled",
      value: stats.scheduled,
      icon: Clock,
      description: "Awaiting execution",
      color: "text-blue-600",
      bg: "bg-blue-600/10"
    },
    {
      title: "In Progress",
      value: stats.in_progress,
      icon: PlayCircle,
      description: "Currently executing",
      color: "text-amber-600",
      bg: "bg-amber-600/10"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      description: "Successfully completed",
      color: "text-green-600",
      bg: "bg-green-600/10"
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      description: "Past scheduled date",
      color: "text-destructive",
      bg: "bg-destructive/10"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="overflow-hidden border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
                <div className={`${metric.bg} ${metric.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
