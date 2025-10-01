import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateTask } from "@/hooks/useCreateTask";
import { MeterGroupSelector } from "./MeterGroupSelector";

interface TaskCreateDialogProps {
  jobPlanId: string;
  organizationId: string;
  nextSequence: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for creating new tasks
 */
export function TaskCreateDialog({ 
  jobPlanId, 
  organizationId, 
  nextSequence, 
  open, 
  onOpenChange 
}: TaskCreateDialogProps) {
  const createTask = useCreateTask();
  
  const [formData, setFormData] = useState({
    task_title: "",
    task_description: "",
    estimated_duration_minutes: 0,
    skill_required: "",
    is_critical_step: false,
    completion_criteria: "",
    notes: "",
    meter_group_id: undefined as string | undefined,
  });

  const resetForm = () => {
    setFormData({
      task_title: "",
      task_description: "",
      estimated_duration_minutes: 0,
      skill_required: "",
      is_critical_step: false,
      completion_criteria: "",
      notes: "",
      meter_group_id: undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createTask.mutateAsync({
      job_plan_id: jobPlanId,
      organization_id: organizationId,
      task_sequence: nextSequence,
      ...formData,
      estimated_duration_minutes: formData.estimated_duration_minutes || undefined,
    });

    resetForm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleCancel();
      else onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task - Step {nextSequence}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task_title">Task Title *</Label>
            <Input
              id="task_title"
              value={formData.task_title}
              onChange={(e) => setFormData({ ...formData, task_title: e.target.value })}
              required
              placeholder="Enter task title"
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="task_description">Description</Label>
            <Textarea
              id="task_description"
              value={formData.task_description}
              onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
              rows={3}
              placeholder="Describe the task in detail"
            />
          </div>

          {/* Duration and Skill */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.estimated_duration_minutes}
                onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill">Skill Required</Label>
              <Input
                id="skill"
                value={formData.skill_required}
                onChange={(e) => setFormData({ ...formData, skill_required: e.target.value })}
                placeholder="e.g., Electrical, Mechanical"
              />
            </div>
          </div>

          {/* Critical Step */}
          <div className="flex items-center space-x-2">
            <Switch
              id="critical"
              checked={formData.is_critical_step}
              onCheckedChange={(checked) => setFormData({ ...formData, is_critical_step: checked })}
            />
            <Label htmlFor="critical">Critical Step</Label>
          </div>

          {/* Completion Criteria */}
          <div className="space-y-2">
            <Label htmlFor="completion_criteria">Completion Criteria</Label>
            <Textarea
              id="completion_criteria"
              value={formData.completion_criteria}
              onChange={(e) => setFormData({ ...formData, completion_criteria: e.target.value })}
              rows={2}
              placeholder="How to verify this step is complete"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Additional notes or instructions"
            />
          </div>

          {/* Meter Group */}
          <MeterGroupSelector
            value={formData.meter_group_id}
            onChange={(value) => setFormData({ ...formData, meter_group_id: value })}
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
