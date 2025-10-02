import { CheckCircle, XCircle, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { WorkflowStep } from "@/hooks/useWorkflowSteps";
import { WorkflowState } from "@/hooks/useWorkflowState";

interface RoleBasedActionButtonsProps {
  currentStep: WorkflowStep | null;
  workflowState: WorkflowState | null;
  steps: WorkflowStep[];
  onApprove: () => void;
  onReject: () => void;
  onAssign: () => void;
  onTransition: () => void;
}

/**
 * Dynamic action buttons based on user role and current workflow step
 * Shows only actions the user is authorized to perform
 */
export const RoleBasedActionButtons = ({
  currentStep,
  workflowState,
  steps,
  onApprove,
  onReject,
  onAssign,
  onTransition,
}: RoleBasedActionButtonsProps) => {
  const { hasPermission } = usePermissions();

  if (!currentStep) return null;

  const canApprove = currentStep.can_approve && hasPermission("workflow", "approve");
  const canAssign = currentStep.can_assign && hasPermission("workflow", "assign");
  const canTransition = hasPermission("workflow", "transition");

  const nextStep = steps.find((s) => s.step_order === currentStep.step_order + 1);

  return (
    <div className="flex gap-3">
      {canApprove && (
        <>
          <Button onClick={onApprove} variant="default" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Approve
          </Button>
          <Button onClick={onReject} variant="destructive" className="gap-2">
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
        </>
      )}

      {canAssign && (
        <Button onClick={onAssign} variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Assign
        </Button>
      )}

      {canTransition && nextStep && (
        <Button onClick={onTransition} variant="outline" className="gap-2">
          <ArrowRight className="w-4 h-4" />
          Move to {nextStep.name}
        </Button>
      )}
    </div>
  );
};
