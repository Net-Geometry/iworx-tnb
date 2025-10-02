import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { WorkflowStep } from "@/hooks/useWorkflowSteps";

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStep: WorkflowStep | null;
  nextStep: WorkflowStep | null;
  actionType: "approve" | "reject" | "reassign" | "escalate";
  onConfirm: (comments: string) => void;
}

/**
 * Role-specific approval dialog with comments and action confirmation
 */
export const ApprovalDialog = ({
  open,
  onOpenChange,
  currentStep,
  nextStep,
  actionType,
  onConfirm,
}: ApprovalDialogProps) => {
  const [comments, setComments] = useState("");

  const handleConfirm = () => {
    onConfirm(comments);
    setComments("");
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (actionType) {
      case "approve":
        return "Approve and Continue";
      case "reject":
        return "Reject and Send Back";
      case "reassign":
        return "Reassign Task";
      case "escalate":
        return "Escalate Issue";
      default:
        return "Confirm Action";
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case "approve":
        return `Approve this step and move to: ${nextStep?.name || "next step"}`;
      case "reject":
        return "Reject this step and send back for corrections";
      case "reassign":
        return "Reassign this task to another user";
      case "escalate":
        return "Escalate this issue to management";
      default:
        return "Please provide comments for this action";
    }
  };

  const getButtonText = () => {
    switch (actionType) {
      case "approve":
        return "Approve";
      case "reject":
        return "Reject";
      case "reassign":
        return "Reassign";
      case "escalate":
        return "Escalate";
      default:
        return "Confirm";
    }
  };

  const getButtonVariant = () => {
    return actionType === "reject" ? "destructive" : "default";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comments">
              Comments {actionType === "reject" ? "(Required)" : "(Optional)"}
            </Label>
            <Textarea
              id="comments"
              placeholder="Provide your comments here..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>

          {currentStep && (
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Current Step:</strong> {currentStep.name}
              </p>
              {nextStep && (
                <p>
                  <strong>Next Step:</strong> {nextStep.name}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={actionType === "reject" && !comments.trim()}
          >
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
