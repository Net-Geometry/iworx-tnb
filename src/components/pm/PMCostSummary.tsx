import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingUp } from "lucide-react";

/**
 * PMCostSummary Component
 * Displays a comprehensive cost breakdown for PM schedule planning
 */

interface PMCostSummaryProps {
  materialCost: number;
  laborCost: number;
  otherCosts?: number;
}

export const PMCostSummary = ({ 
  materialCost = 0, 
  laborCost = 0, 
  otherCosts = 0 
}: PMCostSummaryProps) => {
  const totalCost = materialCost + laborCost + otherCosts;

  const costBreakdown = [
    {
      label: "Material Costs",
      amount: materialCost,
      percentage: totalCost > 0 ? (materialCost / totalCost) * 100 : 0,
      color: "bg-blue-500"
    },
    {
      label: "Labor Costs",
      amount: laborCost,
      percentage: totalCost > 0 ? (laborCost / totalCost) * 100 : 0,
      color: "bg-green-500"
    },
    {
      label: "Other Costs",
      amount: otherCosts,
      percentage: totalCost > 0 ? (otherCosts / totalCost) * 100 : 0,
      color: "bg-orange-500"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cost Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost Breakdown */}
        <div className="space-y-4">
          {costBreakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="font-semibold">${item.amount.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} transition-all duration-300`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {item.percentage.toFixed(1)}% of total
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Total Cost */}
        <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Total Estimated Cost
            </span>
            <span className="text-2xl font-bold text-primary">
              ${totalCost.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            This is the estimated total cost for this PM schedule execution
          </p>
        </div>

        {/* Cost Breakdown Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-muted-foreground">Materials & Parts</span>
            <span className="font-medium">${materialCost.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-muted-foreground">Labor (Time × Rate)</span>
            <span className="font-medium">${laborCost.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-muted-foreground">Other Expenses</span>
            <span className="font-medium">${otherCosts.toFixed(2)}</span>
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between py-2">
            <span className="font-semibold">Grand Total</span>
            <span className="text-xl font-bold text-primary">${totalCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Budget Alert */}
        {totalCost === 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              💡 Configure materials and labor to see cost estimation
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
