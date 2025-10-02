import { CheckCircle, XCircle, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { WorkflowState } from "@/hooks/useWorkflowState";

// Generic step interface that works with both WorkflowStep and WorkflowTemplateStep
interface GenericWorkflowStep {
  id: string;
  name: string;
  description?: string | null;
  step_order: number;
  approval_type?: string;
  can_approve?: boolean;
  can_assign?: boolean;
  is_required?: boolean;
}

interface RoleBasedActionButtonsProps {
  currentStep: GenericWorkflowStep | null;
  workflowState: WorkflowState | null;
  steps: GenericWorkflowStep[];
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

  // For template-based workflows, check approval_type; for legacy workflows, use can_approve
  const requiresApproval = currentStep.approval_type === "required" || currentStep.can_approve;
  const canApprove = requiresApproval && hasPermission("workflow", "approve");
  const canAssign = (currentStep.can_assign !== false) && hasPermission("workflow", "assign");
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
