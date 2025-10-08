/**
 * Mock Simulation Results for What-If Scenarios
 */

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  scenarioType: 'maintenance' | 'failure' | 'resource';
  parameters: Record<string, any>;
}

export interface SimulationMetric {
  name: string;
  baseline: number;
  simulated: number;
  change: number; // percentage
  unit: string;
  improved: boolean;
}

export interface SimulationResult {
  scenarioId: string;
  metrics: SimulationMetric[];
  affectedAssets: string[];
  recommendation: string;
}

// Predefined scenarios
export const mockScenarios: SimulationScenario[] = [
  {
    id: 'scenario-1',
    name: 'Increase PM Frequency',
    description: 'Change transformer maintenance from quarterly to monthly',
    scenarioType: 'maintenance',
    parameters: {
      currentFrequency: 'quarterly',
      proposedFrequency: 'monthly',
      assetType: 'transformer',
    },
  },
  {
    id: 'scenario-2',
    name: 'Add 2 Technicians',
    description: 'Increase maintenance crew from 5 to 7 technicians',
    scenarioType: 'resource',
    parameters: {
      currentStaffing: 5,
      proposedStaffing: 7,
    },
  },
  {
    id: 'scenario-3',
    name: 'Equipment Failure Simulation',
    description: 'Simulate impact of Transformer T3 complete failure',
    scenarioType: 'failure',
    parameters: {
      assetId: 'demo-transformer-3',
      failureType: 'complete',
    },
  },
];

/**
 * Simulate scenario and return predicted results
 */
export const runSimulation = (scenario: SimulationScenario): SimulationResult => {
  if (scenario.scenarioType === 'maintenance') {
    return {
      scenarioId: scenario.id,
      metrics: [
        {
          name: 'Annual Downtime',
          baseline: 120,
          simulated: 95,
          change: -21,
          unit: 'hours',
          improved: true,
        },
        {
          name: 'Maintenance Cost',
          baseline: 50000,
          simulated: 54000,
          change: 8,
          unit: 'USD',
          improved: false,
        },
        {
          name: 'Equipment Reliability',
          baseline: 92,
          simulated: 97,
          change: 5,
          unit: '%',
          improved: true,
        },
        {
          name: 'Failure Rate',
          baseline: 3.2,
          simulated: 1.8,
          change: -44,
          unit: 'per year',
          improved: true,
        },
      ],
      affectedAssets: ['demo-transformer-1', 'demo-transformer-2', 'demo-transformer-3'],
      recommendation:
        'Recommended: Increasing PM frequency reduces downtime by 21% and improves reliability significantly. The 8% cost increase delivers strong ROI.',
    };
  }

  if (scenario.scenarioType === 'resource') {
    return {
      scenarioId: scenario.id,
      metrics: [
        {
          name: 'Average Response Time',
          baseline: 45,
          simulated: 28,
          change: -38,
          unit: 'minutes',
          improved: true,
        },
        {
          name: 'Work Order Completion Rate',
          baseline: 85,
          simulated: 94,
          change: 11,
          unit: '%',
          improved: true,
        },
        {
          name: 'Labor Cost',
          baseline: 300000,
          simulated: 384000,
          change: 28,
          unit: 'USD/year',
          improved: false,
        },
        {
          name: 'Overtime Hours',
          baseline: 520,
          simulated: 180,
          change: -65,
          unit: 'hours/year',
          improved: true,
        },
      ],
      affectedAssets: [],
      recommendation:
        'Recommended: Adding technicians dramatically improves response times and reduces overtime. Labor cost increase is offset by efficiency gains.',
    };
  }

  // Failure scenario
  return {
    scenarioId: scenario.id,
    metrics: [
      {
        name: 'Affected Circuits',
        baseline: 0,
        simulated: 12,
        change: 100,
        unit: 'circuits',
        improved: false,
      },
      {
        name: 'Customers Impacted',
        baseline: 0,
        simulated: 3500,
        change: 100,
        unit: 'customers',
        improved: false,
      },
      {
        name: 'Estimated Repair Time',
        baseline: 0,
        simulated: 48,
        change: 100,
        unit: 'hours',
        improved: false,
      },
      {
        name: 'Load Transfer Capacity',
        baseline: 100,
        simulated: 65,
        change: -35,
        unit: '%',
        improved: false,
      },
    ],
    affectedAssets: ['demo-transformer-3', 'demo-switchgear-3'],
    recommendation:
      'High Risk: Transformer T3 failure would impact 3,500 customers. Consider replacing this critical asset or adding redundancy.',
  };
};
