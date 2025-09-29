import { MapPin, Building, Warehouse, Archive, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddLocationDialog } from "@/components/inventory/AddLocationDialog";
import { useInventoryLocationWithItems } from "@/hooks/useInventoryLocations";

const LocationsPage = () => {
  const { data: locations = [], isLoading, refetch } = useInventoryLocationWithItems();

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "warehouse":
        return <Warehouse className="w-4 h-4" />;
      case "storage":
        return <Building className="w-4 h-4" />;
      case "bin":
      case "zone":
      case "aisle":
      case "shelf":
        return <Package className="w-4 h-4" />;
      case "archive":
        return <Archive className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "text-destructive";
    if (percentage >= 75) return "text-warning";
    return "text-success";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Locations</h1>
            <p className="text-muted-foreground">Manage warehouses, storage areas, and inventory locations</p>
          </div>
        </div>
        <AddLocationDialog onLocationAdded={() => refetch()} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <div className="text-xs text-muted-foreground">
              {locations.filter(l => l.is_active).length} active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.reduce((sum, loc) => sum + (loc.capacity_limit || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">total capacity</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.length > 0 ? Math.round((locations.reduce((sum, loc) => sum + (loc.current_utilization || 0), 0) / 
                Math.max(locations.reduce((sum, loc) => sum + (loc.capacity_limit || 0), 0), 1)) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">across all locations</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.reduce((sum, loc) => sum + (loc.itemCount || 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground">items stored</div>
          </CardContent>
        </Card>
      </div>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Locations</CardTitle>
          <CardDescription>Overview of all inventory storage locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading locations...
                    </TableCell>
                  </TableRow>
                ) : locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No locations found. Add your first location to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((location) => {
                    const utilizationPercentage = location.utilizationPercentage || 0;
                    return (
                      <TableRow key={location.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getLocationIcon(location.location_type)}
                            <div>
                              <div className="font-medium">{location.name}</div>
                              <div className="text-sm text-muted-foreground">{location.code || 'No code'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{location.location_type.replace('_', ' ')}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate" title={location.address || 'No address'}>
                            {location.address || 'No address'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {location.capacity_limit ? `${location.capacity_limit.toLocaleString()} units` : 'Not set'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className={getUtilizationColor(utilizationPercentage)}>
                                {utilizationPercentage}%
                              </span>
                              <span className="text-muted-foreground">
                                {(location.current_utilization || 0).toLocaleString()} / {(location.capacity_limit || 0).toLocaleString()}
                              </span>
                            </div>
                            <Progress value={utilizationPercentage} className="h-1" />
                          </div>
                        </TableCell>
                        <TableCell>{location.itemCount || 0}</TableCell>
                        <TableCell>
                          <Badge variant={location.is_active ? "default" : "secondary"}>
                            {location.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Badge variant="outline" className="text-xs">Edit</Badge>
                            <Badge variant="outline" className="text-xs">View Items</Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Location Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle>Location Hierarchy</CardTitle>
          <CardDescription>Organizational structure of storage locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations.filter(loc => !loc.parent_location_id).map((parent) => (
              <div key={parent.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getLocationIcon(parent.location_type)}
                    <div>
                      <div className="font-medium">{parent.name}</div>
                      <div className="text-sm text-muted-foreground">{parent.code || 'No code'}</div>
                    </div>
                  </div>
                  <Badge variant={parent.is_active ? "default" : "secondary"}>
                    {parent.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                {/* Show child locations */}
                {locations.filter(child => child.parent_location_id === parent.id).map((child) => (
                  <div key={child.id} className="ml-8 mt-3 flex items-center justify-between border-l-2 border-border pl-4">
                    <div className="flex items-center gap-3">
                      {getLocationIcon(child.location_type)}
                      <div>
                        <div className="font-medium">{child.name}</div>
                        <div className="text-sm text-muted-foreground">{child.code || 'No code'}</div>
                      </div>
                    </div>
                    <Badge variant={child.is_active ? "default" : "secondary"}>
                      {child.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            ))}
            {locations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No locations found. Add your first location to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationsPage;