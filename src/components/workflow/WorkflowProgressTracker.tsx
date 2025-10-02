import { Check, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkflowStep } from "@/hooks/useWorkflowSteps";
import { WorkflowState } from "@/hooks/useWorkflowState";

interface WorkflowProgressTrackerProps {
  steps: WorkflowStep[];
  currentState: WorkflowState | null;
  className?: string;
}

/**
 * Visual stepper component showing workflow progress
 * Displays all steps with their status (completed, current, pending)
 */
export const WorkflowProgressTracker = ({
  steps,
  currentState,
  className,
}: WorkflowProgressTrackerProps) => {
  const currentStepOrder = steps.find(
    (s) => s.id === currentState?.current_step_id
  )?.step_order || 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.step_order < currentStepOrder;
          const isCurrent = step.id === currentState?.current_step_id;
          const isPending = step.step_order > currentStepOrder;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    isCompleted &&
                      "bg-accent-success border-accent-success text-background",
                    isCurrent &&
                      "bg-primary border-primary text-primary-foreground",
                    isPending &&
                      "bg-background border-muted-foreground text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-primary",
                      isCompleted && "text-accent-success",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.required_role}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors",
                    isCompleted ? "bg-accent-success" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
