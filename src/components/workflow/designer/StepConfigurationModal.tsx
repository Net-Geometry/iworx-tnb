import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import type { WorkflowTemplateStep } from "@/hooks/useWorkflowTemplateSteps";
import { useRoles } from "@/hooks/useRoles";
import { useStepRoleAssignments, useUpsertStepRoleAssignment } from "@/hooks/useWorkflowTemplateSteps";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StepConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: WorkflowTemplateStep | null;
  onSave: (stepData: Partial<WorkflowTemplateStep>) => void;
}

export const StepConfigurationModal = ({
  open,
  onOpenChange,
  step,
  onSave,
}: StepConfigurationModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stepType, setStepType] = useState("standard");
  const [approvalType, setApprovalType] = useState("single");
  const [slaHours, setSlaHours] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);
  const [allowsWorkOrderCreation, setAllowsWorkOrderCreation] = useState(false);
  const [workOrderStatus, setWorkOrderStatus] = useState("");
  const [incidentStatus, setIncidentStatus] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Array<{ roleId: string; canApprove: boolean; canReject: boolean; canAssign: boolean }>>([]);

  const { roles } = useRoles();
  const { data: roleAssignments } = useStepRoleAssignments(step?.id);
  const { mutate: upsertRoleAssignment } = useUpsertStepRoleAssignment();

  useEffect(() => {
    if (step) {
      setName(step.name);
      setDescription(step.description || "");
      setStepType(step.step_type);
      setApprovalType(step.approval_type);
      setSlaHours(step.sla_hours?.toString() || "");
      setIsRequired(step.is_required);
      setAutoAssignEnabled(step.auto_assign_enabled);
      setAllowsWorkOrderCreation(step.allows_work_order_creation || false);
      setWorkOrderStatus(step.work_order_status || "");
      setIncidentStatus(step.incident_status || "");
    } else {
      setName("");
      setDescription("");
      setStepType("standard");
      setApprovalType("single");
      setSlaHours("");
      setIsRequired(true);
      setAutoAssignEnabled(false);
      setAllowsWorkOrderCreation(false);
      setWorkOrderStatus("");
      setIncidentStatus("");
    }
  }, [step, open]);

  useEffect(() => {
    if (roleAssignments && step) {
      setSelectedRoles(
        roleAssignments.map(ra => ({
          roleId: ra.role_id,
          canApprove: ra.can_approve,
          canReject: ra.can_reject,
          canAssign: ra.can_assign,
        }))
      );
    } else {
      setSelectedRoles([]);
    }
  }, [roleAssignments, step]);

  const handleSave = () => {
    const stepData: Partial<WorkflowTemplateStep> = {
      name,
      description,
      step_type: stepType,
      approval_type: approvalType,
      sla_hours: slaHours ? parseInt(slaHours) : null,
      is_required: isRequired,
      auto_assign_enabled: autoAssignEnabled,
      allows_work_order_creation: allowsWorkOrderCreation,
      work_order_status: workOrderStatus || null,
      incident_status: incidentStatus || null,
    };

    onSave(stepData);

    // Save role assignments after step is saved
    if (step?.id) {
      selectedRoles.forEach(role => {
        upsertRoleAssignment({
          step_id: step.id,
          role_id: role.roleId,
          role_name: '', // Will be populated from roles table
          can_approve: role.canApprove,
          can_reject: role.canReject,
          can_assign: role.canAssign,
          can_view: true,
          can_edit: false,
          is_primary_assignee: false,
          is_backup_assignee: false,
          assignment_logic: null,
          organization_id: step.organization_id,
        });
      });
    }
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => {
      const exists = prev.find(r => r.roleId === roleId);
      if (exists) {
        return prev.filter(r => r.roleId !== roleId);
      }
      return [...prev, { roleId, canApprove: true, canReject: false, canAssign: false }];
    });
  };

  const updateRolePermission = (roleId: string, permission: 'canApprove' | 'canReject' | 'canAssign', value: boolean) => {
    setSelectedRoles(prev =>
      prev.map(r => r.roleId === roleId ? { ...r, [permission]: value } : r)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <ScrollArea className="max-h-[80vh] pr-4">
        <DialogHeader>
          <DialogTitle>{step ? "Edit Workflow Step" : "Create Workflow Step"}</DialogTitle>
          <DialogDescription>
            Configure the properties and behavior of this workflow step
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="step-name">Step Name *</Label>
            <Input
              id="step-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Manager Approval"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step-description">Description</Label>
            <Textarea
              id="step-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happens in this step..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="step-type">Step Type</Label>
              <Select value={stepType} onValueChange={setStepType}>
                <SelectTrigger id="step-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approval-type">Approval Type</Label>
              <Select value={approvalType} onValueChange={setApprovalType}>
                <SelectTrigger id="approval-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Auto-transition)</SelectItem>
                  <SelectItem value="single">Single Approver</SelectItem>
                  <SelectItem value="multiple">Multiple Approvers</SelectItem>
                  <SelectItem value="unanimous">Unanimous Approval</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {approvalType === 'none' 
                  ? "Step will automatically continue to next step without approval"
                  : "Step requires explicit approval from assigned roles"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sla-hours">SLA Hours</Label>
            <Input
              id="sla-hours"
              type="number"
              value={slaHours}
              onChange={(e) => setSlaHours(e.target.value)}
              placeholder="Leave empty for no SLA"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is-required">Required Step</Label>
              <p className="text-sm text-muted-foreground">Cannot be skipped in workflow</p>
            </div>
            <Switch id="is-required" checked={isRequired} onCheckedChange={setIsRequired} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-assign">Auto-Assignment</Label>
              <p className="text-sm text-muted-foreground">
                Automatically assign based on rules
              </p>
            </div>
            <Switch
              id="auto-assign"
              checked={autoAssignEnabled}
              onCheckedChange={setAutoAssignEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-wo-creation">Allow Work Order Creation</Label>
              <p className="text-sm text-muted-foreground">
                Enable work order creation button at this step
              </p>
            </div>
            <Switch
              id="allow-wo-creation"
              checked={allowsWorkOrderCreation}
              onCheckedChange={setAllowsWorkOrderCreation}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="work-order-status">Work Order Status</Label>
            <Select value={workOrderStatus} onValueChange={setWorkOrderStatus}>
              <SelectTrigger id="work-order-status">
                <SelectValue placeholder="Select status (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Work order will transition to this status when step is reached
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="incident-status">Incident Status</Label>
            <Select value={incidentStatus} onValueChange={setIncidentStatus}>
              <SelectTrigger id="incident-status">
                <SelectValue placeholder="Select status (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Safety incident will transition to this status when step is reached
            </p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-2">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                💡 Status Mapping Guide:
              </p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• <span className="font-medium">Reported:</span> Initial incident report</li>
                <li>• <span className="font-medium">Investigating:</span> Review, investigation, analysis steps</li>
                <li>• <span className="font-medium">Resolved:</span> Manager approval, resolution steps</li>
                <li>• <span className="font-medium">Closed:</span> Final closure step</li>
              </ul>
            </div>
          </div>

          {step?.id && (
            <div className="space-y-3 border-t pt-4">
              <Label>Role Assignments</Label>
              <p className="text-sm text-muted-foreground">
                Assign roles that can perform actions in this step
              </p>
              {approvalType !== 'none' && selectedRoles.filter(r => r.canApprove).length === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
                    ⚠️ Warning: This step requires approval but no roles have "Can Approve" permission.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assign at least one role with "Can Approve" permission or change approval type to "None".
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {roles.map(role => {
                  const selected = selectedRoles.find(r => r.roleId === role.id);
                  return (
                    <div key={role.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={!!selected}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <Label htmlFor={`role-${role.id}`} className="cursor-pointer font-medium">
                          {role.display_name}
                        </Label>
                      </div>
                      {selected && (
                        <div className="ml-6 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`approve-${role.id}`}
                              checked={selected.canApprove}
                              onCheckedChange={(checked) => 
                                updateRolePermission(role.id, 'canApprove', checked as boolean)
                              }
                            />
                            <Label htmlFor={`approve-${role.id}`} className="text-sm cursor-pointer">
                              Can Approve
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`reject-${role.id}`}
                              checked={selected.canReject}
                              onCheckedChange={(checked) => 
                                updateRolePermission(role.id, 'canReject', checked as boolean)
                              }
                            />
                            <Label htmlFor={`reject-${role.id}`} className="text-sm cursor-pointer">
                              Can Reject
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`assign-${role.id}`}
                              checked={selected.canAssign}
                              onCheckedChange={(checked) => 
                                updateRolePermission(role.id, 'canAssign', checked as boolean)
                              }
                            />
                            <Label htmlFor={`assign-${role.id}`} className="text-sm cursor-pointer">
                              Can Assign
                            </Label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={
              !name || 
              (step?.id && approvalType !== 'none' && selectedRoles.filter(r => r.canApprove).length === 0)
            }
          >
            {step ? "Update Step" : "Create Step"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
