import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { WorkOrder } from "@/hooks/useWorkOrders";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface WorkOrderDetailsModalProps {
  workOrder: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WorkOrderDetailsModal = ({ workOrder, open, onOpenChange }: WorkOrderDetailsModalProps) => {
  if (!workOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Work Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{workOrder.title}</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={workOrder.status === 'completed' ? 'secondary' : 'default'}>
                {workOrder.status.replace('_', ' ')}
              </Badge>
              <Badge className={
                workOrder.priority === 'critical' ? 'bg-red-100 text-red-800' :
                workOrder.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                workOrder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }>
                {workOrder.priority} priority
              </Badge>
              <Badge className={
                workOrder.maintenance_type === 'emergency' ? 'bg-red-100 text-red-800' :
                workOrder.maintenance_type === 'preventive' ? 'bg-green-100 text-green-800' :
                workOrder.maintenance_type === 'predictive' ? 'bg-purple-100 text-purple-800' :
                'bg-amber-100 text-amber-800'
              }>
                {workOrder.maintenance_type}
              </Badge>
            </div>
          </div>

          <Separator />

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
