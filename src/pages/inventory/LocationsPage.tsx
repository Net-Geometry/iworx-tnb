import { MapPin, Plus, Building, Warehouse, Archive } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const LocationsPage = () => {
  // Mock data for demonstration
  const locations = [
    {
      id: "1",
      name: "Main Warehouse",
      code: "WH-A",
      type: "warehouse",
      address: "123 Industrial Blvd, Manufacturing District",
      capacity: 10000,
      utilization: 7500,
      itemCount: 145,
      isActive: true,
      parentLocation: null
    },
    {
      id: "2", 
      name: "Storage Room B",
      code: "ST-B",
      type: "storage",
      address: "Building 2, Floor 1",
      capacity: 2000,
      utilization: 1200,
      itemCount: 68,
      isActive: true,
      parentLocation: "Main Warehouse"
    },
    {
      id: "3",
      name: "Tool Crib",
      code: "TC-01",
      type: "storage",
      address: "Workshop Area, Section C",
      capacity: 500,
      utilization: 450,
      itemCount: 89,
      isActive: true,
      parentLocation: null
    },
    {
      id: "4",
      name: "Outdoor Storage",
      code: "OUT-01", 
      type: "warehouse",
      address: "Yard Area, East Side",
      capacity: 5000,
      utilization: 2100,
      itemCount: 23,
      isActive: true,
      parentLocation: null
    },
    {
      id: "5",
      name: "Archive Storage",
      code: "AR-01",
      type: "storage", 
      address: "Building 3, Basement",
      capacity: 1500,
      utilization: 300,
      itemCount: 45,
      isActive: false,
      parentLocation: null
    }
  ];

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "warehouse":
        return <Warehouse className="w-4 h-4" />;
      case "storage":
        return <Building className="w-4 h-4" />;
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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Location
        </Button>
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
              {locations.filter(l => l.isActive).length} active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.reduce((sum, loc) => sum + loc.capacity, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">sq ft total space</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((locations.reduce((sum, loc) => sum + loc.utilization, 0) / 
                locations.reduce((sum, loc) => sum + loc.capacity, 0)) * 100)}%
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
              {locations.reduce((sum, loc) => sum + loc.itemCount, 0)}
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
                {locations.map((location) => {
                  const utilizationPercentage = (location.utilization / location.capacity) * 100;
                  return (
                    <TableRow key={location.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLocationIcon(location.type)}
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-muted-foreground">{location.code}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{location.type}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate" title={location.address}>
                          {location.address}
                        </div>
                      </TableCell>
                      <TableCell>{location.capacity.toLocaleString()} sq ft</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className={getUtilizationColor(utilizationPercentage)}>
                              {Math.round(utilizationPercentage)}%
                            </span>
                            <span className="text-muted-foreground">
                              {location.utilization.toLocaleString()} / {location.capacity.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={utilizationPercentage} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell>{location.itemCount}</TableCell>
                      <TableCell>
                        <Badge variant={location.isActive ? "default" : "secondary"}>
                          {location.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">View Items</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
            {locations.filter(loc => !loc.parentLocation).map((parent) => (
              <div key={parent.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getLocationIcon(parent.type)}
                    <div>
                      <div className="font-medium">{parent.name}</div>
                      <div className="text-sm text-muted-foreground">{parent.code}</div>
                    </div>
                  </div>
                  <Badge variant={parent.isActive ? "default" : "secondary"}>
                    {parent.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                {/* Show child locations */}
                {locations.filter(child => child.parentLocation === parent.name).map((child) => (
                  <div key={child.id} className="ml-8 mt-3 flex items-center justify-between border-l-2 border-border pl-4">
                    <div className="flex items-center gap-3">
                      {getLocationIcon(child.type)}
                      <div>
                        <div className="font-medium">{child.name}</div>
                        <div className="text-sm text-muted-foreground">{child.code}</div>
                      </div>
                    </div>
                    <Badge variant={child.isActive ? "default" : "secondary"}>
                      {child.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationsPage;