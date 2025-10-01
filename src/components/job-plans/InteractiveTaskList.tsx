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
import { GripVertical, Shield } from "lucide-react";
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
function SortableTaskCard({ task }: { task: Task }) {
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
 * Displays tasks with drag-and-drop reordering functionality (always active)
 */
export function InteractiveTaskList({ tasks }: InteractiveTaskListProps) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const updateSequence = useUpdateTaskSequence();

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

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks defined for this job plan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tasks</h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop tasks to reorder
          </p>
        </div>
        {updateSequence.isPending && (
          <Badge variant="secondary">Saving...</Badge>
        )}
      </div>

      {/* Task List with Drag & Drop */}
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
              <SortableTaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
