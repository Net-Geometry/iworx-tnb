import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AssetKPI {
  totalAssets: number;
  criticalAssets: number;
  healthScore: number;
  maintenanceDue: number;
}

export function useAssetKPIs() {
  const [kpis, setKpis] = useState<AssetKPI>({
    totalAssets: 0,
    criticalAssets: 0,
    healthScore: 0,
    maintenanceDue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all assets data
        const { data: assets, error: assetsError } = await supabase
          .from('assets')
          .select('criticality, health_score');

        if (assetsError) throw assetsError;

        // Fetch upcoming maintenance (due within 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const { data: workOrders, error: workOrdersError } = await supabase
          .from('work_orders')
          .select('id')
          .lte('scheduled_date', thirtyDaysFromNow.toISOString().split('T')[0])
          .in('status', ['scheduled', 'in_progress']);

        if (workOrdersError) throw workOrdersError;

        // Calculate KPIs
        const totalAssets = assets?.length || 0;
        const criticalAssets = assets?.filter(asset => asset.criticality === 'critical').length || 0;
        
        // Calculate average health score
        const healthScores = assets?.map(asset => asset.health_score || 0) || [];
        const avgHealthScore = healthScores.length > 0 
          ? healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length 
          : 0;

        const maintenanceDue = workOrders?.length || 0;

        setKpis({
          totalAssets,
          criticalAssets,
          healthScore: Math.round(avgHealthScore * 10) / 10, // Round to 1 decimal place
          maintenanceDue,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch KPIs');
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  return { kpis, loading, error, refetch: () => setLoading(true) };
}