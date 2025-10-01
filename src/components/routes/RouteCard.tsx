import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Route, MapPin, Edit, Trash2, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { MaintenanceRoute } from "@/hooks/useMaintenanceRoutes";
import { useRouteAssets } from "@/hooks/useRouteAssets";
import { RouteAssetSelector } from "./RouteAssetSelector";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/**
 * Card component for displaying maintenance route information
 * Shows route details with actions for edit and delete
 */

interface RouteCardProps {
  route: MaintenanceRoute;
  onEdit: (route: MaintenanceRoute) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export const RouteCard = ({
  route,
  onEdit,
  onDelete,
  onView,
}: RouteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>();
  const { routeAssets, addAsset, removeAsset } = useRouteAssets(route.id);

  const handleAddAsset = () => {
    if (!selectedAssetId) return;

    const nextSequence = routeAssets.length > 0
      ? Math.max(...routeAssets.map((ra) => ra.sequence_order)) + 1
      : 1;

    addAsset({
      asset_id: selectedAssetId,
      sequence_order: nextSequence,
    });

    setSelectedAssetId(undefined);
    setIsAddingAsset(false);
  };

  const assignedAssetIds = routeAssets.map((ra) => ra.asset_id);
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "inactive":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      case "draft":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "inspection":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "maintenance":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "repair":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => onView(route.id)}>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{route.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {route.route_number}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(route.status)}>
            {route.status || "active"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 cursor-pointer" onClick={() => onView(route.id)}>
          {route.description || "No description provided"}
        </p>

        <div className="flex flex-wrap gap-2 mb-4 cursor-pointer" onClick={() => onView(route.id)}>
          <Badge variant="outline" className={getTypeColor(route.route_type)}>
            {route.route_type || "maintenance"}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <MapPin className="h-3 w-3" />
            {routeAssets.length} Assets
          </Badge>
        </div>

        {/* Expandable Asset Section */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full mb-2"
              onClick={(e) => e.stopPropagation()}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              {isExpanded ? "Hide Assets" : "Manage Assets"}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2 mb-4">
            {/* Asset List */}
            {routeAssets.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {routeAssets.map((ra) => (
                  <div
                    key={ra.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="shrink-0">{ra.sequence_order}</Badge>
                      <span className="truncate">{ra.asset?.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAsset(ra.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Add Asset */}
            {isAddingAsset ? (
              <div className="space-y-2 p-2 border rounded-lg bg-background">
                <RouteAssetSelector
                  value={selectedAssetId}
                  onValueChange={setSelectedAssetId}
                  excludeAssetIds={assignedAssetIds}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddAsset();
                    }}
                    disabled={!selectedAssetId}
                    className="flex-1"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingAsset(false);
                      setSelectedAssetId(undefined);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingAsset(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(route);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(route.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
