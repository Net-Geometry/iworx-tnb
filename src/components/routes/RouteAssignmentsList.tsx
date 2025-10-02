/**
 * RouteAssignmentsList Component
 * 
 * Main component for managing PM schedule assignments to a route.
 * Displays assigned schedules and provides assignment management interface.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { useRouteAssignments, useUnassignPMScheduleFromRoute } from "@/hooks/useRouteAssignments";
import { PMScheduleAssignmentCard } from "./PMScheduleAssignmentCard";
import { AssignPMScheduleDialog } from "./AssignPMScheduleDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RouteAssignmentsListProps {
  routeId: string;
}

export const RouteAssignmentsList = ({ routeId }: RouteAssignmentsListProps) => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const { data: assignments, isLoading, error } = useRouteAssignments(routeId);
  const unassignMutation = useUnassignPMScheduleFromRoute();

  const handleUnassign = async (scheduleId: string) => {
    if (confirm("Are you sure you want to unassign this PM schedule from the route?")) {
      await unassignMutation.mutateAsync({ scheduleId, routeId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load route assignments. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const activeSchedules = assignments?.filter((s) => s.status === "active") || [];
  const pausedSchedules = assignments?.filter((s) => s.status === "paused") || [];
  const overdueSchedules =
    assignments?.filter(
      (s) => s.next_due_date && new Date(s.next_due_date) < new Date() && s.status === "active"
    ) || [];

  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">PM Schedule Assignments</h3>
          <p className="text-sm text-muted-foreground">
            {assignments?.length || 0} schedule(s) assigned to this route
          </p>
        </div>
        <Button onClick={() => setIsAssignDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Assign PM Schedule
        </Button>
      </div>

      {/* Summary Stats */}
      {assignments && assignments.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-success">{activeSchedules.length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-warning">{pausedSchedules.length}</div>
            <div className="text-sm text-muted-foreground">Paused</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-destructive">{overdueSchedules.length}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {assignments && assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((schedule) => (
            <PMScheduleAssignmentCard
              key={schedule.id}
              schedule={schedule}
              onUnassign={handleUnassign}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">
            No PM schedules assigned to this route yet.
          </p>
          <Button onClick={() => setIsAssignDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Your First PM Schedule
          </Button>
        </div>
      )}

      {/* Assignment Dialog */}
      <AssignPMScheduleDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        routeId={routeId}
      />
    </div>
  );
};
