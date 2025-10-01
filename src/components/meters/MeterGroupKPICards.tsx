import { Card, CardContent } from '@/components/ui/card';
import { Users, Activity, Zap, TrendingUp } from 'lucide-react';
import { MeterGroup } from '@/hooks/useMeterGroups';

interface MeterGroupKPICardsProps {
  meterGroups: MeterGroup[];
}

/**
 * MeterGroupKPICards - Display key metrics for meter groups
 * Shows total groups, active/inactive counts, and group type distribution
 */
export function MeterGroupKPICards({ meterGroups }: MeterGroupKPICardsProps) {
  const totalGroups = meterGroups.length;
  const activeGroups = meterGroups.filter(g => g.is_active).length;
  const inactiveGroups = totalGroups - activeGroups;
  
  // Count groups by type
  const groupTypes = meterGroups.reduce((acc, group) => {
    const type = group.group_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonType = Object.entries(groupTypes).sort((a, b) => b[1] - a[1])[0];

  const kpis = [
    {
      title: 'Total Groups',
      value: totalGroups,
      icon: Users,
      description: 'All meter groups',
      gradient: 'from-primary/20 to-primary/5',
    },
    {
      title: 'Active Groups',
      value: activeGroups,
      icon: Activity,
      description: `${inactiveGroups} inactive`,
      gradient: 'from-green-500/20 to-green-500/5',
    },
    {
      title: 'Group Types',
      value: Object.keys(groupTypes).length,
      icon: Zap,
      description: 'Different categories',
      gradient: 'from-blue-500/20 to-blue-500/5',
    },
    {
      title: 'Most Common',
      value: mostCommonType?.[0] || 'N/A',
      icon: TrendingUp,
      description: `${mostCommonType?.[1] || 0} groups`,
      gradient: 'from-purple-500/20 to-purple-500/5',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {typeof kpi.value === 'string' ? kpi.value : kpi.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {kpi.description}
                  </p>
                </div>
                <div className={`rounded-lg bg-gradient-to-br ${kpi.gradient} p-3`}>
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
