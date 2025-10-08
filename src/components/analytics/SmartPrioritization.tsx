/**
 * SmartPrioritization Component
 * 
 * Displays AI-prioritized work orders based on:
 * - Failure risk scores
 * - Business impact
 * - Resource availability
 * - Safety considerations
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, ExternalLink, Info } from "lucide-react";
import { usePredictiveAnalytics } from "@/hooks/usePredictiveAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const SmartPrioritization = () => {
  const { aiWorkOrders, isLoading } = usePredictiveAnalytics();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI-Prioritized Work Orders</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Work orders are prioritized using ML predictions of failure risk,
                  asset criticality, and business impact analysis.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Link to="/work-orders">
          <Button variant="outline" size="sm">
            View All
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Work Orders List */}
      {aiWorkOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No AI-prioritized work orders available</p>
          <p className="text-sm mt-2">Work orders will appear as ML predictions are generated</p>
        </div>
      ) : (
        <div className="space-y-3">
          {aiWorkOrders.map((wo: any, index: number) => (
            <div key={wo.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-foreground">{wo.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{wo.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {wo.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {wo.priority}
                  </Badge>
                </div>
                <Link to={`/work-orders/${wo.id}`}>
                  <Button size="sm" variant="ghost">
                    View Details
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};