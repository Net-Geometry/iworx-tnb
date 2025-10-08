/**
 * Simulation Results Component
 * 
 * Displays outcomes and metrics from what-if simulations
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SimulationMetric {
  name: string;
  baseline: number;
  simulated: number;
  change: number;
  unit: string;
  description: string;
}

interface SimulationResult {
  scenario: any;
  results: {
    metrics: SimulationMetric[];
    recommendations: string[];
    affectedAssets: string[];
  };
}

interface SimulationResultsProps {
  results: SimulationResult | null;
  isLoading: boolean;
}

export function SimulationResults({ results, isLoading }: SimulationResultsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Simulation Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Simulation Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-12">
          Run a simulation to see results
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Results</CardTitle>
        <p className="text-sm text-muted-foreground">{results.scenario.name}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        {results.results.metrics.map((metric, idx) => (
          <div key={idx} className="p-4 border rounded-lg space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{metric.name}</h4>
                <p className="text-sm text-muted-foreground">{metric.description}</p>
              </div>
              <Badge variant={metric.change >= 0 ? 'default' : 'destructive'}>
                {metric.change >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {Math.abs(metric.change).toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono">{metric.baseline.toFixed(1)} {metric.unit}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono font-bold">{metric.simulated.toFixed(1)} {metric.unit}</span>
            </div>
          </div>
        ))}

        {/* Recommendations */}
        {results.results.recommendations.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Recommendations</h4>
            <ul className="space-y-1 text-sm">
              {results.results.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
