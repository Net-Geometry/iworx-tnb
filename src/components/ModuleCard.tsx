import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stats: {
    label: string;
    value: string;
    trend?: "up" | "down" | "stable";
  }[];
  status: "active" | "warning" | "critical";
  gradient: string;
  onClick?: () => void;
}

const ModuleCard = ({ title, description, icon: Icon, stats, status, gradient, onClick }: ModuleCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent-success text-primary-foreground";
      case "warning":
        return "bg-warning text-warning-foreground";
      case "critical":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="group hover:shadow-hover transition-all duration-300 cursor-pointer bg-gradient-card border border-border/50" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-3`}>
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <Badge variant="outline" className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-foreground">{stat.value}</span>
                {stat.trend && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      stat.trend === "up"
                        ? "bg-accent-success/10 text-accent-success"
                        : stat.trend === "down"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stat.trend === "up" ? "↗" : stat.trend === "down" ? "↘" : "→"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;