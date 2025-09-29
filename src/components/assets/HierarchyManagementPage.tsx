import { useState } from "react";
import { Plus, Settings, Search, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetHierarchy } from "./AssetHierarchy";
import { HierarchyManagerModal } from "./HierarchyManagerModal";
import { useHierarchyLevels, useHierarchyNodes } from "@/hooks/useHierarchyData";

export const HierarchyManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const { levels } = useHierarchyLevels();
  const { nodes } = useHierarchyNodes();

  const activeLevels = levels?.filter(level => level.is_active) || [];
  const totalNodes = nodes?.length || 0;
  const activeNodes = nodes?.filter(node => node.status === 'operational').length || 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hierarchy Management</h2>
          <p className="text-muted-foreground">Manage your asset hierarchy structure and organization</p>
        </div>
        
        <HierarchyManagerModal>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Manage Hierarchy
          </Button>
        </HierarchyManagerModal>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{levels?.length || 0}</div>
            <div className="text-xs text-muted-foreground">
              {activeLevels.length} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalNodes}</div>
            <div className="text-xs text-muted-foreground">
              {activeNodes} operational
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Max Depth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeLevels.length}</div>
            <div className="text-xs text-muted-foreground">hierarchy levels</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalNodes > 0 ? Math.round((activeNodes / totalNodes) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">nodes operational</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hierarchy nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInactive(!showInactive)}
        >
          {showInactive ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Hide Inactive
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Show Inactive
            </>
          )}
        </Button>
      </div>

      {/* Main Hierarchy Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hierarchy Tree View */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Asset Hierarchy Tree
              </CardTitle>
              <CardDescription>
                Visual representation of your asset hierarchy structure
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[520px] overflow-hidden">
              <AssetHierarchy 
                onNodeSelect={(node) => console.log('Selected node:', node)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Hierarchy Levels Summary */}
        <div>
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>Hierarchy Levels</CardTitle>
              <CardDescription>
                Overview of configured hierarchy levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-auto max-h-[520px]">
              {levels?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hierarchy levels configured</p>
                  <HierarchyManagerModal>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add First Level
                    </Button>
                  </HierarchyManagerModal>
                </div>
              ) : (
                levels?.map((level, index) => (
                  <div
                    key={level.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: level.color_code }}
                      />
                      <div>
                        <p className="font-medium text-sm text-foreground">{level.name}</p>
                        <p className="text-xs text-muted-foreground">Level {level.level_order}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={level.is_active ? "default" : "secondary"} className="text-xs">
                        {level.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};