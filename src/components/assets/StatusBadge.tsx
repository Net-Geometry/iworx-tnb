import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AssetStatus = "operational" | "warning" | "critical" | "offline";

interface StatusBadgeProps {
  status: AssetStatus;
  className?: string;
}

const statusConfig = {
  operational: {
    label: "Operational",
    className: "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
  },
  warning: {
    label: "Warning", 
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
  },
  critical: {
    label: "Critical",
    className: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
  },
  offline: {
    label: "Offline",
    className: "bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20"
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      <div className={`w-2 h-2 rounded-full mr-2 ${
        status === 'operational' ? 'bg-green-500' :
        status === 'warning' ? 'bg-yellow-500' :
        status === 'critical' ? 'bg-red-500' :
        'bg-gray-500'
      }`} />
      {config.label}
    </Badge>
  );
}