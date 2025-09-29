import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AssetStatus = "operational" | "maintenance" | "out_of_service" | "decommissioned";

interface StatusBadgeProps {
  status: AssetStatus;
  className?: string;
}

const statusConfig = {
  operational: {
    label: "Operational",
    className: "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
  },
  maintenance: {
    label: "Maintenance", 
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
  },
  out_of_service: {
    label: "Out of Service",
    className: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
  },
  decommissioned: {
    label: "Decommissioned",
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
        status === 'maintenance' ? 'bg-yellow-500' :
        status === 'out_of_service' ? 'bg-red-500' :
        'bg-gray-500'
      }`} />
      {config.label}
    </Badge>
  );
}