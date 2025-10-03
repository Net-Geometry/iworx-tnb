import { CheckCircle2, Clock, Circle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIncidentWorkflow } from "@/hooks/useWorkflowState";
import { useWorkflowTemplateSteps } from "@/hooks/useWorkflowTemplateSteps";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface IncidentWorkflowProgressProps {
  incidentId: string;
}

/**
 * IncidentWorkflowProgress Component
 * 
 * Visual stepper showing incident workflow status with SLA tracking.
 * Displays completed, current, and pending workflow steps with role information.
 */
export const IncidentWorkflowProgress = ({ incidentId }: IncidentWorkflowProgressProps) => {
  const { workflowState, isLoading: stateLoading } = useIncidentWorkflow(incidentId);
  const { data: steps, isLoading: stepsLoading } = useWorkflowTemplateSteps(workflowState?.template_id);

  if (stateLoading || stepsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!workflowState || !steps || steps.length === 0) {
    return null;
  }

  const currentStepIndex = steps.findIndex((step) => step.id === workflowState.current_step_id);
  const slaStatus = calculateSLAStatus(workflowState.sla_due_at);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Workflow Progress</CardTitle>
          {workflowState.sla_due_at && (
            <Badge
              variant={
                slaStatus === "overdue"
                  ? "destructive"
                  : slaStatus === "at-risk"
                  ? "outline"
                  : "secondary"
              }
              className={cn(
                slaStatus === "at-risk" && "border-yellow-500 text-yellow-700"
              )}
            >
              {slaStatus === "overdue" && <AlertCircle className="w-3 h-3 mr-1" />}
              {getSLALabel(workflowState.sla_due_at, slaStatus)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center space-y-2 min-w-0"
                  style={{ flex: 1 }}
                >
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-blue-500 text-white animate-pulse",
                      isPending && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                    {isCurrent && <Clock className="w-5 h-5" />}
                    {isPending && <Circle className="w-5 h-5" />}
                  </div>

                  {/* Step Info */}
                  <div className="text-center min-w-0 max-w-[120px]">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        isCurrent && "text-foreground font-semibold",
                        !isCurrent && "text-muted-foreground"
                      )}
                      title={step.name}
                    >
                      {step.name}
                    </p>
                    {step.sla_hours && isCurrent && (
                      <p className="text-xs text-muted-foreground">
                        SLA: {step.sla_hours}h
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Step Details */}
          {currentStepIndex >= 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Current Step: {steps[currentStepIndex]?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {steps[currentStepIndex]?.description}
                  </p>
                </div>
                {workflowState.assigned_to_user_id && (
                  <Badge variant="outline">Assigned</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Calculate SLA status based on due date
 */
function calculateSLAStatus(slaDueAt: string | null): "on-time" | "at-risk" | "overdue" {
  if (!slaDueAt) return "on-time";

  const now = new Date();
  const dueDate = new Date(slaDueAt);
  const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursRemaining < 0) return "overdue";
  if (hoursRemaining < 6) return "at-risk"; // Less than 6 hours remaining
  return "on-time";
}

/**
 * Get human-readable SLA label
 */
function getSLALabel(slaDueAt: string | null, status: string): string {
  if (!slaDueAt) return "No SLA";

  const now = new Date();
  const dueDate = new Date(slaDueAt);
  const hoursRemaining = Math.abs((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));

  if (status === "overdue") {
    return `Overdue by ${Math.floor(hoursRemaining)}h`;
  }

  if (hoursRemaining < 1) {
    const minutesRemaining = Math.floor(hoursRemaining * 60);
    return `${minutesRemaining}m remaining`;
  }

  return `${Math.floor(hoursRemaining)}h remaining`;
}
