import { useState, useMemo } from "react";
import { CheckCircle, XCircle, UserPlus, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkOrderWorkflow } from "@/hooks/useWorkflowState";
import { useWorkflowTemplateSteps, useStepRoleAssignments } from "@/hooks/useWorkflowTemplateSteps";
import { useCurrentUserRoles } from "@/hooks/useCurrentUserRoles";
import { usePeople } from "@/hooks/usePeople";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkOrderWorkflowActionsProps {
  workOrderId: string;
}

/**
 * WorkOrderWorkflowActions Component
 * 
 * Role-based action buttons for work order workflow transitions.
 * Shows conditional actions based on user roles and workflow step permissions.
 */
export const WorkOrderWorkflowActions = ({ workOrderId }: WorkOrderWorkflowActionsProps) => {
  const { workflowState, transitionStep } = useWorkOrderWorkflow(workOrderId);
  const { data: steps } = useWorkflowTemplateSteps(workflowState?.template_id);
  const { roles } = useCurrentUserRoles();
  const { people } = usePeople();
  const { currentOrganization, user } = useAuth();

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current step before early returns affect hook order
  const currentStep = steps?.find((s) => s.id === workflowState?.current_step_id);
  
  // Fetch role assignments for this step from database (must call hook before any returns)
  const { data: stepRoleAssignments } = useStepRoleAssignments(currentStep?.id);

  // Calculate step indices and rejection target BEFORE any early returns (hooks must always be called)
  const currentStepIndex = steps?.findIndex((s) => s.id === currentStep?.id) ?? -1;
  const nextStep = steps && currentStepIndex >= 0 ? steps[currentStepIndex + 1] : undefined;

  // Calculate rejection target based on configuration
  const rejectionTargetStep = useMemo(() => {
    if (!currentStep || !steps || currentStepIndex < 0) return null;
    
    // If custom rejection target is configured, use it
    if (currentStep.reject_target_step_id) {
      return steps.find(s => s.id === currentStep.reject_target_step_id) || null;
    }
    
    // Default: go to previous step
    return currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  }, [currentStep, steps, currentStepIndex]);

  // Detect if this is the final step in the workflow
  const isFinalStep = useMemo(() => {
    if (!steps || !currentStep) return false;
    const maxStepOrder = Math.max(...steps.map(s => s.step_order));
    return currentStep.step_order === maxStepOrder;
  }, [steps, currentStep]);

  // Early returns AFTER all hooks have been called
  if (!workflowState || !steps || steps.length === 0) {
    return null;
  }

  if (!currentStep) return null;

  // Check if this step requires approval or auto-transitions
  const isAutoTransitionStep = currentStep.approval_type === 'none';

  // Check if user has required role for this step (database-driven)
  const userRoleNames = roles?.map((r) => r.role_name) || [];
  const canApprove = isAutoTransitionStep || (stepRoleAssignments || []).some((assignment) =>
    userRoleNames.some(userRole => 
      userRole.toLowerCase() === assignment.role_name.toLowerCase()
    ) && assignment.can_approve === true
  );

  // Get list of required roles for error message
  const requiredRoles = (stepRoleAssignments || [])
    .filter(a => a.can_approve)
    .map(a => a.role_name)
    .join(", ");

  const handleApprove = async () => {
    if (!nextStep) {
      toast.error("No next step available");
      return;
    }

    setIsSubmitting(true);
    try {
      await transitionStep.mutateAsync({
        stepId: nextStep.id,
        assignedToUserId: selectedUserId || undefined,
        comments,
        approvalAction: "approved",
      });

      toast.success("Step approved successfully");
      setApproveDialogOpen(false);
      setComments("");
      setSelectedUserId("");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve step");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionTargetStep) {
      toast.error("Cannot reject: No valid previous step configured");
      return;
    }

    setIsSubmitting(true);
    try {
      await transitionStep.mutateAsync({
        stepId: rejectionTargetStep.id,
        comments,
        approvalAction: "rejected",
      });

      toast.success(`Rejected. Moved to: ${rejectionTargetStep.name}`);
      setRejectDialogOpen(false);
      setComments("");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject step");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user to assign");
      return;
    }

    setIsSubmitting(true);
    try {
      await transitionStep.mutateAsync({
        stepId: currentStep.id,
        assignedToUserId: selectedUserId,
        comments,
        approvalAction: "reassigned",
      });

      toast.success("Reassigned successfully");
      setReassignDialogOpen(false);
      setComments("");
      setSelectedUserId("");
    } catch (error: any) {
      toast.error(error.message || "Failed to reassign");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle completion of final workflow step
  const handleCompleteWorkflow = async () => {
    if (!isFinalStep) {
      toast.error("This is not the final step");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Record the final approval
      const { error: approvalError } = await supabase
        .from("work_order_approvals")
        .insert([{
          work_order_id: workOrderId,
          step_id: currentStep.id,
          approved_by_user_id: user?.id,
          approval_action: "approved",
          comments: comments || "Workflow completed successfully",
          organization_id: currentOrganization?.id,
        }]);

      if (approvalError) throw approvalError;

      // Update work order status to completed
      const { error: workOrderError } = await supabase
        .from("work_orders")
        .update({ 
          status: "completed",
          actual_finish_date: new Date().toISOString(),
        })
        .eq("id", workOrderId);

      if (workOrderError) throw workOrderError;

      // Mark workflow as completed (delete workflow state)
      const { error: workflowError } = await supabase
        .from("work_order_workflow_state")
        .delete()
        .eq("work_order_id", workOrderId);

      if (workflowError) throw workflowError;

      toast.success("Work order workflow completed successfully!");
      setCompleteDialogOpen(false);
      setComments("");

    } catch (error: any) {
      console.error("Error completing workflow:", error);
      toast.error(error.message || "Failed to complete workflow");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle auto-transition steps (no approval required)
  const handleAutoTransition = async () => {
    if (!nextStep) {
      toast.error("No next step available");
      return;
    }

    setIsSubmitting(true);
    try {
      await transitionStep.mutateAsync({
        stepId: nextStep.id,
        approvalAction: "approved",
        comments: "Auto-transitioned from " + currentStep.name,
      });

      toast.success(`Moved to ${nextStep.name}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to transition");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canApprove) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            You don't have permission to perform actions on this step.
          </p>
          <p className="text-sm font-medium">
            This step requires one of the following roles: 
            <span className="text-primary"> {requiredRoles || "Not configured"}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Your roles: {userRoleNames.join(", ") || "None"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // For auto-transition steps, show a simple "Continue" button
  if (isAutoTransitionStep && nextStep) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleAutoTransition} 
            className="w-full"
            disabled={isSubmitting}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? "Processing..." : `Continue to ${nextStep.name}`}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Workflow Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Final Step Indicator */}
          {isFinalStep && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Final Step</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Completing this step will mark the work order as completed.
              </p>
            </div>
          )}

          {/* Approve/Complete Button - different for final step */}
          {isFinalStep ? (
            <Button
              onClick={() => setCompleteDialogOpen(true)}
              className="w-full"
              disabled={isSubmitting}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Work Order
            </Button>
          ) : nextStep ? (
            <Button
              onClick={() => setApproveDialogOpen(true)}
              className="w-full"
              variant="default"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve & Move to {nextStep.name}
            </Button>
          ) : null}

          <Button
            onClick={() => setRejectDialogOpen(true)}
            className="w-full"
            variant="destructive"
            disabled={!rejectionTargetStep}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject & Request Changes
          </Button>

          {!rejectionTargetStep && (
            <p className="text-sm text-muted-foreground text-center">
              Rejection not available for this step
            </p>
          )}

          <Button
            onClick={() => setReassignDialogOpen(true)}
            className="w-full"
            variant="outline"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Reassign to User
          </Button>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve & Move Forward</DialogTitle>
            <DialogDescription>
              This will move the work order to: {nextStep?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assign-user">Assign To (Optional)</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user to assign" />
                </SelectTrigger>
                <SelectContent>
                  {people
                    ?.filter((p) => p.organization_id === currentOrganization?.id)
                    .map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.first_name} {person.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any notes or comments..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject & Request Changes</DialogTitle>
            <DialogDescription>
              This will move the work order back to: {rejectionTargetStep?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-comments">Reason for Rejection *</Label>
              <Textarea
                id="reject-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Please explain why this step is being rejected..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={isSubmitting || !comments.trim()}
              variant="destructive"
            >
              {isSubmitting ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign to User</DialogTitle>
            <DialogDescription>
              Transfer responsibility for this step to another user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reassign-user">Select User *</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to assign" />
                </SelectTrigger>
                <SelectContent>
                  {people
                    ?.filter((p) => p.organization_id === currentOrganization?.id)
                    .map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.first_name} {person.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reassign-comments">Comments (Optional)</Label>
              <Textarea
                id="reassign-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add notes about the reassignment..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReassignDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReassign} 
              disabled={isSubmitting || !selectedUserId}
            >
              {isSubmitting ? "Reassigning..." : "Reassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Workflow Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Work Order</DialogTitle>
            <DialogDescription>
              This will mark the work order as completed and close the workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="complete-comments">Completion Notes (Optional)</Label>
              <Textarea
                id="complete-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any final notes about the completion..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteWorkflow} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Completing..." : "Complete Work Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
