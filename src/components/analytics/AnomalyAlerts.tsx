/**
 * AnomalyAlerts Component
 * 
 * Displays active anomaly detections with acknowledge/resolve actions
 * Real-time updates via Supabase subscriptions
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import { useAnomalyDetections } from "@/hooks/useAnomalyDetections";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export const AnomalyAlerts = () => {
  const { 
    anomalies, 
    isLoading, 
    acknowledgeAnomaly, 
    resolveAnomaly, 
    markFalsePositive,
    isAcknowledging,
    isResolving 
  } = useAnomalyDetections('active');

  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return <AlertTriangle className="w-4 h-4" />;
  };

  const handleResolve = () => {
    if (selectedAnomalyId) {
      resolveAnomaly({ id: selectedAnomalyId, notes: resolutionNotes });
      setResolveDialogOpen(false);
      setSelectedAnomalyId(null);
      setResolutionNotes('');
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Active Anomalies</h3>
            {anomalies.length > 0 && (
              <Badge variant="destructive">{anomalies.length}</Badge>
            )}
          </div>
        </div>

        {/* Anomaly List */}
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p>No active anomalies detected</p>
            <p className="text-sm mt-2">All systems operating normally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly) => (
              <div key={anomaly.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(anomaly.anomaly_type)}
                    <span className="font-medium text-foreground">{anomaly.anomaly_type.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  {getSeverityBadge(anomaly.severity)}
                </div>

                <p className="text-sm text-foreground mb-2">{anomaly.description}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Score: {anomaly.anomaly_score}/100</span>
                  <span>{new Date(anomaly.detected_at).toLocaleString()}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => acknowledgeAnomaly({ id: anomaly.id })}
                    disabled={isAcknowledging}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Acknowledge
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      setSelectedAnomalyId(anomaly.id);
                      setResolveDialogOpen(true);
                    }}
                    disabled={isResolving}
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markFalsePositive({ id: anomaly.id })}
                  >
                    <X className="w-3 h-3 mr-1" />
                    False Positive
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Anomaly</DialogTitle>
            <DialogDescription>
              Add resolution notes explaining how this anomaly was addressed.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Describe the resolution action taken..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolutionNotes.trim()}>
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};