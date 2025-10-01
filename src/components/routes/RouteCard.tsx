import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Route, Clock, MapPin, Edit, Trash2 } from "lucide-react";
import { MaintenanceRoute } from "@/hooks/useMaintenanceRoutes";

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
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3" onClick={() => onView(route.id)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
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
          <div className="flex gap-2">
            <Badge className={getStatusColor(route.status)}>
              {route.status || "active"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent onClick={() => onView(route.id)}>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {route.description || "No description provided"}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={getTypeColor(route.route_type)}>
            {route.route_type || "maintenance"}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <MapPin className="h-3 w-3" />
            {route.asset_count || 0} Assets
          </Badge>
          {route.estimated_duration_hours && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {route.estimated_duration_hours}h
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(route)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(route.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
