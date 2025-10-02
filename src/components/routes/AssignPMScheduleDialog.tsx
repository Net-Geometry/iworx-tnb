/**
 * AssignPMScheduleDialog Component
 * 
 * Dialog for selecting and assigning PM schedules to a route.
 * Allows single or bulk assignment of unassigned PM schedules.
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { useUnassignedPMSchedules, useBulkAssignPMSchedulesToRoute } from "@/hooks/useRouteAssignments";
import { format } from "date-fns";

interface AssignPMScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeId: string;
}

export const AssignPMScheduleDialog = ({
  open,
  onOpenChange,
  routeId,
}: AssignPMScheduleDialogProps) => {
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);

  const { data: unassignedSchedules, isLoading } = useUnassignedPMSchedules();
  const bulkAssignMutation = useBulkAssignPMSchedulesToRoute();

  const handleToggleSchedule = (scheduleId: string) => {
    setSelectedScheduleIds((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((id) => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedScheduleIds.length === unassignedSchedules?.length) {
      setSelectedScheduleIds([]);
    } else {
      setSelectedScheduleIds(unassignedSchedules?.map((s) => s.id) || []);
    }
  };

  const handleAssign = async () => {
    if (selectedScheduleIds.length === 0) return;

    await bulkAssignMutation.mutateAsync({
      scheduleIds: selectedScheduleIds,
      routeId,
    });

    setSelectedScheduleIds([]);
    onOpenChange(false);
  };

  const getFrequencyLabel = (frequencyType: string, frequencyValue: number) => {
    return `Every ${frequencyValue} ${frequencyType}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assign PM Schedules to Route</DialogTitle>
          <DialogDescription>
            Select one or more PM schedules to assign to this route. Only unassigned schedules are shown.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : unassignedSchedules && unassignedSchedules.length > 0 ? (
          <>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedScheduleIds.length === unassignedSchedules.length}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All ({unassignedSchedules.length})
                </label>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedScheduleIds.length} selected
              </span>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {unassignedSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleToggleSchedule(schedule.id)}
                  >
                    <Checkbox
                      checked={selectedScheduleIds.includes(schedule.id)}
                      onCheckedChange={() => handleToggleSchedule(schedule.id)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium">{schedule.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {schedule.schedule_number}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {schedule.status}
                        </Badge>
                      </div>

                      {schedule.asset && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Asset:</span> {schedule.asset.name}
                          {schedule.asset.asset_number && ` (${schedule.asset.asset_number})`}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{getFrequencyLabel(schedule.frequency_type, schedule.frequency_value)}</span>
                        </div>
                        {schedule.next_due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {format(new Date(schedule.next_due_date), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No unassigned PM schedules available.</p>
            <p className="text-sm mt-2">All active PM schedules are already assigned to routes.</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedScheduleIds.length === 0 || bulkAssignMutation.isPending}
          >
            {bulkAssignMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Assign {selectedScheduleIds.length > 0 && `(${selectedScheduleIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
