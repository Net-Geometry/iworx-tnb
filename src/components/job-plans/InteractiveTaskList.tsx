import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, Shield, Pencil, Trash2, Plus, Gauge } from "lucide-react";
import { useUpdateTaskSequence } from "@/hooks/useUpdateTaskSequence";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import { useMeterGroups } from "@/hooks/useMeterGroups";
import { TaskEditDialog } from "./TaskEditDialog";
import { TaskCreateDialog } from "./TaskCreateDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Task {
  id: string;
  task_sequence: number;
  task_title: string;
  task_description?: string;
  estimated_duration_minutes?: number;
  skill_required?: string;
  is_critical_step?: boolean;
  safety_precaution_ids?: string[];
  completion_criteria?: string;
  notes?: string;
  meter_group_id?: string;
}

interface InteractiveTaskListProps {
  tasks: Task[];
  jobPlanId: string;
  organizationId: string;
}

/**
 * Sortable Task Card Component
 * Individual task card with drag-and-drop functionality
 */
function SortableTaskCard({ 
  task, 
  onEdit, 
  onDelete,
  meterGroups,
}: { 
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  meterGroups: Array<{ id: string; name: string; group_number: string }>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Find the meter group for this task
  const meterGroup = task.meter_group_id 
    ? meterGroups.find(mg => mg.id === task.meter_group_id)
    : null;

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? "shadow-lg" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle - Always visible */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing pt-1 hover:bg-accent rounded p-1 transition-colors"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex-1 space-y-2">
            {/* Task Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Badge variant="outline" className="font-mono">
                  Step {task.task_sequence || 1}
                </Badge>
                <h4 className="font-semibold">{task.task_title}</h4>
                {task.is_critical_step && (
                  <Badge variant="destructive" className="gap-1">
                    <Shield className="w-3 h-3" />
                    Critical
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(task)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(task)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Task Description */}
            {task.task_description && (
              <p className="text-sm text-muted-foreground">{task.task_description}</p>
            )}

            {/* Task Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {task.estimated_duration_minutes && (
                <span>Duration: {task.estimated_duration_minutes} min</span>
              )}
              {task.skill_required && (
                <span>Skill: {task.skill_required}</span>
              )}
              {task.safety_precaution_ids && task.safety_precaution_ids.length > 0 && (
                <Badge variant="secondary">
                  {task.safety_precaution_ids.length} Safety Precaution(s)
                </Badge>
              )}
              {meterGroup && (
                <Badge variant="outline" className="gap-1">
                  <Gauge className="w-3 h-3" />
                  {meterGroup.name} {meterGroup.group_number ? `(${meterGroup.group_number})` : ""}
                </Badge>
              )}
            </div>

            {/* Completion Criteria */}
            {task.completion_criteria && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">Completion Criteria:</p>
                <p className="text-sm text-muted-foreground">{task.completion_criteria}</p>
              </div>
            )}

            {/* Notes */}
            {task.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">Notes:</p>
                <p className="text-sm text-muted-foreground">{task.notes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Interactive Task List Component
 * Displays tasks with drag-and-drop reordering functionality (always active)
 */
export function InteractiveTaskList({ tasks, jobPlanId, organizationId }: InteractiveTaskListProps) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const updateSequence = useUpdateTaskSequence();
  const deleteTask = useDeleteTask();
  const { meterGroups } = useMeterGroups();

  // Sync local tasks with prop changes
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = localTasks.findIndex((item) => item.id === active.id);
    const newIndex = localTasks.findIndex((item) => item.id === over.id);

    const reorderedTasks = arrayMove(localTasks, oldIndex, newIndex);
    
    // Update local state immediately for responsiveness
    setLocalTasks(reorderedTasks);

    // Auto-save: Create updates with new sequence numbers
    const updates = reorderedTasks.map((task, index) => ({
      id: task.id,
      task_sequence: index + 1,
    }));

    try {
      await updateSequence.mutateAsync({ updates });
    } catch (error) {
      // Revert on error (error toast is handled by the hook)
      setLocalTasks(tasks);
      console.error("Failed to save task order:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    
    await deleteTask.mutateAsync(deletingTask.id);
    setDeletingTask(null);
  };

  // Calculate the next sequence number for new tasks
  const nextSequence = tasks.length > 0 
    ? Math.max(...tasks.map(t => t.task_sequence || 0)) + 1 
    : 1;

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tasks</h3>
          <p className="text-sm text-muted-foreground">
            {tasks.length > 0 ? "Drag and drop tasks to reorder" : "No tasks yet. Add your first task to get started."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {updateSequence.isPending && (
            <Badge variant="secondary">Saving...</Badge>
          )}
          <Button onClick={() => setIsCreating(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Task List with Drag & Drop */}
      {tasks.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localTasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {localTasks.map((task) => (
                <SortableTaskCard 
                  key={task.id} 
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={setDeletingTask}
                  meterGroups={meterGroups}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create Task Dialog */}
      <TaskCreateDialog
        jobPlanId={jobPlanId}
        organizationId={organizationId}
        nextSequence={nextSequence}
        open={isCreating}
        onOpenChange={setIsCreating}
      />

      {/* Edit Task Dialog */}
      <TaskEditDialog
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTask} onOpenChange={(open) => !open && setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTask?.task_title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
