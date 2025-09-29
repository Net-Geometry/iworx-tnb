import { useState } from "react";
import { ChevronRight, ChevronDown, Building2, MapPin, Cog, Component, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface HierarchyNode {
  id: string;
  name: string;
  type: "site" | "area" | "system" | "component";
  status?: "operational" | "warning" | "critical" | "offline";
  children?: HierarchyNode[];
  assetCount?: number;
}

const mockHierarchy: HierarchyNode[] = [
  {
    id: "site-1",
    name: "Manufacturing Plant 1",
    type: "site",
    status: "operational",
    assetCount: 45,
    children: [
      {
        id: "area-1", 
        name: "Production Floor",
        type: "area",
        status: "warning",
        assetCount: 25,
        children: [
          {
            id: "system-1",
            name: "Line A",
            type: "system", 
            status: "operational",
            assetCount: 8,
            children: [
              { id: "comp-1", name: "Conveyor Belt A1", type: "component", status: "operational" },
              { id: "comp-2", name: "Conveyor Belt A2", type: "component", status: "warning" },
            ]
          },
          {
            id: "system-2",
            name: "Line B", 
            type: "system",
            status: "warning",
            assetCount: 12,
            children: [
              { id: "comp-3", name: "Hydraulic Press HP-200", type: "component", status: "warning" },
              { id: "comp-4", name: "Robotic Arm RA-150", type: "component", status: "operational" },
            ]
          }
        ]
      },
      {
        id: "area-2",
        name: "Utilities", 
        type: "area",
        status: "critical",
        assetCount: 12,
        children: [
          {
            id: "system-3",
            name: "Compressed Air",
            type: "system",
            status: "critical", 
            assetCount: 5,
            children: [
              { id: "comp-5", name: "Air Compressor AC-50", type: "component", status: "critical" },
            ]
          }
        ]
      },
      {
        id: "area-3",
        name: "Packaging",
        type: "area", 
        status: "operational",
        assetCount: 8,
        children: [
          {
            id: "system-4",
            name: "Packaging Line",
            type: "system",
            status: "operational",
            assetCount: 8,
            children: [
              { id: "comp-6", name: "Packaging Robot PR-300", type: "component", status: "operational" },
            ]
          }
        ]
      }
    ]
  }
];

const typeIcons = {
  site: Building2,
  area: MapPin,
  system: Cog,
  component: Component,
};

interface AssetHierarchyProps {
  onNodeSelect?: (node: HierarchyNode) => void;
}

export function AssetHierarchy({ onNodeSelect }: AssetHierarchyProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["site-1", "area-1"]));
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (node: HierarchyNode) => {
    setSelectedNode(node.id);
    onNodeSelect?.(node);
  };

  const renderNode = (node: HierarchyNode, level = 0): React.ReactNode => {
    const Icon = typeIcons[node.type];
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;

    // Simple search filter
    const matchesSearch = !searchTerm || 
      node.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch && level === 0) return null;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors",
            isSelected && "bg-muted text-primary",
            level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => handleNodeClick(node)}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-4" />
          )}
          
          <Icon className={cn(
            "h-4 w-4",
            node.type === "site" && "text-blue-500",
            node.type === "area" && "text-green-500", 
            node.type === "system" && "text-orange-500",
            node.type === "component" && "text-purple-500"
          )} />
          
          <span className="text-sm font-medium flex-1 truncate">{node.name}</span>
          
          <div className="flex items-center gap-2">
            {node.assetCount && (
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                {node.assetCount}
              </span>
            )}
            {node.status && (
              <div className={`w-2 h-2 rounded-full ${
                node.status === 'operational' ? 'bg-green-500' :
                node.status === 'warning' ? 'bg-yellow-500' :
                node.status === 'critical' ? 'bg-red-500' :
                'bg-gray-500'
              }`} />
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold text-foreground mb-3">Asset Hierarchy</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {mockHierarchy.map(node => renderNode(node))}
        </div>
      </ScrollArea>
    </div>
  );
}