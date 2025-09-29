import { useState } from "react";
import { ChevronRight, ChevronDown, Building2, MapPin, Cog, Component, Search, Zap, Activity, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface HierarchyNode {
  id: string;
  name: string;
  type: "state" | "station" | "substation" | "voltage" | "location" | "asset";
  status?: "operational" | "warning" | "critical" | "offline";
  children?: HierarchyNode[];
  assetCount?: number;
  voltageLevel?: string;
}

const mockHierarchy: HierarchyNode[] = [
  {
    id: "state-1",
    name: "California",
    type: "state",
    status: "operational",
    assetCount: 450,
    children: [
      {
        id: "station-1", 
        name: "Central Power Station",
        type: "station",
        status: "operational",
        assetCount: 180,
        children: [
          {
            id: "substation-1",
            name: "Distribution Sub A",
            type: "substation", 
            status: "warning",
            assetCount: 85,
            children: [
              {
                id: "voltage-1",
                name: "110kV Bay",
                type: "voltage",
                status: "operational",
                assetCount: 25,
                voltageLevel: "110kV",
                children: [
                  {
                    id: "location-1",
                    name: "Bay 1 Control Room",
                    type: "location",
                    status: "operational",
                    assetCount: 12,
                    children: [
                      { id: "asset-1", name: "Transformer T1-110", type: "asset", status: "operational" },
                      { id: "asset-2", name: "Circuit Breaker CB-101", type: "asset", status: "warning" },
                    ]
                  }
                ]
              },
              {
                id: "voltage-2",
                name: "220kV Bay",
                type: "voltage",
                status: "critical",
                assetCount: 35,
                voltageLevel: "220kV",
                children: [
                  {
                    id: "location-2",
                    name: "Bay 2 Switchyard",
                    type: "location",
                    status: "critical",
                    assetCount: 18,
                    children: [
                      { id: "asset-3", name: "Power Transformer PT-220", type: "asset", status: "critical" },
                      { id: "asset-4", name: "Disconnect Switch DS-201", type: "asset", status: "operational" },
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "station-2",
        name: "North Grid Station", 
        type: "station",
        status: "warning",
        assetCount: 120,
        children: [
          {
            id: "substation-2",
            name: "Transmission Sub B",
            type: "substation",
            status: "operational", 
            assetCount: 65,
            children: [
              {
                id: "voltage-3",
                name: "500kV Bay",
                type: "voltage",
                status: "operational",
                assetCount: 15,
                voltageLevel: "500kV",
                children: [
                  {
                    id: "location-3",
                    name: "Main Control Building",
                    type: "location",
                    status: "operational",
                    assetCount: 8,
                    children: [
                      { id: "asset-5", name: "Auto Transformer AT-500", type: "asset", status: "operational" },
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

const typeIcons = {
  state: MapPin,
  station: Building2,
  substation: Zap,
  voltage: Activity,
  location: Navigation,
  asset: Component,
};

interface AssetHierarchyProps {
  onNodeSelect?: (node: HierarchyNode) => void;
}

export function AssetHierarchy({ onNodeSelect }: AssetHierarchyProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["state-1", "station-1", "substation-1"]));
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
            node.type === "state" && "text-blue-500",
            node.type === "station" && "text-green-500", 
            node.type === "substation" && "text-orange-500",
            node.type === "voltage" && "text-purple-500",
            node.type === "location" && "text-teal-500",
            node.type === "asset" && "text-red-500"
          )} />
          
          <span className="text-sm font-medium flex-1 truncate">
            {node.name}
            {node.voltageLevel && (
              <span className="ml-2 text-xs bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full">
                {node.voltageLevel}
              </span>
            )}
          </span>
          
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
            placeholder="Search power grid..."
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