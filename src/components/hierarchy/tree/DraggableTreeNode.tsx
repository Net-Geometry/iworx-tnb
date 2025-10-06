import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, ChevronDown, GripVertical, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

/**
 * DraggableTreeNode Component
 * 
 * Individual tree node with drag-and-drop functionality, expand/collapse,
 * and context menu actions.
 */

export interface TreeNodeData {
  id: string;
  name: string;
  level?: string;
  levelColor?: string;
  status?: string;
  assetCount?: number;
  children?: TreeNodeData[];
}

interface DraggableTreeNodeProps {
  node: TreeNodeData;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddChild?: () => void;
  dragDisabled?: boolean;
}

export const DraggableTreeNode = ({
  node,
  depth,
  isExpanded,
  isSelected,
  hasChildren,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  dragDisabled = false,
}: DraggableTreeNodeProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: node.id,
    disabled: dragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent/50 cursor-pointer transition-colors",
        isSelected && "bg-accent",
        isDragging && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      {/* Indentation */}
      <div style={{ width: `${depth * 24}px` }} />

      {/* Drag Handle */}
      {!dragDisabled && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Expand/Collapse Button */}
      {hasChildren ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ) : (
        <div className="w-6" />
      )}

      {/* Level Color Indicator */}
      {node.levelColor && (
        <div
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: node.levelColor }}
        />
      )}

      {/* Node Name */}
      <div className="flex-1 flex items-center gap-2">
        <span className="font-medium">{node.name}</span>
        
        {node.level && (
          <Badge variant="outline" className="text-xs">
            {node.level}
          </Badge>
        )}
        
        {node.status && node.status !== "active" && (
          <Badge variant="secondary" className="text-xs">
            {node.status}
          </Badge>
        )}
        
        {node.assetCount !== undefined && node.assetCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {node.assetCount} assets
          </Badge>
        )}
      </div>

      {/* Context Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}>
              Edit
            </DropdownMenuItem>
          )}
          {onAddChild && (
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onAddChild();
            }}>
              Add Child Node
            </DropdownMenuItem>
          )}
          {(onEdit || onAddChild) && onDelete && <DropdownMenuSeparator />}
          {onDelete && (
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
