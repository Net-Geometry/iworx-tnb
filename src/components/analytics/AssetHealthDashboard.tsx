/**
 * AssetHealthDashboard Component
 * 
 * Displays ML-predicted asset health scores with risk indicators
 * Shows failure probabilities and contributing factors
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingDown, AlertTriangle } from "lucide-react";
import { useMLPredictions } from "@/hooks/useMLPredictions";
import { HealthIndicator } from "@/components/assets/HealthIndicator";
import { Skeleton } from "@/components/ui/skeleton";

export const AssetHealthDashboard = () => {
  const { predictions, riskStats, isLoading } = useMLPredictions(undefined, 'health_score');

  const getRiskBadge = (healthScore?: number) => {
    if (!healthScore) return <Badge variant="secondary">No Data</Badge>;
    if (healthScore >= 85) return <Badge className="bg-green-500">Low Risk</Badge>;
    if (healthScore >= 70) return <Badge className="bg-yellow-500">Medium Risk</Badge>;
    if (healthScore >= 50) return <Badge className="bg-orange-500">High Risk</Badge>;
    return <Badge variant="destructive">Critical Risk</Badge>;
  };

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
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Asset Health Monitoring</h3>
        </div>
        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="bg-green-500/10">Low: {riskStats.low}</Badge>
          <Badge variant="outline" className="bg-yellow-500/10">Medium: {riskStats.medium}</Badge>
          <Badge variant="outline" className="bg-orange-500/10">High: {riskStats.high}</Badge>
          <Badge variant="outline" className="bg-red-500/10">Critical: {riskStats.critical}</Badge>
        </div>
      </div>

      {/* Asset List */}
      {predictions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No ML health predictions available yet</p>
          <p className="text-sm mt-2">Predictions will appear as assets are analyzed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {predictions.slice(0, 5).map((prediction) => (
            <div key={prediction.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {prediction.assets?.name || 'Unknown Asset'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {prediction.assets?.asset_number}
                  </p>
                </div>
                {getRiskBadge(prediction.health_score)}
              </div>

              {/* Health Score */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Health Score</span>
                  <span className="font-medium">{prediction.health_score || 0}%</span>
                </div>
                <HealthIndicator score={prediction.health_score || 0} showLabel={false} />
              </div>

              {/* Failure Probabilities */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">30 Days</p>
                  <div className="flex items-center gap-1">
                    <TrendingDown className={`w-3 h-3 ${(prediction.failure_probability_30d || 0) > 50 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <span className="font-medium">{prediction.failure_probability_30d || 0}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">60 Days</p>
                  <div className="flex items-center gap-1">
                    <TrendingDown className={`w-3 h-3 ${(prediction.failure_probability_60d || 0) > 50 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <span className="font-medium">{prediction.failure_probability_60d || 0}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">90 Days</p>
                  <div className="flex items-center gap-1">
                    <TrendingDown className={`w-3 h-3 ${(prediction.failure_probability_90d || 0) > 50 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <span className="font-medium">{prediction.failure_probability_90d || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Confidence */}
              <div className="mt-2 text-xs text-muted-foreground">
                Confidence: {prediction.confidence_score}% • {prediction.model_type}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};