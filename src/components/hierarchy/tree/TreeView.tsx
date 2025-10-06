import { useState, useMemo } from "react";
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
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableTreeNode, TreeNodeData } from "./DraggableTreeNode";
import { Button } from "@/components/ui/button";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * TreeView Component
 * 
 * Interactive tree view with drag-and-drop reordering, expand/collapse all,
 * and node selection.
 */

interface TreeViewProps {
  data: TreeNodeData[];
  selectedNodeId?: string;
  onSelectNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, newParentId: string | null) => void;
  onEditNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onAddChildNode?: (parentId: string) => void;
  dragDisabled?: boolean;
  maxHeight?: string;
}

export const TreeView = ({
  data,
  selectedNodeId,
  onSelectNode,
  onMoveNode,
  onEditNode,
  onDeleteNode,
  onAddChildNode,
  dragDisabled = false,
  maxHeight = "600px",
}: TreeViewProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Flatten tree for DnD
  const flattenedNodes = useMemo(() => {
    const flatten = (nodes: TreeNodeData[], depth = 0): TreeNodeData[] => {
      return nodes.reduce((acc: TreeNodeData[], node) => {
        acc.push({ ...node, depth } as any);
        if (node.children && expandedNodes.has(node.id)) {
          acc.push(...flatten(node.children, depth + 1));
        }
        return acc;
      }, []);
    };
    return flatten(data);
  }, [data, expandedNodes]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const toggleAllNodes = () => {
    if (allExpanded) {
      setExpandedNodes(new Set());
      setAllExpanded(false);
    } else {
      const allIds = new Set<string>();
      const collectIds = (nodes: TreeNodeData[]) => {
        nodes.forEach((node) => {
          if (node.children && node.children.length > 0) {
            allIds.add(node.id);
            collectIds(node.children);
          }
        });
      };
      collectIds(data);
      setExpandedNodes(allIds);
      setAllExpanded(true);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onMoveNode) return;
    
    // Handle node reordering logic here
    onMoveNode(active.id as string, over.id as string);
  };

  const renderNode = (node: TreeNodeData & { depth?: number }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const depth = (node as any).depth || 0;

    return (
      <DraggableTreeNode
        key={node.id}
        node={node}
        depth={depth}
        isExpanded={isExpanded}
        isSelected={isSelected}
        hasChildren={!!hasChildren}
        onToggle={() => toggleNode(node.id)}
        onSelect={() => onSelectNode?.(node.id)}
        onEdit={onEditNode ? () => onEditNode(node.id) : undefined}
        onDelete={onDeleteNode ? () => onDeleteNode(node.id) : undefined}
        onAddChild={onAddChildNode ? () => onAddChildNode(node.id) : undefined}
        dragDisabled={dragDisabled}
      />
    );
  };

  return (
    <div className="space-y-2">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Hierarchy Tree</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllNodes}
        >
          {allExpanded ? (
            <>
              <ChevronsDownUp className="h-4 w-4 mr-2" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronsUpDown className="h-4 w-4 mr-2" />
              Expand All
            </>
          )}
        </Button>
      </div>

      {/* Tree */}
      <ScrollArea style={{ maxHeight }} className="border rounded-lg">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={flattenedNodes.map((n) => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="p-2 space-y-1">
              {flattenedNodes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hierarchy nodes found. Create your first node to get started.
                </p>
              ) : (
                flattenedNodes.map(renderNode)
              )}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
};
