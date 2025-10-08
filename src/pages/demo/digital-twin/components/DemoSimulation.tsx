/**
 * Simulation Demo Component
 * What-if scenario builder and results visualization
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { DemoScenarioBuilder } from './DemoScenarioBuilder';
import {
  mockScenarios,
  runSimulation,
  SimulationScenario,
  SimulationResult,
} from '../mock-data/mockSimulations';

export function DemoSimulation() {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunSimulation = () => {
    if (!selectedScenario) return;

    setIsRunning(true);
    setSimulationResult(null);

    // Simulate computation delay
    setTimeout(() => {
      const result = runSimulation(selectedScenario);
      setSimulationResult(result);
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          Test "what-if" scenarios to predict operational impacts! Select a scenario, run the
          simulation, and see projected changes in KPIs, costs, and reliability.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Builder */}
        <DemoScenarioBuilder
          scenarios={mockScenarios}
          selectedScenario={selectedScenario}
          onSelectScenario={setSelectedScenario}
          onRunSimulation={handleRunSimulation}
          isRunning={isRunning}
        />

        {/* Simulation Results */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Simulation Results</h3>

          {!simulationResult ? (
            <div className="text-center text-muted-foreground py-12">
              {isRunning ? (
                <>
                  <div className="animate-spin text-4xl mb-4">⏳</div>
                  <p>Running simulation...</p>
                </>
              ) : (
                <p>Select a scenario and run simulation to see results</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Metrics Comparison */}
              {simulationResult.metrics.map((metric, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-sm">{metric.name}</span>
                    {metric.improved ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Baseline */}
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Current</div>
                      <div className="font-mono text-lg">
                        {metric.baseline.toLocaleString()} {metric.unit}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-muted-foreground" />

                    {/* Simulated */}
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Simulated</div>
                      <div className="font-mono text-lg">
                        {metric.simulated.toLocaleString()} {metric.unit}
                      </div>
                    </div>
                  </div>

                  {/* Change Badge */}
                  <Badge
                    variant={metric.improved ? 'default' : 'destructive'}
                    className="mt-2"
                  >
                    {metric.change > 0 ? '+' : ''}
                    {metric.change}%
                  </Badge>
                </div>
              ))}

              {/* Recommendation */}
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>💡 Recommendation:</strong>
                  <p className="mt-1">{simulationResult.recommendation}</p>
                </AlertDescription>
              </Alert>

              {/* Affected Assets */}
              {simulationResult.affectedAssets.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold mb-2">Affected Assets</h5>
                  <div className="flex flex-wrap gap-2">
                    {simulationResult.affectedAssets.map((assetId) => (
                      <Badge key={assetId} variant="secondary">
                        {assetId.replace('demo-', '').replace(/-/g, ' ').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Integration Example */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-semibold mb-2">Production Integration Example:</h4>
        <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
          {`// Call simulation microservice
const response = await fetch('/api/digital-twin/simulate', {
  method: 'POST',
  body: JSON.stringify({
    scenarioType: 'maintenance',
    parameters: {
      assetType: 'transformer',
      currentFrequency: 'quarterly',
      proposedFrequency: 'monthly'
    }
  })
});

const { metrics, recommendation } = await response.json();

// Use ML models to predict:
// - Failure probability changes
// - Cost-benefit analysis  
// - Resource utilization
// - Downtime reduction`}
        </pre>
      </Card>
    </div>
  );
}
