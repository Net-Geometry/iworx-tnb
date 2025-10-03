import { useState, useMemo } from "react";
import { CheckCircle, XCircle, UserPlus, MessageSquare, Wrench, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { supabase } from "@/integrations/supabase/client";
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
  const navigate = useNavigate();
  const { workflowState, transitionStep, approvals } = useIncidentWorkflow(incidentId);
  const { data: steps } = useWorkflowTemplateSteps(workflowState?.template_id);
  const { roles } = useCurrentUserRoles();
  const { people } = usePeople();
  const { currentOrganization, user } = useAuth();

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [woDialogOpen, setWoDialogOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [woTitle, setWoTitle] = useState("");
  const [woDescription, setWoDescription] = useState("");
  const [incident, setIncident] = useState<any>(null);
  
  const { createWorkOrder } = useWorkOrders();

  // Fetch incident data for work order creation
  useMemo(() => {
    const fetchIncident = async () => {
      const { data } = await supabase
        .from("safety_incidents")
        .select("*")
        .eq("id", incidentId)
        .single();
      if (data) setIncident(data);
    };
    fetchIncident();
  }, [incidentId]);

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
    if (!isFinalStep || !woTitle || !woDescription) {
      toast.error("Title and description are required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (!incident?.asset_id) {
        toast.error("Cannot create work order: Incident has no associated asset");
        return;
      }

      const priorityMap: Record<string, "critical" | "high" | "medium" | "low"> = {
        critical: "high",
        high: "high",
        medium: "medium",
        low: "low",
      };

      // Create the work order directly via supabase
      const workOrderData = {
        asset_id: incident.asset_id,
        title: woTitle,
        description: woDescription,
        status: "open" as const,
        // Use incident's work order planning fields
        priority: (incident?.wo_priority || priorityMap[incident.severity] || "medium") as "critical" | "high" | "medium" | "low",
        maintenance_type: (incident?.wo_maintenance_type || "corrective") as "preventive" | "corrective" | "predictive" | "emergency",
        estimated_duration_hours: incident?.wo_estimated_duration_hours || null,
        estimated_cost: incident?.wo_estimated_cost || null,
        assigned_technician: incident?.wo_assigned_technician || null,
        notes: incident?.wo_notes || incident?.immediate_actions || "",
        scheduled_date: incident?.wo_target_start_date || new Date().toISOString(),
        target_finish_date: incident?.wo_target_finish_date || null,
        organization_id: currentOrganization?.id || "",
        incident_report_id: incidentId,
      };

      const { data: workOrder, error: woError } = await supabase
        .from("work_orders")
        // @ts-expect-error - Types will regenerate after work order updates
        .insert([workOrderData])
        .select()
        .single();

      if (woError) throw woError;

      // Record the approval/completion
      const { error: approvalError } = await supabase
        .from("incident_approvals")
        .insert([{
          incident_id: incidentId,
          step_id: currentStep.id,
          approved_by_user_id: user?.id,
          approval_action: "approved",
          comments: `Workflow completed. Work Order created: ${woTitle}`,
          organization_id: currentOrganization?.id,
        }]);

      if (approvalError) throw approvalError;

      // Update incident status to resolved
      const { error: incidentError } = await supabase
        .from("safety_incidents")
        .update({ 
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", incidentId);

      if (incidentError) throw incidentError;

      // Mark workflow as completed (delete workflow state)
      const { error: workflowError } = await supabase
        .from("incident_workflow_state")
        .delete()
        .eq("incident_id", incidentId);

      if (workflowError) throw workflowError;

      toast.success(`Incident workflow completed! Work Order created successfully.`);
      setWoDialogOpen(false);
      
      // Redirect to work order
      setTimeout(() => {
        navigate(`/work-orders/${workOrder.id}`);
      }, 1500);

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
                Completing this step will resolve the incident and create a work order.
              </p>
            </div>
          )}

          {/* Approve/Complete Button - different for final step */}
          {isFinalStep ? (
            <Button
              onClick={() => setWoDialogOpen(true)}
              className="w-full"
              disabled={isSubmitting}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete & Create Work Order
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
              This will move the incident back to:{" "}
              <span className="font-semibold text-foreground">
                {rejectionTargetStep?.name || "Previous Step"}
              </span>
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

      {/* Work Order Creation Dialog */}
      <Dialog open={woDialogOpen} onOpenChange={setWoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isFinalStep ? "Complete Workflow & Create Work Order" : "Create Work Order"}</DialogTitle>
            <DialogDescription>
              {isFinalStep 
                ? "This will complete the incident workflow, mark it as resolved, and create a work order."
                : "Create a work order linked to this incident"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="wo-title">Work Order Title *</Label>
              <Input
                id="wo-title"
                value={woTitle}
                onChange={(e) => setWoTitle(e.target.value)}
                placeholder="Enter work order title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wo-description">Description *</Label>
              <Textarea
                id="wo-description"
                value={woDescription}
                onChange={(e) => setWoDescription(e.target.value)}
                placeholder="Describe the corrective actions needed..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWoDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={isFinalStep ? handleCompleteWorkflow : async () => {
                if (!woTitle || !woDescription) {
                  toast.error("Title and description are required");
                  return;
                }
                
                setIsSubmitting(true);
                try {
                  const priorityMap: Record<string, "critical" | "high" | "medium" | "low"> = {
                    critical: "high",
                    high: "high",
                    medium: "medium",
                    low: "low",
                  };

                  const workOrderData = {
                    asset_id: incident.asset_id,
                    title: woTitle,
                    description: woDescription,
                    status: "scheduled" as const,
                    priority: (priorityMap[incident.severity] || "medium") as "critical" | "high" | "medium" | "low",
                    maintenance_type: "corrective" as const,
                    scheduled_date: new Date().toISOString(),
                    organization_id: currentOrganization?.id || "",
                    incident_report_id: incidentId,
                  };

                  await createWorkOrder(workOrderData);
                  
                  // Record work order creation in incident approvals
                  await supabase.from("incident_approvals").insert({
                    incident_id: incidentId,
                    step_id: currentStep.id,
                    approved_by_user_id: workflowState.assigned_to_user_id,
                    approval_action: "work_order_created",
                    comments: `Work order created: ${woTitle}`,
                    organization_id: currentOrganization?.id,
                  });

                  toast.success("Work order created and linked to incident");
                  setWoDialogOpen(false);
                  setWoTitle("");
                  setWoDescription("");
                } catch (error: any) {
                  console.error("Error creating work order:", error);
                  toast.error(error.message || "Failed to create work order");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting || !woTitle || !woDescription}
            >
              {isSubmitting ? (isFinalStep ? "Completing..." : "Creating...") : (isFinalStep ? "Complete Workflow" : "Create Work Order")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
