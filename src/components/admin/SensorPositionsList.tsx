/**
 * List of sensors with their positions and actions
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MapPin } from "lucide-react";
import { SensorPosition } from "@/types/sensor-positions";

interface SensorPositionsListProps {
  sensors: SensorPosition[];
  onEdit: (sensor: SensorPosition) => void;
  onDelete: (sensorId: string) => void;
  onFocus: (sensor: SensorPosition) => void;
}

export function SensorPositionsList({
  sensors,
  onEdit,
  onDelete,
  onFocus,
}: SensorPositionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configured Sensors</CardTitle>
        <CardDescription>
          {sensors.length} sensor{sensors.length !== 1 ? 's' : ''} configured on this asset
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sensors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sensors configured yet. Enable Edit Mode to add sensors.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Position (X, Y, Z)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sensors.map((sensor) => (
                  <TableRow key={sensor.id}>
                    <TableCell className="font-medium">
                      {sensor.deviceName || sensor.label}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sensor.sensorType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      ({sensor.position[0].toFixed(1)}, {sensor.position[1].toFixed(1)}, {sensor.position[2].toFixed(1)})
                    </TableCell>
                    <TableCell>
                      <Badge variant={sensor.isActive ? "default" : "secondary"}>
                        {sensor.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFocus(sensor)}
                          title="Focus camera"
                        >
                          <MapPin className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(sensor)}
                          title="Edit position"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(sensor.id)}
                          title="Remove position"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
