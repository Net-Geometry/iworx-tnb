import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useFilteredIoTData } from "@/hooks/useFilteredIoTData";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface CustomizableIoTDataTableProps {
  deviceId: string;
  selectedMetrics: string[];
  selectedLorawanFields: string[];
  maxReadings?: number;
}

interface LoRaWANMetadata {
  rssi?: number;
  snr?: number;
  spreading_factor?: number;
  gateway_id?: string;
  gateway_location?: { lat: number; lon: number };
  [key: string]: any;
}

export const CustomizableIoTDataTable = ({
  deviceId,
  selectedMetrics,
  selectedLorawanFields,
  maxReadings = 50
}: CustomizableIoTDataTableProps) => {
  const { data: iotData = [], isLoading, error } = useFilteredIoTData({
    deviceId,
    selectedMetrics: selectedMetrics.length > 0 ? selectedMetrics : undefined,
    lorawanFields: selectedLorawanFields,
    limit: maxReadings
  });

  const groupedData = useMemo(() => {
    const groups = new Map<string, any>();
    
    iotData.forEach((reading) => {
      const timestamp = reading.timestamp;
      if (!groups.has(timestamp)) {
        groups.set(timestamp, { timestamp, metrics: {}, lorawan: {} });
      }
      
      const group = groups.get(timestamp)!;
      group.metrics[reading.metric_name] = { value: reading.value, unit: reading.unit };
      
      const metadata = reading.lorawan_metadata as LoRaWANMetadata;
      selectedLorawanFields.forEach((field) => {
        if (metadata && (reading as any)[field] !== undefined) {
          group.lorawan[field] = (reading as any)[field];
        }
      });
    });
    
    return Array.from(groups.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [iotData, selectedLorawanFields]);

  const columns = useMemo(() => {
    const cols = ['Timestamp'];
    if (selectedMetrics.length > 0) {
      cols.push(...selectedMetrics);
    } else {
      const allMetrics = new Set<string>();
      iotData.forEach(reading => allMetrics.add(reading.metric_name));
      cols.push(...Array.from(allMetrics));
    }
    selectedLorawanFields.forEach((field) => {
      const label = field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      cols.push(label);
    });
    return cols;
  }, [selectedMetrics, selectedLorawanFields, iotData]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 border border-destructive/50 rounded-lg bg-destructive/5">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-sm text-destructive">Failed to load device data</p>
        </div>
      </div>
    );
  }

  if (groupedData.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No sensor data received yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => <TableHead key={col} className="whitespace-nowrap">{col}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData.map((row, index) => (
              <TableRow key={`${row.timestamp}-${index}`}>
                <TableCell className="font-mono text-sm whitespace-nowrap">
                  {formatDistanceToNow(new Date(row.timestamp), { addSuffix: true })}
                </TableCell>
                {(selectedMetrics.length > 0 ? selectedMetrics : Object.keys(row.metrics)).map((metric) => (
                  <TableCell key={metric}>
                    {row.metrics[metric] ? (
                      <div className="flex items-center gap-1">
                        <span>{row.metrics[metric].value}</span>
                        {row.metrics[metric].unit && <Badge variant="secondary" className="text-xs">{row.metrics[metric].unit}</Badge>}
                      </div>
                    ) : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                ))}
                {selectedLorawanFields.map((field) => (
                  <TableCell key={field}>
                    {row.lorawan[field] !== undefined ? (
                      typeof row.lorawan[field] === 'object' ? (
                        <span className="text-xs font-mono">{JSON.stringify(row.lorawan[field])}</span>
                      ) : <span>{row.lorawan[field]}</span>
                    ) : <span className="text-muted-foreground">N/A</span>}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
