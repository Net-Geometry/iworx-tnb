/**
 * Scenario Builder Component
 * UI for creating what-if simulations
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationScenario } from '../mock-data/mockSimulations';

interface DemoScenarioBuilderProps {
  scenarios: SimulationScenario[];
  selectedScenario: SimulationScenario | null;
  onSelectScenario: (scenario: SimulationScenario) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
}

export function DemoScenarioBuilder({
  scenarios,
  selectedScenario,
  onSelectScenario,
  onRunSimulation,
  isRunning,
}: DemoScenarioBuilderProps) {
  const scenarioTypeColors = {
    maintenance: 'bg-blue-500/20 text-blue-300',
    resource: 'bg-green-500/20 text-green-300',
    failure: 'bg-red-500/20 text-red-300',
  };

  const scenarioTypeIcons = {
    maintenance: '🔧',
    resource: '👥',
    failure: '⚠️',
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Select Scenario to Simulate</h3>

      <div className="space-y-3 mb-4">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario)}
            className={`w-full text-left p-4 rounded border transition-colors ${
              selectedScenario?.id === scenario.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{scenarioTypeIcons[scenario.scenarioType]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{scenario.name}</h4>
                  <Badge className={scenarioTypeColors[scenario.scenarioType]}>
                    {scenario.scenarioType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedScenario && (
        <>
          <div className="mb-4 p-3 bg-muted rounded">
            <h5 className="text-sm font-semibold mb-2">Scenario Parameters</h5>
            <div className="text-xs space-y-1 text-muted-foreground">
              {Object.entries(selectedScenario.parameters).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-mono">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={onRunSimulation}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? '⏳ Running Simulation...' : '▶️ Run Simulation'}
          </Button>
        </>
      )}
    </Card>
  );
}
