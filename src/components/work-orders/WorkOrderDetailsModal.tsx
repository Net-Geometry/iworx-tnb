import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/hooks/useWorkOrders";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Edit, RefreshCw, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: string;
  name: string;
  asset_number?: string;
  status?: string;
  hierarchy_node_id?: string;
  hierarchy_nodes?: {
    name: string;
    path?: string;
  };
}

interface PMSchedule {
  id: string;
  title: string;
  schedule_number: string;
  frequency_type: string;
}

interface WorkOrderDetailsModalProps {
  workOrder: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (workOrder: WorkOrder) => void;
  onStatusUpdate?: () => void;
}

export const WorkOrderDetailsModal = ({ 
  workOrder, 
  open, 
  onOpenChange, 
  onEdit,
  onStatusUpdate 
}: WorkOrderDetailsModalProps) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [pmSchedule, setPMSchedule] = useState<PMSchedule | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch asset and PM schedule details when modal opens
  useEffect(() => {
    if (open && workOrder) {
      fetchDetails();
    }
  }, [open, workOrder?.id]);

  const fetchDetails = async () => {
    if (!workOrder) return;
    
    setLoadingDetails(true);
    try {
      // Fetch asset details
      const { data: assetData } = await supabase
        .from('assets')
        .select('id, name, asset_number, status, hierarchy_node_id')
        .eq('id', workOrder.asset_id)
        .single();

      if (assetData) {
        // Fetch hierarchy node separately (cross-schema relationship)
        let hierarchyNodeName = 'Unassigned';
        if (assetData.hierarchy_node_id) {
          const { data: nodeData } = await supabase
            .from('hierarchy_nodes')
            .select('name, path')
            .eq('id', assetData.hierarchy_node_id)
            .single();
          
          if (nodeData) {
            hierarchyNodeName = nodeData.name;
          }
        }
        
        setAsset({
          ...assetData,
          hierarchy_nodes: { name: hierarchyNodeName }
        });
      }

      // Fetch PM schedule if linked
      if (workOrder.pm_schedule_id) {
        const { data: scheduleData } = await supabase
          .from('pm_schedules')
          .select('id, name, title, schedule_number, frequency_type')
          .eq('id', workOrder.pm_schedule_id)
          .single();

        if (scheduleData) {
          setPMSchedule(scheduleData);
        }
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!workOrder) return;
    
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', workOrder.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work order status updated successfully"
      });

      onStatusUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update work order status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!workOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Work Order Details</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit?.(workOrder);
                  onOpenChange(false);
                }}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">{workOrder.title}</h3>
            <div className="flex gap-2 flex-wrap items-center">
              <Select
                value={workOrder.status}
                onValueChange={handleStatusUpdate}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <RefreshCw className={`w-4 h-4 mr-2 ${updatingStatus ? 'animate-spin' : ''}`} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Badge className={
                workOrder.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                workOrder.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                workOrder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }>
                {workOrder.priority} priority
              </Badge>
              <Badge className={
                workOrder.maintenance_type === 'emergency' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                workOrder.maintenance_type === 'preventive' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                workOrder.maintenance_type === 'predictive' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              }>
                {workOrder.maintenance_type}
              </Badge>
              {workOrder.generation_type === 'automatic' && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  Auto-generated
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Asset Information */}
          {asset && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground">Asset Information</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate(`/assets/${asset.id}`);
                    onOpenChange(false);
                  }}
                  className="gap-1"
                >
                  View Asset <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1">
                <p className="font-medium">{asset.name}</p>
                {asset.asset_number && (
                  <p className="text-sm text-muted-foreground">Asset #: {asset.asset_number}</p>
                )}
                {asset.hierarchy_nodes?.path && (
                  <p className="text-sm text-muted-foreground">Location: {asset.hierarchy_nodes.path}</p>
                )}
                {asset.status && (
                  <Badge variant="outline" className="text-xs">
                    {asset.status}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* PM Schedule Information */}
          {pmSchedule && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground">Source PM Schedule</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate('/preventive-maintenance');
                    onOpenChange(false);
                  }}
                  className="gap-1"
                >
                  View Schedule <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1">
                <p className="font-medium">{pmSchedule.title}</p>
                <p className="text-sm text-muted-foreground">Schedule #: {pmSchedule.schedule_number}</p>
                <Badge variant="outline" className="text-xs">
                  {pmSchedule.frequency_type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          )}

          {/* Description */}
          {workOrder.description && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Description</h4>
              <p className="text-sm">{workOrder.description}</p>
            </div>
          )}

          {/* Schedule Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Scheduled Date</h4>
              <p className="text-sm">{format(new Date(workOrder.scheduled_date), 'MMMM dd, yyyy')}</p>
            </div>
            {workOrder.estimated_duration_hours && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Estimated Duration</h4>
                <p className="text-sm">{workOrder.estimated_duration_hours} hours</p>
              </div>
            )}
          </div>

          {/* Assignment & Cost */}
          <div className="grid grid-cols-2 gap-4">
            {workOrder.assigned_technician && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Assigned To</h4>
                <p className="text-sm">{workOrder.assigned_technician}</p>
              </div>
            )}
            {workOrder.estimated_cost && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Estimated Cost</h4>
                <p className="text-sm">${workOrder.estimated_cost.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {workOrder.notes && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Notes</h4>
                <p className="text-sm whitespace-pre-wrap">{workOrder.notes}</p>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span> {format(new Date(workOrder.created_at), 'MMM dd, yyyy HH:mm')}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {format(new Date(workOrder.updated_at), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
