import { useMemo } from "react";
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
import { GripVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * DraggableLevelList Component
 * 
 * Drag-and-drop list for reordering hierarchy levels with inline actions.
 */

export interface LevelData {
  id: string;
  name: string;
  level_order: number;
  icon_name?: string;
  color_code?: string;
  is_active: boolean;
  parent_level_id?: string;
}

interface DraggableLevelRowProps {
  level: LevelData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const DraggableLevelRow = ({ level, onEdit, onDelete }: DraggableLevelRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: level.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-accent" : ""}>
      <TableCell className="w-12">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{level.level_order}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {level.color_code && (
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: level.color_code }}
            />
          )}
          <span>{level.name}</span>
        </div>
      </TableCell>
      <TableCell>
        {level.icon_name && (
          <Badge variant="outline">{level.icon_name}</Badge>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={level.is_active ? "default" : "secondary"}>
          {level.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(level.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(level.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

interface DraggableLevelListProps {
  levels: LevelData[];
  onReorder: (levels: LevelData[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DraggableLevelList = ({
  levels,
  onReorder,
  onEdit,
  onDelete,
}: DraggableLevelListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedLevels = useMemo(() => {
    return [...levels].sort((a, b) => a.level_order - b.level_order);
  }, [levels]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedLevels.findIndex((l) => l.id === active.id);
      const newIndex = sortedLevels.findIndex((l) => l.id === over.id);
      
      const reordered = arrayMove(sortedLevels, oldIndex, newIndex);
      
      // Update level_order for all items
      const updated = reordered.map((level, index) => ({
        ...level,
        level_order: index + 1,
      }));
      
      onReorder(updated);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-20">Order</TableHead>
              <TableHead>Level Name</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={sortedLevels.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedLevels.map((level) => (
                <DraggableLevelRow
                  key={level.id}
                  level={level}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
};
