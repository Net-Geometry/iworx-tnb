import { useState } from "react";
import { ChevronRight, ChevronDown, Search, Plus, Settings, Map, Building2, Zap, Activity, Navigation, Component, Folder, MapPin, Building, Factory, Home, Users, Box, Package, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useHierarchyNodes, useHierarchyLevels, HierarchyNode } from "@/hooks/useHierarchyData";
import { HierarchyManagerModal } from "./HierarchyManagerModal";

// Dynamic icon mapping based on hierarchy levels
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    map: Map,
    building2: Building2,
    zap: Zap,
    activity: Activity,
    navigation: Navigation,
    component: Component,
    folder: Folder,
    'map-pin': MapPin,
    building: Building,
    factory: Factory,
    home: Home,
    settings: Settings,
    users: Users,
    box: Box,
    package: Package,
    wrench: Wrench,
  };
  return iconMap[iconName] || Folder;
};

interface AssetHierarchyProps {
  onNodeSelect?: (node: HierarchyNode) => void;
}

export function AssetHierarchy({ onNodeSelect }: AssetHierarchyProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { nodes, loading, error, refetch } = useHierarchyNodes();
  const { levels } = useHierarchyLevels();

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
    const IconComponent = getIconComponent(node.level_info?.icon_name || 'folder');
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;

    // Simple search filter
    const matchesSearch = !searchTerm || 
      node.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch && level === 0) return null;

    // Get voltage level from properties if it exists
    const voltageLevel = node.properties?.voltage_level;
    const levelColor = node.level_info?.color_code || '#6b7280';

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group",
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
          
          <IconComponent 
            className="h-4 w-4" 
            style={{ color: levelColor }}
          />
          
          <span className="text-sm font-medium flex-1 truncate">
            {node.name}
            {voltageLevel && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ 
                backgroundColor: levelColor + '20', 
                color: levelColor 
              }}>
                {voltageLevel}
              </span>
            )}
          </span>
          
          <div className="flex items-center gap-2">
            {node.asset_count > 0 && (
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                {node.asset_count}
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
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                // This will be handled by the HierarchyManagerModal
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
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

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-muted-foreground">Loading hierarchy...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-destructive mb-2">Error loading hierarchy</div>
        <Button variant="outline" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Asset Hierarchy</h3>
          <HierarchyManagerModal>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </HierarchyManagerModal>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search hierarchy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <div className="mb-2">No hierarchy nodes found</div>
              <HierarchyManagerModal>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Node
                </Button>
              </HierarchyManagerModal>
            </div>
          ) : (
            nodes.map(node => renderNode(node))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}