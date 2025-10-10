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
import { useRealtimeIoTData } from "@/hooks/useRealtimeIoTData";
import { Loader2 } from "lucide-react";

interface CustomizableAssetDataTableProps {
  assetId: string;
  selectedSensorTypes: string[];
  maxReadings: number;
  onRowClick?: (sensorId: string) => void;
  selectedSensorId?: string | null;
}

/**
 * Displays asset sensor readings in a table format
 * Filters by selected sensor types and respects max readings limit
 */
export function CustomizableAssetDataTable({
  assetId,
  selectedSensorTypes,
  maxReadings,
  onRowClick,
  selectedSensorId,
}: CustomizableAssetDataTableProps) {
  const { readings, isConnected } = useRealtimeIoTData([assetId]);
  const assetReadings = readings[assetId] || [];
  
  // Filter and limit readings
  const filteredReadings = useMemo(() => {
    let filtered = assetReadings;

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
  }, [assetReadings, selectedSensorTypes, maxReadings]);

  if (!isConnected && assetReadings.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
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
            <TableRow 
              key={reading.id}
              className={reading.id === selectedSensorId ? "bg-muted" : "cursor-pointer hover:bg-muted/50"}
              onClick={() => onRowClick?.(reading.id)}
            >
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
