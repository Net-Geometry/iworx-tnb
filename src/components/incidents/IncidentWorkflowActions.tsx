import { useState } from "react";
import { CheckCircle, XCircle, UserPlus, MessageSquare } from "lucide-react";
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
import { useIncidentWorkflow } from "@/hooks/useWorkflowState";
import { useWorkflowTemplateSteps, useStepRoleAssignments } from "@/hooks/useWorkflowTemplateSteps";
import { useCurrentUserRoles } from "@/hooks/useCurrentUserRoles";
import { usePeople } from "@/hooks/usePeople";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface IncidentWorkflowActionsProps {
  incidentId: string;
}

/**
 * IncidentWorkflowActions Component
 * 
 * Role-based action buttons for incident workflow transitions.
 * Shows conditional actions based on user roles and workflow step permissions.
 */
export const IncidentWorkflowActions = ({ incidentId }: IncidentWorkflowActionsProps) => {
  const { workflowState, transitionStep, approvals } = useIncidentWorkflow(incidentId);
  const { data: steps } = useWorkflowTemplateSteps(workflowState?.template_id);
  const { roles } = useCurrentUserRoles();
  const { people } = usePeople();
  const { currentOrganization } = useAuth();

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!workflowState || !steps || steps.length === 0) {
    return null;
  }

  const currentStep = steps.find((s) => s.id === workflowState.current_step_id);
  if (!currentStep) return null;

  // Get role assignments for current step
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep.id);
  const nextStep = steps[currentStepIndex + 1];

  // Fetch role assignments for this step from database
  const { data: stepRoleAssignments } = useStepRoleAssignments(currentStep.id);

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
    setIsSubmitting(true);
    try {
      // Stay on current step but log rejection
      await transitionStep.mutateAsync({
        stepId: currentStep.id,
        comments,
        approvalAction: "rejected",
      });

      toast.success("Step rejected successfully");
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
          {nextStep && (
            <Button
              onClick={() => setApproveDialogOpen(true)}
              className="w-full"
              variant="default"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve & Move to {nextStep.name}
            </Button>
          )}

          <Button
            onClick={() => setRejectDialogOpen(true)}
            className="w-full"
            variant="destructive"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject & Request Changes
          </Button>

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
              This will move the incident to: {nextStep?.name}
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
              This will request additional information or changes.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="reject-comments">Rejection Reason (Required)</Label>
            <Textarea
              id="reject-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Explain why this is being rejected..."
              rows={4}
              required
            />
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
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || !comments.trim()}
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
              Assign this step to a different user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reassign-user">Assign To</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
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
                placeholder="Add any notes..."
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
            <Button onClick={handleReassign} disabled={isSubmitting || !selectedUserId}>
              {isSubmitting ? "Reassigning..." : "Reassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
