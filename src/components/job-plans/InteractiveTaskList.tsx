import { useState } from "react";
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
import { GripVertical, Edit3, Save, X, Shield } from "lucide-react";
import { useUpdateTaskSequence } from "@/hooks/useUpdateTaskSequence";

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
}

interface InteractiveTaskListProps {
  tasks: Task[];
}

/**
 * Sortable Task Card Component
 * Individual task card with drag-and-drop functionality
 */
function SortableTaskCard({ task, isEditMode }: { task: Task; isEditMode: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? "shadow-lg" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle - only visible in edit mode */}
          {isEditMode && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing pt-1 hover:bg-accent rounded p-1 transition-colors"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 space-y-2">
            {/* Task Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  Step {task.task_sequence}
                </Badge>
                <h4 className="font-semibold">{task.task_title}</h4>
                {task.is_critical_step && (
                  <Badge variant="destructive" className="gap-1">
                    <Shield className="w-3 h-3" />
                    Critical
                  </Badge>
                )}
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
 * Displays tasks with drag-and-drop reordering functionality
 */
export function InteractiveTaskList({ tasks }: InteractiveTaskListProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [localTasks, setLocalTasks] = useState(tasks);
  const updateSequence = useUpdateTaskSequence();

  // Sync local tasks with prop changes when not in edit mode
  if (!isEditMode && JSON.stringify(tasks) !== JSON.stringify(localTasks)) {
    setLocalTasks(tasks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    // Prepare updates with new sequence numbers
    const updates = localTasks.map((task, index) => ({
      id: task.id,
      task_sequence: index + 1,
    }));

    updateSequence.mutate(
      { updates },
      {
        onSuccess: () => {
          setIsEditMode(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setLocalTasks(tasks); // Reset to original order
    setIsEditMode(false);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks defined for this job plan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Edit Mode Controls */}
      <div className="flex items-center justify-between">
        <div>
          {isEditMode && (
            <p className="text-sm text-muted-foreground">
              Drag tasks to reorder them
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!isEditMode ? (
            <Button onClick={() => setIsEditMode(true)} variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Order
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                disabled={updateSequence.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                disabled={updateSequence.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSequence.isPending ? "Saving..." : "Save Order"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Task List */}
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
              <SortableTaskCard key={task.id} task={task} isEditMode={isEditMode} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
