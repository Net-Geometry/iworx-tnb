import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, RotateCcw } from "lucide-react";
import { useDeviceMetrics } from "@/hooks/useDeviceMetrics";

interface MetricSelectorProps {
  deviceId: string;
  selectedMetrics: string[];
  selectedLorawanFields: string[];
  onMetricsChange: (metrics: string[]) => void;
  onLorawanFieldsChange: (fields: string[]) => void;
  onSave: () => void;
  isLoading?: boolean;
}

const LORAWAN_FIELDS = [
  { value: 'rssi', label: 'RSSI (Signal Strength)' },
  { value: 'snr', label: 'SNR (Signal-to-Noise Ratio)' },
  { value: 'spreading_factor', label: 'Spreading Factor' },
  { value: 'gateway_id', label: 'Gateway ID' },
  { value: 'gateway_location', label: 'Gateway Location' },
];

export const MetricSelector = ({
  deviceId,
  selectedMetrics,
  selectedLorawanFields,
  onMetricsChange,
  onLorawanFieldsChange,
  onSave,
  isLoading
}: MetricSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: availableMetrics = [], isLoading: metricsLoading } = useDeviceMetrics(deviceId);

  const filteredMetrics = availableMetrics.filter(metric =>
    metric.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMetricToggle = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      onMetricsChange(selectedMetrics.filter(m => m !== metric));
    } else {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  const handleLorawanFieldToggle = (field: string) => {
    if (selectedLorawanFields.includes(field)) {
      onLorawanFieldsChange(selectedLorawanFields.filter(f => f !== field));
    } else {
      onLorawanFieldsChange([...selectedLorawanFields, field]);
    }
  };

  const handleSelectAll = () => {
    onMetricsChange(availableMetrics);
  };

  const handleClearAll = () => {
    onMetricsChange([]);
    onLorawanFieldsChange([]);
  };

  const handleReset = () => {
    onMetricsChange([]);
    onLorawanFieldsChange(['rssi', 'snr']);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sensor Metrics</CardTitle>
          <CardDescription>
            Select which sensor data to display in the table
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={metricsLoading}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={metricsLoading}
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {metricsLoading ? (
              <div className="col-span-2 text-center text-muted-foreground py-4">
                Loading metrics...
              </div>
            ) : filteredMetrics.length === 0 ? (
              <div className="col-span-2 text-center text-muted-foreground py-4">
                No metrics found
              </div>
            ) : (
              filteredMetrics.map((metric) => (
                <div key={metric} className="flex items-center space-x-2">
                  <Checkbox
                    id={`metric-${metric}`}
                    checked={selectedMetrics.includes(metric)}
                    onCheckedChange={() => handleMetricToggle(metric)}
                  />
                  <Label
                    htmlFor={`metric-${metric}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {metric}
                  </Label>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Metadata</CardTitle>
          <CardDescription>
            Select LoRaWAN metadata fields to display
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LORAWAN_FIELDS.map((field) => (
              <div key={field.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`lorawan-${field.value}`}
                  checked={selectedLorawanFields.includes(field.value)}
                  onCheckedChange={() => handleLorawanFieldToggle(field.value)}
                />
                <Label
                  htmlFor={`lorawan-${field.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {field.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isLoading}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button
          onClick={onSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
};
