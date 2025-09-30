import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isSameDay, isPast, isThisWeek, isThisMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PMSchedule } from "@/hooks/usePMSchedules";
import { useGenerateWorkOrder } from "@/hooks/usePMSchedules";

interface PMCalendarViewProps {
  schedules: PMSchedule[];
  onScheduleClick?: (schedule: PMSchedule) => void;
  onEdit?: (id: string) => void;
}

/**
 * Calendar view component for PM schedules
 * Displays schedules on their due dates with color-coded status indicators
 */
export function PMCalendarView({ schedules, onScheduleClick, onEdit }: PMCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const generateWorkOrder = useGenerateWorkOrder();

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((schedule) => {
      if (!schedule.next_due_date) return false;
      return isSameDay(new Date(schedule.next_due_date), date);
    });
  };

  // Get status color for a schedule based on due date
  const getStatusColor = (schedule: PMSchedule) => {
    if (!schedule.next_due_date) return "bg-muted";
    
    const dueDate = new Date(schedule.next_due_date);
    
    if (schedule.status === "paused" || !schedule.is_active) {
      return "bg-muted";
    }
    
    if (isPast(dueDate) && !isSameDay(dueDate, new Date())) {
      return "bg-destructive"; // Overdue - red
    }
    
    if (isThisWeek(dueDate)) {
      return "bg-orange-500"; // Due this week - orange
    }
    
    if (isThisMonth(dueDate)) {
      return "bg-yellow-500"; // Due this month - yellow
    }
    
    return "bg-success"; // Upcoming - green
  };

  // Get status label
  const getStatusLabel = (schedule: PMSchedule) => {
    if (!schedule.next_due_date) return "No due date";
    
    const dueDate = new Date(schedule.next_due_date);
    
    if (schedule.status === "paused" || !schedule.is_active) {
      return "Paused";
    }
    
    if (isPast(dueDate) && !isSameDay(dueDate, new Date())) {
      return "Overdue";
    }
    
    if (isSameDay(dueDate, new Date())) {
      return "Due Today";
    }
    
    if (isThisWeek(dueDate)) {
      return "Due This Week";
    }
    
    if (isThisMonth(dueDate)) {
      return "Due This Month";
    }
    
    return "Upcoming";
  };

  // Custom day content renderer to show schedule indicators
  const renderDay = (date: Date) => {
    const daySchedules = getSchedulesForDate(date);
    
    if (daySchedules.length === 0) return null;

    return (
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
        {daySchedules.slice(0, 3).map((schedule, idx) => (
          <div
            key={idx}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              getStatusColor(schedule)
            )}
          />
        ))}
        {daySchedules.length > 3 && (
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
        )}
      </div>
    );
  };

  const selectedDateSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium">Status:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Due This Week</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Due This Month</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span>Paused</span>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1fr,400px] gap-6">
        {/* Calendar */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setCurrentMonth(newMonth);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setCurrentMonth(newMonth);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border w-full"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="grid grid-cols-7 w-full h-full pt-12">
                {Array.from({ length: 42 }).map((_, i) => {
                  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                  const startDay = startOfMonth.getDay();
                  const dayNum = i - startDay + 1;
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
                  
                  if (dayNum < 1 || dayNum > new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()) {
                    return <div key={i} />;
                  }
                  
                  const daySchedules = getSchedulesForDate(date);
                  if (daySchedules.length === 0) return <div key={i} />;
                  
                  return (
                    <div key={i} className="flex items-end justify-center pb-2">
                      <div className="flex gap-0.5">
                        {daySchedules.slice(0, 3).map((schedule, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              getStatusColor(schedule)
                            )}
                          />
                        ))}
                        {daySchedules.length > 3 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Schedule Details Panel */}
        <Card className="p-6 h-fit">
          {selectedDate ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">
                  {format(selectedDate, "MMMM d, yyyy")}
                </h3>
              </div>

              {selectedDateSchedules.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No schedules for this date
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateSchedules.map((schedule) => (
                    <Card
                      key={schedule.id}
                      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => onScheduleClick?.(schedule)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {schedule.title}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {schedule.asset?.name || "No asset assigned"}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("text-xs whitespace-nowrap", getStatusColor(schedule), "text-white border-0")}
                          >
                            {getStatusLabel(schedule)}
                          </Badge>
                        </div>

                        {schedule.job_plan && (
                          <p className="text-xs text-muted-foreground">
                            {schedule.job_plan.title}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(schedule.id);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              onScheduleClick?.(schedule);
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateWorkOrder.mutate(schedule.id);
                            }}
                            disabled={generateWorkOrder.isPending}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Generate WO
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Select a date to view schedules</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
