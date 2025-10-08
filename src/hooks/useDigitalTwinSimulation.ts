/**
 * Digital Twin Simulation Hook
 * 
 * Runs what-if scenario simulations via digital-twin-service
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimulationRequest {
  name: string;
  description: string;
  scenarioType: string;
  parameters: any;
}

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

export const useDigitalTwinSimulation = () => {
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runSimulation = async (request: SimulationRequest) => {
    setIsRunning(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('digital-twin-service/simulate', {
        body: request,
      });

      if (error) {
        throw error;
      }

      setResults(data);
      
      toast({
        title: 'Simulation Complete',
        description: `${data.results.metrics.length} metrics calculated`,
      });

      return data;
    } catch (error: any) {
      console.error('Simulation error:', error);
      toast({
        title: 'Simulation Failed',
        description: error.message || 'Failed to run simulation',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsRunning(false);
    }
  };

  return {
    runSimulation,
    results,
    isRunning,
  };
};
