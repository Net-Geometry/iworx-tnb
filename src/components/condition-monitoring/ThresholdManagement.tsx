import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConditionThresholds, useDeleteThreshold } from '@/hooks/useConditionMonitoring';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ThresholdManagement() {
  const { data: thresholds, isLoading } = useConditionThresholds();
  const deleteMutation = useDeleteThreshold();

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this threshold?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {thresholds?.length || 0} threshold(s) configured
        </p>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Threshold
        </Button>
      </div>

      {!thresholds || thresholds.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No thresholds configured</p>
          <p className="text-sm mt-2">Add thresholds to start monitoring</p>
        </div>
      ) : (
        <div className="space-y-3">
          {thresholds.map((threshold: any) => (
            <Card key={threshold.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{threshold.metric_name}</span>
                      {threshold.enabled ? (
                        <Badge variant="secondary">Active</Badge>
                      ) : (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Asset: {threshold.assets?.name || 'All assets'}
                    </p>
                    
                    <div className="text-sm space-y-1">
                      {threshold.warning_min !== null && (
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-yellow-500/10 text-yellow-700">Warning</Badge>
                          <span>
                            {threshold.warning_min} - {threshold.warning_max}
                          </span>
                        </div>
                      )}
                      {threshold.critical_min !== null && (
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">Critical</Badge>
                          <span>
                            {threshold.critical_min} - {threshold.critical_max}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(threshold.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
