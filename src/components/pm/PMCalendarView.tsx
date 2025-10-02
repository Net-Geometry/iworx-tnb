import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, isSameDay, isPast, isThisWeek, isThisMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText, Clock, Wrench, AlertCircle } from "lucide-react";
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
    <TooltipProvider>
      <div className="space-y-6">
        {/* Enhanced Legend with gradient background */}
        <Card className="p-6 bg-gradient-to-r from-card to-card/50 border-2">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 font-semibold text-base">
              <AlertCircle className="h-5 w-5 text-primary" />
              <span>Schedule Status</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="font-medium">Overdue</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="font-medium">Due This Week</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="font-medium">Due This Month</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="font-medium">Upcoming</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-muted">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="font-medium">Paused</span>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-[1fr,420px] gap-6">
          {/* Enhanced Calendar */}
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-primary/10 hover:border-primary transition-all"
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
                  className="hover:bg-primary hover:text-primary-foreground transition-all"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-primary/10 hover:border-primary transition-all"
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
                className="rounded-lg border-2 w-full shadow-sm"
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="grid grid-cols-7 w-full h-full pt-16">
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
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <div className="flex items-end justify-center pb-2 pointer-events-auto cursor-help">
                            {daySchedules.length === 1 ? (
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full shadow-md animate-pulse",
                                  getStatusColor(daySchedules[0])
                                )}
                              />
                            ) : (
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "h-5 px-2 text-xs font-bold shadow-md",
                                  "bg-primary text-primary-foreground border-0"
                                )}
                              >
                                {daySchedules.length}
                              </Badge>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold text-xs mb-2">
                              {daySchedules.length} schedule{daySchedules.length > 1 ? 's' : ''}
                            </p>
                            {daySchedules.slice(0, 3).map((schedule, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <div className={cn("w-2 h-2 rounded-full", getStatusColor(schedule))} />
                                <span className="truncate">{schedule.title}</span>
                              </div>
                            ))}
                            {daySchedules.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{daySchedules.length - 3} more
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Schedule Details Panel */}
          <Card className="p-6 h-fit shadow-lg">
            {selectedDate ? (
              <>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {format(selectedDate, "MMMM d, yyyy")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedDateSchedules.length} schedule{selectedDateSchedules.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {selectedDateSchedules.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
                      <Wrench className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      No schedules for this date
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {selectedDateSchedules.map((schedule) => (
                      <Card
                        key={schedule.id}
                        className="p-4 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 border-2"
                        onClick={() => onScheduleClick?.(schedule)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate mb-1">
                                {schedule.title}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Wrench className="h-3 w-3" />
                                <span className="truncate">
                                  {schedule.asset?.name || "No asset assigned"}
                                </span>
                              </div>
                            </div>
                            <Badge
                              className={cn(
                                "text-xs whitespace-nowrap font-semibold shadow-sm",
                                getStatusColor(schedule), 
                                "text-white border-0"
                              )}
                            >
                              {getStatusLabel(schedule)}
                            </Badge>
                          </div>

                          {schedule.job_plan && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                              <FileText className="h-3 w-3" />
                              <span className="truncate">{schedule.job_plan.title}</span>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 flex-1 hover:bg-accent transition-all"
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
                              className="text-xs h-8 flex-1 hover:bg-accent transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                onScheduleClick?.(schedule);
                              }}
                            >
                              Details
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="text-xs h-8 w-full hover:scale-105 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                generateWorkOrder.mutate(schedule.id);
                              }}
                              disabled={generateWorkOrder.isPending}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Generate Work Order
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="p-6 bg-muted/20 rounded-full w-fit mx-auto mb-4">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Select a date to view schedules
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Click on any day with schedules
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
