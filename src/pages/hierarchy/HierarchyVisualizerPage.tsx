import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Download } from "lucide-react";
import { useHierarchyNodes } from "@/hooks/useHierarchyData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * HierarchyVisualizerPage
 * 
 * Interactive canvas-based visualization of the complete hierarchy structure.
 * Features zoom, pan, and export capabilities.
 */

const HierarchyVisualizerPage = () => {
  const { nodes, loading } = useHierarchyNodes();
  const [zoom, setZoom] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert("Export functionality coming soon!");
  };

  // Render tree nodes recursively
  const renderNode = (node: any, depth = 0) => {
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="flex flex-col items-center gap-2">
        {/* Node Box */}
        <div
          onClick={() => setSelectedNodeId(node.id)}
          className={`
            relative px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
            min-w-[200px] text-center
            ${isSelected 
              ? 'border-primary bg-primary/10 shadow-lg' 
              : 'border-border bg-card hover:border-primary/50 hover:shadow'
            }
          `}
          style={{
            borderLeftWidth: '4px',
            borderLeftColor: node.level_info?.color_code || '#ccc',
          }}
        >
          <div className="font-semibold text-sm">{node.name}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {node.level_info?.name}
          </div>
          {node.asset_count > 0 && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {node.asset_count} assets
            </Badge>
          )}
        </div>

        {/* Children */}
        {hasChildren && (
          <div className="flex gap-8 mt-4 relative">
            {/* Connecting Line */}
            <div className="absolute top-0 left-1/2 w-px h-4 bg-border -translate-x-1/2 -translate-y-4" />
            
            {node.children.map((child: any, index: number) => (
              <div key={child.id} className="relative">
                {/* Horizontal connecting line */}
                {index < node.children.length - 1 && (
                  <div className="absolute top-0 left-full w-8 h-px bg-border" />
                )}
                {renderNode(child, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading hierarchy...</p>
        </div>
      </div>
    );
  }

  // Get root nodes (nodes without parents)
  const rootNodes = nodes.filter((n) => !n.parent_id);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link to="/assets/hierarchy">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Hierarchy Visualizer</h1>
          <p className="text-muted-foreground mt-1">
            Interactive view of your complete asset hierarchy
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visualization Area */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div
              ref={canvasRef}
              className="overflow-auto border rounded-lg bg-muted/20"
              style={{ minHeight: '600px' }}
            >
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s',
                  padding: '40px',
                }}
              >
                {rootNodes.length === 0 ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center text-muted-foreground">
                      <p>No hierarchy nodes to visualize</p>
                      <Button asChild className="mt-4">
                        <Link to="/assets/hierarchy/nodes">Create Nodes</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-12 justify-center">
                    {rootNodes.map((node) => renderNode(node))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Panel */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Node Details</h3>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedNode.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <Badge variant="outline">{selectedNode.level_info?.name}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assets</p>
                  <p className="font-medium">{selectedNode.asset_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedNode.status === 'active' ? 'default' : 'secondary'}>
                    {selectedNode.status || 'Active'}
                  </Badge>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full mt-4"
                >
                  <Link to={`/assets/hierarchy/nodes`}>
                    Edit Node
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click on a node to view its details
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary bg-primary/10 rounded" />
              <span className="text-sm">Selected Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-muted rounded" />
              <span className="text-sm">Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">5 assets</Badge>
              <span className="text-sm">Asset Count</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HierarchyVisualizerPage;
