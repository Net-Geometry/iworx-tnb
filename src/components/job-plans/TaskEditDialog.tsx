import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useUpdateTask } from "@/hooks/useUpdateTask";

interface Task {
  id: string;
  task_sequence: number;
  task_title: string;
  task_description?: string;
  estimated_duration_minutes?: number;
  skill_required?: string;
  is_critical_step?: boolean;
  completion_criteria?: string;
  notes?: string;
}

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for editing task details
 */
export function TaskEditDialog({ task, open, onOpenChange }: TaskEditDialogProps) {
  const updateTask = useUpdateTask();
  
  const [formData, setFormData] = useState({
    task_title: task?.task_title || "",
    task_description: task?.task_description || "",
    estimated_duration_minutes: task?.estimated_duration_minutes || 0,
    skill_required: task?.skill_required || "",
    is_critical_step: task?.is_critical_step || false,
    completion_criteria: task?.completion_criteria || "",
    notes: task?.notes || "",
  });

  // Update form when task changes
  if (task && formData.task_title !== task.task_title && open) {
    setFormData({
      task_title: task.task_title,
      task_description: task.task_description || "",
      estimated_duration_minutes: task.estimated_duration_minutes || 0,
      skill_required: task.skill_required || "",
      is_critical_step: task.is_critical_step || false,
      completion_criteria: task.completion_criteria || "",
      notes: task.notes || "",
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    await updateTask.mutateAsync({
      id: task.id,
      ...formData,
      estimated_duration_minutes: formData.estimated_duration_minutes || undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task - Step {task?.task_sequence}</DialogTitle>
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
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateTask.isPending}>
              {updateTask.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
