/**
 * Hierarchy Filter Panel
 * 
 * Allows users to filter assets by location hierarchy
 */

import { useState } from 'react';
import { MapPin, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useHierarchyNodes } from '@/hooks/useHierarchyData';

interface HierarchyFilterPanelProps {
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
}

export function HierarchyFilterPanel({ selectedNodeId, onNodeSelect }: HierarchyFilterPanelProps) {
  const { nodes, loading } = useHierarchyNodes();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Recursive function to render hierarchy tree
  const renderNode = (node: any, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors ${
            isSelected ? 'bg-primary/10 border border-primary' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* Expand/Collapse button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedNodes(prev => {
                  const next = new Set(prev);
                  if (isExpanded) {
                    next.delete(node.id);
                  } else {
                    next.add(node.id);
                  }
                  return next;
                });
              }}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </Button>
          )}

          {/* Node info */}
          <div
            className="flex-1 flex items-center gap-2"
            onClick={() => onNodeSelect(node.id)}
          >
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{node.name}</span>
            <Badge variant="outline" className="ml-auto">
              {node.asset_count || 0} assets
            </Badge>
          </div>
        </div>

        {/* Render children */}
        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {node.children
              .filter((child: any) => child.nodeType === 'node')
              .map((child: any) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading locations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Filter by Location</h3>
        </div>
        {selectedNodeId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNodeSelect(null)}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filter
          </Button>
        )}
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-2">
        {nodes.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No hierarchy configured yet
          </div>
        ) : (
          <div className="space-y-1">
            {nodes.map(node => renderNode(node))}
          </div>
        )}
      </ScrollArea>

      {selectedNodeId && (
        <div className="text-sm text-muted-foreground">
          💡 Showing assets in selected location and its sub-locations
        </div>
      )}
    </div>
  );
}
