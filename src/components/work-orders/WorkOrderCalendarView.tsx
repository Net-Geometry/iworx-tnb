import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, isSameDay, isPast, startOfMonth, endOfMonth } from "date-fns";
import { DayContentProps } from "react-day-picker";
import { useAssets } from "@/hooks/useAssets";
import { usePeople } from "@/hooks/usePeople";
import { WorkOrder } from "@/hooks/useWorkOrders";

interface WorkOrderCalendarViewProps {
  workOrders: WorkOrder[];
  onWorkOrderSelect?: (workOrder: WorkOrder) => void;
  onEditWorkOrder?: (workOrder: WorkOrder) => void;
}

export function WorkOrderCalendarView({ 
  workOrders, 
  onWorkOrderSelect,
  onEditWorkOrder 
}: WorkOrderCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const { assets } = useAssets();
  const { people } = usePeople();

  // Get work orders for a specific date
  const getWorkOrdersForDate = (date: Date): WorkOrder[] => {
    return workOrders.filter(wo => {
      if (!wo.scheduled_date) return false;
      return isSameDay(new Date(wo.scheduled_date), date);
    });
  };

  // Determine status color
  const getStatusColor = (workOrder: WorkOrder): string => {
    const isOverdue = workOrder.scheduled_date && 
                     isPast(new Date(workOrder.scheduled_date)) && 
                     workOrder.status !== 'completed' && 
                     workOrder.status !== 'cancelled';
    
    if (isOverdue) return "bg-destructive";
    
    switch (workOrder.status) {
      case 'scheduled': return "bg-blue-500";
      case 'in_progress': return "bg-orange-500";
      case 'completed': return "bg-success";
      case 'cancelled': return "bg-muted";
      default: return "bg-muted";
    }
  };

  // Get priority badge variant
  const getPriorityVariant = (priority: string): "default" | "destructive" | "secondary" => {
    switch (priority) {
      case 'critical': return "destructive";
      case 'high': return "destructive";
      case 'medium': return "default";
      default: return "secondary";
    }
  };

  // Custom day content renderer
  const renderDayContent = (props: DayContentProps) => {
    const { date } = props;
    const dayWorkOrders = getWorkOrdersForDate(date);

    if (dayWorkOrders.length === 0) {
      return <span>{date.getDate()}</span>;
    }

    if (dayWorkOrders.length === 1) {
      const workOrder = dayWorkOrders[0];
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <span className="mb-1">{date.getDate()}</span>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(workOrder)}`} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="text-sm">
                <p className="font-semibold">{workOrder.title}</p>
                <p className="text-xs text-muted-foreground">{workOrder.id.slice(0, 8)}</p>
                <p className="text-xs mt-1">Status: {workOrder.status}</p>
                <p className="text-xs">Priority: {workOrder.priority}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Multiple work orders
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <span className="mb-1">{date.getDate()}</span>
              <Badge variant="secondary" className="text-xs px-1 h-4">
                {dayWorkOrders.length}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="text-sm">
              <p className="font-semibold mb-2">{dayWorkOrders.length} Work Orders</p>
              {dayWorkOrders.slice(0, 3).map(wo => (
                <div key={wo.id} className="mb-1">
                  <p className="text-xs">{wo.title}</p>
                </div>
              ))}
              {dayWorkOrders.length > 3 && (
                <p className="text-xs text-muted-foreground">+{dayWorkOrders.length - 3} more</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Navigate months
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Get work orders for selected date
  const selectedDateWorkOrders = selectedDate ? getWorkOrdersForDate(selectedDate) : [];

  // Get asset and technician names
  const getAssetName = (assetId?: string) => {
    if (!assetId) return "N/A";
    const asset = assets.find(a => a.id === assetId);
    return asset?.name || "Unknown Asset";
  };

  const getTechnicianName = (technicianId?: string, workOrder?: WorkOrder) => {
    // If workOrder has joined technician data, use that
    if (workOrder?.technician) {
      return `${workOrder.technician.first_name} ${workOrder.technician.last_name}`;
    }
    
    if (!technicianId) return "Unassigned";
    const person = people.find(p => p.id === technicianId);
    return person ? `${person.first_name} ${person.last_name}` : "Unknown";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Work Orders Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[140px] text-center">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-lg border-2 w-full shadow-sm"
              renderDayContent={renderDayContent}
            />
            
            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-semibold mb-2">Status Legend:</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-xs">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-xs">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-xs">Overdue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                  <span className="text-xs">Cancelled</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Details Section */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateWorkOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No work orders scheduled for this date.</p>
            ) : (
              <div className="space-y-3">
                {selectedDateWorkOrders.map(workOrder => (
                  <Card key={workOrder.id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{workOrder.title}</p>
                          <p className="text-xs text-muted-foreground">{workOrder.id.slice(0, 8)}</p>
                        </div>
                        <Badge 
                          variant={getPriorityVariant(workOrder.priority)}
                          className="text-xs shrink-0"
                        >
                          {workOrder.priority}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium capitalize">{workOrder.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Asset:</span>
                          <span className="font-medium truncate max-w-[150px]">
                            {getAssetName(workOrder.asset_id)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Assigned:</span>
                          <span className="font-medium truncate max-w-[150px]">
                            {getTechnicianName(workOrder.assigned_technician, workOrder)}
                          </span>
                        </div>
                        {workOrder.estimated_duration_hours && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{workOrder.estimated_duration_hours}h</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        {onWorkOrderSelect && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => onWorkOrderSelect(workOrder)}
                          >
                            View
                          </Button>
                        )}
                        {onEditWorkOrder && (
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="flex-1"
                            onClick={() => onEditWorkOrder(workOrder)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
