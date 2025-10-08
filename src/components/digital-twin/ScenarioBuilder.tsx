/**
 * Scenario Builder Component
 * 
 * UI for creating and running what-if simulations
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Play } from 'lucide-react';
import { useDigitalTwinSimulation } from '@/hooks/useDigitalTwinSimulation';
import { SimulationResults } from './SimulationResults';

export function ScenarioBuilder() {
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioType, setScenarioType] = useState<string>('maintenance');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState<any>({});

  const { runSimulation, results, isRunning } = useDigitalTwinSimulation();

  const handleRunSimulation = async () => {
    if (!scenarioName) return;

    await runSimulation({
      name: scenarioName,
      description,
      scenarioType,
      parameters: {
        ...parameters,
        frequency_change: parseFloat(parameters.frequency_change || '1'),
        resource_change: parseFloat(parameters.resource_change || '1'),
        cascade_factor: parseInt(parameters.cascade_factor || '3'),
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Scenario Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Create What-If Scenario
          </CardTitle>
          <CardDescription>
            Model different scenarios to predict outcomes and optimize operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scenario Name */}
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Scenario Name</Label>
            <Input
              id="scenario-name"
              placeholder="e.g., Increase PM Frequency"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
          </div>

          {/* Scenario Type */}
          <div className="space-y-2">
            <Label htmlFor="scenario-type">Scenario Type</Label>
            <Select value={scenarioType} onValueChange={setScenarioType}>
              <SelectTrigger id="scenario-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Maintenance Schedule Change</SelectItem>
                <SelectItem value="failure">Equipment Failure Impact</SelectItem>
                <SelectItem value="resource">Resource Optimization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the scenario..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Dynamic Parameters based on scenario type */}
          {scenarioType === 'maintenance' && (
            <div className="space-y-2">
              <Label htmlFor="frequency-change">Frequency Change (multiplier)</Label>
              <Input
                id="frequency-change"
                type="number"
                step="0.1"
                placeholder="1.0 = no change, 2.0 = double"
                value={parameters.frequency_change || ''}
                onChange={(e) => setParameters({ ...parameters, frequency_change: e.target.value })}
              />
            </div>
          )}

          {scenarioType === 'resource' && (
            <div className="space-y-2">
              <Label htmlFor="resource-change">Resource Change (multiplier)</Label>
              <Input
                id="resource-change"
                type="number"
                step="0.1"
                placeholder="1.0 = no change, 1.5 = 50% increase"
                value={parameters.resource_change || ''}
                onChange={(e) => setParameters({ ...parameters, resource_change: e.target.value })}
              />
            </div>
          )}

          {scenarioType === 'failure' && (
            <div className="space-y-2">
              <Label htmlFor="cascade-factor">Cascade Factor</Label>
              <Input
                id="cascade-factor"
                type="number"
                placeholder="Number of affected assets"
                value={parameters.cascade_factor || ''}
                onChange={(e) => setParameters({ ...parameters, cascade_factor: e.target.value })}
              />
            </div>
          )}

          {/* Run Button */}
          <Button
            className="w-full"
            onClick={handleRunSimulation}
            disabled={!scenarioName || isRunning}
          >
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? 'Running Simulation...' : 'Run Simulation'}
          </Button>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      <SimulationResults results={results} isLoading={isRunning} />
    </div>
  );
}
