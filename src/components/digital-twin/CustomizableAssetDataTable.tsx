import { useMemo } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface AssetSensorReading {
  id: string;
  asset_id: string;
  sensor_type: string;
  reading_value: number;
  unit: string;
  timestamp: string;
  alert_threshold_exceeded: boolean;
  metadata?: any;
}

interface CustomizableAssetDataTableProps {
  readings: AssetSensorReading[];
  selectedSensorTypes: string[];
  maxReadings: number;
  isLoading?: boolean;
}

/**
 * Displays asset sensor readings in a table format
 * Filters by selected sensor types and respects max readings limit
 */
export function CustomizableAssetDataTable({
  readings,
  selectedSensorTypes,
  maxReadings,
  isLoading,
}: CustomizableAssetDataTableProps) {
  // Filter and limit readings
  const filteredReadings = useMemo(() => {
    let filtered = readings;

    // Filter by selected sensor types (empty array means show all)
    if (selectedSensorTypes.length > 0) {
      filtered = filtered.filter((reading) =>
        selectedSensorTypes.includes(reading.sensor_type)
      );
    }

    // Sort by timestamp descending and limit
    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxReadings);
  }, [readings, selectedSensorTypes, maxReadings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Loading sensor data...</div>
      </div>
    );
  }

  if (filteredReadings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-2">
        <p className="text-sm text-muted-foreground">No sensor data available</p>
        {selectedSensorTypes.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Try selecting different sensor types
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Sensor Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReadings.map((reading) => (
            <TableRow key={reading.id}>
              <TableCell className="font-mono text-xs">
                {format(new Date(reading.timestamp), "MMM dd, HH:mm:ss")}
              </TableCell>
              <TableCell>
                <span className="font-medium">{reading.sensor_type}</span>
              </TableCell>
              <TableCell>
                <span className="font-mono">
                  {typeof reading.reading_value === "number"
                    ? reading.reading_value.toFixed(2)
                    : reading.reading_value}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">{reading.unit || "-"}</span>
              </TableCell>
              <TableCell>
                {reading.alert_threshold_exceeded ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Alert
                  </Badge>
                ) : (
                  <Badge variant="outline">Normal</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredReadings.length >= maxReadings && (
        <div className="p-3 text-center text-xs text-muted-foreground border-t">
          Showing latest {maxReadings} readings
        </div>
      )}
    </div>
  );
}
