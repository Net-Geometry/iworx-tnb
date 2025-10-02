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
import type { WorkflowTemplateStep } from "@/hooks/useWorkflowTemplateSteps";

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

  useEffect(() => {
    if (step) {
      setName(step.name);
      setDescription(step.description || "");
      setStepType(step.step_type);
      setApprovalType(step.approval_type);
      setSlaHours(step.sla_hours?.toString() || "");
      setIsRequired(step.is_required);
      setAutoAssignEnabled(step.auto_assign_enabled);
    } else {
      setName("");
      setDescription("");
      setStepType("standard");
      setApprovalType("single");
      setSlaHours("");
      setIsRequired(true);
      setAutoAssignEnabled(false);
    }
  }, [step, open]);

  const handleSave = () => {
    const stepData: Partial<WorkflowTemplateStep> = {
      name,
      description,
      step_type: stepType,
      approval_type: approvalType,
      sla_hours: slaHours ? parseInt(slaHours) : null,
      is_required: isRequired,
      auto_assign_enabled: autoAssignEnabled,
    };

    onSave(stepData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <SelectItem value="single">Single Approver</SelectItem>
                  <SelectItem value="multiple">Multiple Approvers</SelectItem>
                  <SelectItem value="unanimous">Unanimous Approval</SelectItem>
                </SelectContent>
              </Select>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name}>
            {step ? "Update Step" : "Create Step"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
