import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Network, TrendingDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LucideIcon = typeof Layers;

/**
 * HierarchyStats Component
 * 
 * Displays KPI cards for hierarchy metrics such as total levels, nodes, 
 * max depth, and coverage percentage.
 */

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  colorClass = "text-primary"
}: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", colorClass)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface HierarchyStatsProps {
  stats: {
    totalLevels: number;
    totalNodes: number;
    maxDepth: number;
    coverage: number;
    activeNodes?: number;
    inactiveNodes?: number;
  };
}

export const HierarchyStats = ({ stats }: HierarchyStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Levels"
        value={stats.totalLevels}
        icon={Layers}
        description="Hierarchy depth levels"
        colorClass="text-blue-600"
      />
      
      <StatCard
        title="Total Nodes"
        value={stats.totalNodes}
        icon={Network}
        description={`${stats.activeNodes || 0} active, ${stats.inactiveNodes || 0} inactive`}
        colorClass="text-green-600"
      />
      
      <StatCard
        title="Max Depth"
        value={stats.maxDepth}
        icon={TrendingDown}
        description="Deepest hierarchy level"
        colorClass="text-purple-600"
      />
      
      <StatCard
        title="Coverage"
        value={`${stats.coverage}%`}
        icon={CheckCircle2}
        description="Assets assigned to hierarchy"
        colorClass="text-orange-600"
      />
    </div>
  );
};
