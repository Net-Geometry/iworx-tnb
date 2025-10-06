import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Network } from "lucide-react";
import { useHierarchyNodes, useHierarchyLevels } from "@/hooks/useHierarchyData";
import { TreeView } from "@/components/hierarchy/tree/TreeView";
import { NodeManagementForm } from "@/components/assets/NodeManagementForm";
import { HierarchyBreadcrumbs } from "@/components/hierarchy/shared/HierarchyBreadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * NodesManagementPage
 * 
 * Split-screen interface for managing hierarchy nodes.
 * Left panel: Interactive tree view with drag-and-drop
 * Right panel: Node details and editor
 */

const NodesManagementPage = () => {
  const { nodes, loading: nodesLoading, deleteNode, refetch } = useHierarchyNodes();
  const { levels } = useHierarchyLevels();
  const { toast } = useToast();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);

  // Flatten all nodes including nested children for easy lookup
  const flattenAllNodes = (nodeList: typeof nodes): typeof nodes => {
    const result: typeof nodes = [];
    const flatten = (items: typeof nodes) => {
      items.forEach(item => {
        if (item.nodeType === 'node') {
          result.push(item);
          if (item.children) {
            flatten(item.children as typeof nodes);
          }
        }
      });
    };
    flatten(nodeList);
    return result;
  };

  const allNodes = flattenAllNodes(nodes);
  const selectedNode = allNodes.find((n) => n.id === selectedNodeId);

  // Build breadcrumb path for selected node
  const buildPath = (nodeId: string): any[] => {
    const path: any[] = [];
    let current = allNodes.find((n) => n.id === nodeId);
    
    while (current) {
      path.unshift({
        id: current.id,
        name: current.name,
        level: current.level_info?.name,
      });
      current = current.parent_id ? allNodes.find((n) => n.id === current?.parent_id) : undefined;
    }
    
    return path;
  };

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleEditNode = (nodeId?: string) => {
    setEditingNodeId(nodeId || selectedNodeId);
    setShowForm(true);
  };

  const handleAddChild = (parentId: string) => {
    setEditingNodeId(null);
    setShowForm(true);
    // The form will need to know the parent ID
  };

  const handleDeleteNode = async () => {
    if (!deletingNodeId) return;

    try {
      await deleteNode(deletingNodeId);
      toast({
        title: "Node Deleted",
        description: "Hierarchy node has been successfully deleted.",
      });
      setDeletingNodeId(null);
      setSelectedNodeId(null);
      await refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete node. It may have child nodes or assets assigned.",
        variant: "destructive",
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingNodeId(null);
    refetch();
  };

  if (nodesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading nodes...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Hierarchy Nodes Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage hierarchy nodes with split-screen interface
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Node
        </Button>
      </div>

      {/* Split View */}
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
        {/* Left Panel - Tree View */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full p-6">
            <TreeView
              data={nodes}
              selectedNodeId={selectedNodeId || undefined}
              onSelectNode={handleSelectNode}
              onEditNode={handleEditNode}
              onDeleteNode={(id) => setDeletingNodeId(id)}
              onAddChildNode={handleAddChild}
              maxHeight="calc(100vh - 300px)"
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Node Details */}
        <ResizablePanel defaultSize={60}>
          <div className="h-full p-6 overflow-y-auto">
            {selectedNode ? (
              <div className="space-y-6">
                {/* Breadcrumbs */}
                <HierarchyBreadcrumbs
                  path={buildPath(selectedNode.id)}
                  onNavigate={handleSelectNode}
                  showHome={false}
                />

                {/* Node Details Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{selectedNode.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {selectedNode.level_info?.name} Level
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditNode(selectedNode.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingNodeId(selectedNode.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Status</h4>
                      <Badge variant={selectedNode.status === 'active' ? 'default' : 'secondary'}>
                        {selectedNode.status || 'Active'}
                      </Badge>
                    </div>

                    {/* Asset Count */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Assets</h4>
                      <p className="text-muted-foreground">
                        {selectedNode.asset_count || 0} assets assigned
                      </p>
                    </div>

                    {/* Properties */}
                    {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Custom Properties</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(selectedNode.properties).map(([key, value]) => (
                            <div key={key} className="bg-muted/50 p-3 rounded">
                              <p className="text-xs text-muted-foreground">{key}</p>
                              <p className="font-medium">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleAddChild(selectedNode.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Child Node
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          asChild
                        >
                          <Link to={`/assets?hierarchy_node=${selectedNode.id}`}>
                            View Assets
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Network className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Select a node from the tree to view details</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Node Form Dialog */}
      {showForm && (
        <NodeManagementForm
          nodeId={editingNodeId || undefined}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingNodeId} onOpenChange={() => setDeletingNodeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hierarchy Node?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hierarchy node
              and may affect child nodes and asset assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNode} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NodesManagementPage;
