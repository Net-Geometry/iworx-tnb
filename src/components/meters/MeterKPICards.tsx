import { Card } from '@/components/ui/card';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Meter } from '@/hooks/useMeters';

interface MeterKPICardsProps {
  meters: Meter[];
}

/**
 * MeterKPICards - Displays key performance indicators for meters
 * Shows total count, status breakdown, and health metrics
 */
export function MeterKPICards({ meters }: MeterKPICardsProps) {
  const totalMeters = meters.length;
  const activeMeters = meters.filter(m => m.status === 'active').length;
  const faultyMeters = meters.filter(m => m.status === 'faulty').length;
  const avgHealthScore = meters.length > 0
    ? Math.round(meters.reduce((sum, m) => sum + m.health_score, 0) / meters.length)
    : 0;

  const kpis = [
    {
      title: 'Total Meters',
      value: totalMeters,
      icon: Activity,
      description: 'Registered meters',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Meters',
      value: activeMeters,
      icon: CheckCircle,
      description: 'Currently operational',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Faulty Meters',
      value: faultyMeters,
      icon: AlertTriangle,
      description: 'Requiring attention',
      gradient: 'from-red-500 to-orange-500',
    },
    {
      title: 'Avg Health Score',
      value: `${avgHealthScore}%`,
      icon: XCircle,
      description: 'Overall health',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.gradient}`}>
              <kpi.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
