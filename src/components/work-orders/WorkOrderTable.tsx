import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { WorkOrder } from "@/hooks/useWorkOrders";
import { format } from "date-fns";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onView: (workOrder: WorkOrder) => void;
  onEdit: (workOrder: WorkOrder) => void;
  onDelete: (id: string) => void;
}

export const WorkOrderTable = ({ workOrders, onView, onEdit, onDelete }: WorkOrderTableProps) => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "outline",
      in_progress: "default",
      completed: "secondary",
      cancelled: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    return (
      <Badge className={colors[priority] || ""}>
        {priority}
      </Badge>
    );
  };

  const getMaintenanceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      preventive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      corrective: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      predictive: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      emergency: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    return (
      <Badge className={colors[type] || ""}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scheduled Date</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No work orders found
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell className="font-medium">{workOrder.title}</TableCell>
                <TableCell>{getMaintenanceTypeBadge(workOrder.maintenance_type)}</TableCell>
                <TableCell>{getPriorityBadge(workOrder.priority)}</TableCell>
                <TableCell>{getStatusBadge(workOrder.status)}</TableCell>
                <TableCell>{format(new Date(workOrder.scheduled_date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{workOrder.assigned_technician || '-'}</TableCell>
                <TableCell>{workOrder.estimated_duration_hours ? `${workOrder.estimated_duration_hours}h` : '-'}</TableCell>
                <TableCell>{workOrder.estimated_cost ? `$${workOrder.estimated_cost.toFixed(2)}` : '-'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(workOrder)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(workOrder)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(workOrder.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
