import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AssetCriticality = "low" | "medium" | "high" | "critical";

interface CriticalityBadgeProps {
  criticality: AssetCriticality;
  className?: string;
}

const criticalityConfig = {
  critical: {
    label: "C",
    fullLabel: "Critical",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
    dotColor: "bg-red-500"
  },
  high: {
    label: "H",
    fullLabel: "High",
    className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    dotColor: "bg-orange-500"
  },
  medium: {
    label: "M", 
    fullLabel: "Medium",
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    dotColor: "bg-yellow-500"
  },
  low: {
    label: "L",
    fullLabel: "Low", 
    className: "bg-green-500/10 text-green-500 border-green-500/20",
    dotColor: "bg-green-500"
  }
};

export function CriticalityBadge({ criticality, className }: CriticalityBadgeProps) {
  const config = criticalityConfig[criticality];
  
  return (
    <Badge 
      variant="outline"
      className={cn(config.className, "h-6 w-6 rounded-full p-0 flex items-center justify-center", className)}
      title={config.fullLabel}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
    </Badge>
  );
}