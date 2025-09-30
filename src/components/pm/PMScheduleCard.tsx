import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, MoreVertical, Play, Pause, Edit, Trash2, Clock } from "lucide-react";
import { PMSchedule } from "@/hooks/usePMSchedules";
import { format, differenceInDays, parseISO } from "date-fns";

interface PMScheduleCardProps {
  schedule: PMSchedule;
  onEdit: (schedule: PMSchedule) => void;
  onDelete: (id: string) => void;
  onPause: (id: string, pause: boolean) => void;
  onView: (schedule: PMSchedule) => void;
}

/**
 * PMScheduleCard Component
 * Displays a single PM schedule in card format
 */
const PMScheduleCard = ({ schedule, onEdit, onDelete, onPause, onView }: PMScheduleCardProps) => {
  // Calculate due date status
  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate) return { color: "text-muted-foreground", label: "Not scheduled", bgColor: "bg-muted" };
    
    const days = differenceInDays(parseISO(dueDate), new Date());
    
    if (days < 0) {
      return { color: "text-destructive", label: `${Math.abs(days)} days overdue`, bgColor: "bg-destructive" };
    } else if (days <= 7) {
      return { color: "text-warning", label: `Due in ${days} days`, bgColor: "bg-warning" };
    } else {
      return { color: "text-success", label: `Due in ${days} days`, bgColor: "bg-success" };
    }
  };

  const dueDateStatus = getDueDateStatus(schedule.next_due_date);

  // Format frequency display
  const getFrequencyDisplay = () => {
    const { frequency_type, frequency_value, frequency_unit } = schedule;
    
    if (frequency_type === 'daily') return `Every ${frequency_value} day${frequency_value > 1 ? 's' : ''}`;
    if (frequency_type === 'weekly') return `Every ${frequency_value} week${frequency_value > 1 ? 's' : ''}`;
    if (frequency_type === 'monthly') return `Every ${frequency_value} month${frequency_value > 1 ? 's' : ''}`;
    if (frequency_type === 'quarterly') return 'Every quarter';
    if (frequency_type === 'yearly') return `Every ${frequency_value} year${frequency_value > 1 ? 's' : ''}`;
    if (frequency_type === 'custom' && frequency_unit) {
      return `Every ${frequency_value} ${frequency_unit}`;
    }
    
    return 'Custom frequency';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onView(schedule)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{schedule.title}</CardTitle>
              <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                {schedule.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{schedule.schedule_number}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(schedule); }}>
                <Calendar className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(schedule); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onPause(schedule.id, schedule.status === 'active'); 
                }}
              >
                {schedule.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(schedule.id); }}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Asset Information */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Asset</p>
          <p className="text-sm text-muted-foreground">
            {schedule.asset?.name || 'Unknown Asset'}
            {schedule.asset?.asset_number && ` (${schedule.asset.asset_number})`}
          </p>
        </div>

        {/* Job Plan */}
        {schedule.job_plan && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Job Plan</p>
            <p className="text-sm text-muted-foreground">
              {schedule.job_plan.title} ({schedule.job_plan.job_plan_number})
            </p>
          </div>
        )}

        {/* Frequency */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{getFrequencyDisplay()}</span>
        </div>

        {/* Next Due Date */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Next Due</p>
              <p className={`text-sm font-semibold ${dueDateStatus.color}`}>
                {schedule.next_due_date 
                  ? format(parseISO(schedule.next_due_date), 'MMM dd, yyyy')
                  : 'Not scheduled'}
              </p>
            </div>
            <Badge variant="outline" className={`${dueDateStatus.bgColor}/10`}>
              {dueDateStatus.label}
            </Badge>
          </div>
        </div>

        {/* Assigned Person */}
        {schedule.assigned_person && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Assigned to:</span>
            <span className="font-medium">
              {schedule.assigned_person.first_name} {schedule.assigned_person.last_name}
            </span>
          </div>
        )}

        {/* Priority Badge */}
        <div className="flex items-center gap-2">
          <Badge 
            variant={
              schedule.priority === 'high' ? 'destructive' : 
              schedule.priority === 'medium' ? 'default' : 
              'secondary'
            }
          >
            {schedule.priority} priority
          </Badge>
          {schedule.auto_generate_wo && (
            <Badge variant="outline">Auto-generate WO</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PMScheduleCard;
