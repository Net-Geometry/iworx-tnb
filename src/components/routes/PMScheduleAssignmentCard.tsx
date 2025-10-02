/**
 * PMScheduleAssignmentCard Component
 * 
 * Displays an individual PM schedule assigned to a route with key details
 * and action buttons for management.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertCircle, User, ExternalLink, X } from "lucide-react";
import { PMSchedule } from "@/hooks/usePMSchedules";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface PMScheduleAssignmentCardProps {
  schedule: PMSchedule;
  onUnassign: (scheduleId: string) => void;
}

export const PMScheduleAssignmentCard = ({
  schedule,
  onUnassign,
}: PMScheduleAssignmentCardProps) => {
  const navigate = useNavigate();

  const isOverdue = schedule.next_due_date && new Date(schedule.next_due_date) < new Date();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "paused":
        return "bg-warning/10 text-warning border-warning/20";
      case "suspended":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getFrequencyLabel = (schedule: PMSchedule) => {
    const { frequency_type, frequency_value } = schedule;
    return `Every ${frequency_value} ${frequency_type}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">
              {schedule.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {schedule.schedule_number}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(schedule.status)}>
              {schedule.status}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUnassign(schedule.id)}
              title="Unassign from route"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Asset Information */}
        {schedule.asset && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-muted-foreground">Asset:</span>
            <span className="text-foreground">
              {schedule.asset.name}
              {schedule.asset.asset_number && ` (${schedule.asset.asset_number})`}
            </span>
          </div>
        )}

        {/* Job Plan Information */}
        {schedule.job_plan && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-muted-foreground">Job Plan:</span>
            <span className="text-foreground">{schedule.job_plan.title}</span>
          </div>
        )}

        {/* Frequency */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{getFrequencyLabel(schedule)}</span>
        </div>

        {/* Next Due Date */}
        {schedule.next_due_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Next Due:</span>
            <span className={isOverdue ? "text-destructive font-medium" : ""}>
              {format(new Date(schedule.next_due_date), "MMM dd, yyyy")}
            </span>
            {isOverdue && (
              <AlertCircle className="h-4 w-4 text-destructive ml-1" />
            )}
          </div>
        )}

        {/* Assigned Person */}
        {schedule.assigned_person && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>
              {schedule.assigned_person.first_name} {schedule.assigned_person.last_name}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/preventive-maintenance/${schedule.id}`)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
