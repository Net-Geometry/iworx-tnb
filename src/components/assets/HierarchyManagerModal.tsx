import { useState } from "react";
import { Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHierarchyLevels, useHierarchyNodes } from "@/hooks/useHierarchyData";
import { LevelManagementForm } from "./LevelManagementForm";
import { NodeManagementForm } from "./NodeManagementForm";
import { useToast } from "@/hooks/use-toast";

interface HierarchyManagerModalProps {
  children: React.ReactNode;
}

export function HierarchyManagerModal({ children }: HierarchyManagerModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("nodes");
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  
  const { levels, loading: levelsLoading, deleteLevel } = useHierarchyLevels();
  const { nodes, loading: nodesLoading, deleteNode } = useHierarchyNodes();
  const { toast } = useToast();

  const handleDeleteLevel = async (id: string) => {
    try {
      await deleteLevel(id);
      toast({
        title: "Success",
        description: "Hierarchy level deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete level",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNode = async (id: string) => {
    try {
      await deleteNode(id);
      toast({
        title: "Success", 
        description: "Hierarchy node deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete node",
        variant: "destructive",
      });
    }
  };

  const renderNodeTree = (nodes: any[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id} className="space-y-2">
        <Card className={`${level > 0 ? 'ml-4' : ''}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{node.name}</span>
                <Badge variant="secondary" style={{ backgroundColor: node.level_info?.color_code + '20', color: node.level_info?.color_code }}>
                  {node.level_info?.name}
                </Badge>
                <Badge variant={node.status === 'operational' ? 'default' : 'destructive'}>
                  {node.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingNode(node.id)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNode(node.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {node.children && node.children.length > 0 && renderNodeTree(node.children, level + 1)}
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Hierarchy Management</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList>
            <TabsTrigger value="nodes">Manage Nodes</TabsTrigger>
            <TabsTrigger value="levels">Manage Levels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nodes" className="h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Hierarchy Nodes</h3>
                <Button onClick={() => setEditingNode('new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Node
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                {nodesLoading ? (
                  <div className="flex justify-center p-8">Loading nodes...</div>
                ) : (
                  <div className="space-y-2">
                    {renderNodeTree(nodes)}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="levels" className="h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Hierarchy Levels</h3>
                <Button onClick={() => setEditingLevel('new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Level
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                {levelsLoading ? (
                  <div className="flex justify-center p-8">Loading levels...</div>
                ) : (
                  <div className="space-y-2">
                    {levels
                      .sort((a, b) => a.level_order - b.level_order)
                      .map((level) => (
                        <Card key={level.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-4 h-4 rounded" 
                                  style={{ backgroundColor: level.color_code }}
                                />
                                <span className="font-medium">{level.name}</span>
                                <Badge variant="outline">Order: {level.level_order}</Badge>
                                <Badge variant="secondary">{level.icon_name}</Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingLevel(level.id)}
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteLevel(level.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        {editingLevel && (
          <LevelManagementForm
            levelId={editingLevel === 'new' ? undefined : editingLevel}
            onClose={() => setEditingLevel(null)}
          />
        )}

        {editingNode && (
          <NodeManagementForm
            nodeId={editingNode === 'new' ? undefined : editingNode}
            onClose={() => setEditingNode(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}