import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConditionAlarms, useAcknowledgeAlarm, useCreateWorkOrderFromAlarm } from '@/hooks/useConditionMonitoring';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Wrench } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActiveAlarmsListProps {
  onAssetSelect: (assetId: string) => void;
}

export function ActiveAlarmsList({ onAssetSelect }: ActiveAlarmsListProps) {
  const { data: alarms, isLoading } = useConditionAlarms({ status: 'active' });
  const acknowledgeMutation = useAcknowledgeAlarm();
  const createWOMutation = useCreateWorkOrderFromAlarm();

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (!alarms || alarms.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
        <p>No active alarms</p>
        <p className="text-sm mt-2">All systems operating normally</p>
      </div>
    );
  }

  const handleAcknowledge = (alarmId: string) => {
    acknowledgeMutation.mutate({ alarmId });
  };

  const handleCreateWO = (alarmId: string) => {
    createWOMutation.mutate({ alarmId });
  };

  return (
    <div className="space-y-3">
      {alarms.map((alarm: any) => (
        <Card key={alarm.id} className="border-l-4" style={{
          borderLeftColor: alarm.alarm_type === 'critical' ? 'hsl(var(--destructive))' : 'hsl(var(--warning))'
        }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={alarm.alarm_type === 'critical' ? 'destructive' : 'default'}>
                    {alarm.alarm_type.toUpperCase()}
                  </Badge>
                  <span className="font-semibold">{alarm.assets?.name}</span>
                </div>
                
                <p className="text-sm mb-1">
                  <strong>{alarm.metric_name}:</strong> {alarm.triggered_value} 
                  (threshold: {alarm.threshold_value})
                </p>
                
                <p className="text-xs text-muted-foreground">
                  Triggered {formatDistanceToNow(new Date(alarm.created_at), { addSuffix: true })}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcknowledge(alarm.id)}
                  disabled={acknowledgeMutation.isPending}
                >
                  Acknowledge
                </Button>
                
                {!alarm.work_order_id && (
                  <Button
                    size="sm"
                    onClick={() => handleCreateWO(alarm.id)}
                    disabled={createWOMutation.isPending}
                  >
                    <Wrench className="w-4 h-4 mr-1" />
                    Create WO
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
