import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Plus, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useMaintenanceRoute } from "@/hooks/useMaintenanceRoutes";
import { useRouteAssets } from "@/hooks/useRouteAssets";
import { RouteForm } from "@/components/routes/RouteForm";
import { useMaintenanceRoutes } from "@/hooks/useMaintenanceRoutes";
import { RouteAssetSelector } from "@/components/routes/RouteAssetSelector";
import { RouteAssignmentsList } from "@/components/routes/RouteAssignmentsList";

/**
 * Detailed view of a maintenance route
 * Shows route information and asset assignments with management capabilities
 */

const RouteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: route, isLoading } = useMaintenanceRoute(id);
  const { routeAssets, removeAsset, addAsset } = useRouteAssets(id);
  const { updateRoute } = useMaintenanceRoutes();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>();
  const [notes, setNotes] = useState("");

  const handleUpdateRoute = (data: any) => {
    if (id) {
      updateRoute({ id, updates: data });
      setIsEditDialogOpen(false);
    }
  };

  const handleAddAsset = () => {
    if (!selectedAssetId) return;

    const nextSequence = routeAssets.length > 0
      ? Math.max(...routeAssets.map((ra) => ra.sequence_order)) + 1
      : 1;

    addAsset({
      asset_id: selectedAssetId,
      sequence_order: nextSequence,
      notes: notes || undefined,
    });

    // Reset form
    setIsAddingAsset(false);
    setSelectedAssetId(undefined);
    setNotes("");
  };

  const assignedAssetIds = routeAssets.map((ra) => ra.asset_id);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Route not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/routes")}
          >
            Back to Routes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/routes")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{route.name}</h1>
            <p className="text-muted-foreground mt-1">{route.route_number}</p>
          </div>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Route
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={
                route.status === "active"
                  ? "bg-green-500/10 text-green-600"
                  : "bg-gray-500/10 text-gray-600"
              }
            >
              {route.status || "active"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Route Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold capitalize">
              {route.route_type || "maintenance"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{routeAssets.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="assets" className="w-full">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Inline Add Asset Form */}
              {isAddingAsset && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="asset">Select Asset</Label>
                    <RouteAssetSelector
                      value={selectedAssetId}
                      onValueChange={setSelectedAssetId}
                      excludeAssetIds={assignedAssetIds}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes for this asset..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddAsset} disabled={!selectedAssetId}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Asset
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingAsset(false);
                        setSelectedAssetId(undefined);
                        setNotes("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!isAddingAsset && (
                <Button onClick={() => setIsAddingAsset(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              )}

              {/* Asset List */}
              {routeAssets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No assets assigned to this route yet
                </div>
              ) : (
                <div className="space-y-2">
                  {routeAssets.map((ra) => (
                    <div
                      key={ra.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{ra.sequence_order}</Badge>
                          <div>
                            <p className="font-medium">{ra.asset?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {ra.asset?.asset_number}
                            </p>
                            {ra.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {ra.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAsset(ra.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Route Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="mt-1">
                  {route.description || "No description provided"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <RouteAssignmentsList routeId={id!} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          <RouteForm
            route={route}
            onSubmit={handleUpdateRoute}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default RouteDetailPage;
