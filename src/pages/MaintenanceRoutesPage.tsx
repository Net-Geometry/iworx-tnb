import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { RouteKPICards } from "@/components/routes/RouteKPICards";
import { RouteCard } from "@/components/routes/RouteCard";
import { RouteForm } from "@/components/routes/RouteForm";
import {
  useMaintenanceRoutes,
  MaintenanceRoute,
} from "@/hooks/useMaintenanceRoutes";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Main page for managing maintenance routes
 * Lists all routes with search, filter, and CRUD operations
 */

const MaintenanceRoutesPage = () => {
  const navigate = useNavigate();
  const { routes, isLoading, createRoute, updateRoute, deleteRoute } =
    useMaintenanceRoutes();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<MaintenanceRoute | null>(
    null
  );
  const [deleteRouteId, setDeleteRouteId] = useState<string | null>(null);

  // Filter routes based on search
  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.route_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate KPIs
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter((r) => r.status === "active").length;
  const totalAssets = routes.reduce((sum, r) => sum + (r.asset_count || 0), 0);
  const avgDuration =
    routes.reduce((sum, r) => sum + (r.estimated_duration_hours || 0), 0) /
      (routes.length || 1);

  const handleCreateRoute = (data: any) => {
    createRoute(data);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateRoute = (data: any) => {
    if (selectedRoute) {
      updateRoute({ id: selectedRoute.id, updates: data });
      setIsEditDialogOpen(false);
      setSelectedRoute(null);
    }
  };

  const handleDeleteRoute = () => {
    if (deleteRouteId) {
      deleteRoute(deleteRouteId);
      setDeleteRouteId(null);
    }
  };

  const handleEditRoute = (route: MaintenanceRoute) => {
    setSelectedRoute(route);
    setIsEditDialogOpen(true);
  };

  const handleViewRoute = (id: string) => {
    navigate(`/routes/${id}`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Routes</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize asset maintenance routes
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Route
        </Button>
      </div>

      {/* KPI Cards */}
      <RouteKPICards
        totalRoutes={totalRoutes}
        activeRoutes={activeRoutes}
        totalAssets={totalAssets}
        avgDuration={avgDuration}
      />

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Routes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No routes found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Route
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onEdit={handleEditRoute}
              onDelete={(id) => setDeleteRouteId(id)}
              onView={handleViewRoute}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Route</DialogTitle>
          </DialogHeader>
          <RouteForm
            onSubmit={handleCreateRoute}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          {selectedRoute && (
            <RouteForm
              route={selectedRoute}
              onSubmit={handleUpdateRoute}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedRoute(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteRouteId}
        onOpenChange={() => setDeleteRouteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this route? This action cannot be
              undone and will also remove all asset assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoute}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MaintenanceRoutesPage;
