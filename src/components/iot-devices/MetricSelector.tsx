import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, Globe, Star } from "lucide-react";
import { useDeviceMetrics } from "@/hooks/useDeviceMetrics";
import { useCurrentUserRoles } from "@/hooks/useCurrentUserRoles";

interface MetricSelectorProps {
  deviceId: string;
  selectedMetrics: string[];
  selectedLorawanFields: string[];
  onMetricsChange: (metrics: string[]) => void;
  onLorawanFieldsChange: (fields: string[]) => void;
  onSave: () => void;
  onSaveAsGlobal?: () => void;
  isLoading?: boolean;
  preferenceSource?: 'user' | 'global' | 'device_type' | 'system';
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
  onSaveAsGlobal,
  isLoading,
  preferenceSource = 'system'
}: MetricSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [saveAsGlobal, setSaveAsGlobal] = useState(false);
  const { data: availableMetrics = [], isLoading: metricsLoading } = useDeviceMetrics(deviceId);
  const { roles } = useCurrentUserRoles();
  
  const isAdmin = roles.some(role => role.role_name === 'admin' || role.role_name === 'superadmin');

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

  const handleSaveClick = () => {
    if (saveAsGlobal && onSaveAsGlobal) {
      onSaveAsGlobal();
    } else {
      onSave();
    }
  };

  const getSourceBadge = () => {
    switch (preferenceSource) {
      case 'user':
        return <Badge variant="secondary">Your Preferences</Badge>;
      case 'global':
        return <Badge variant="outline"><Globe className="h-3 w-3 mr-1" />Global Default</Badge>;
      case 'device_type':
        return <Badge variant="outline"><Star className="h-3 w-3 mr-1" />Device Type Default</Badge>;
      default:
        return <Badge variant="outline">System Default</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Currently using: {getSourceBadge()}
        </div>
      </div>

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

      {isAdmin && onSaveAsGlobal && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="save-as-global"
                checked={saveAsGlobal}
                onCheckedChange={(checked) => setSaveAsGlobal(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="save-as-global"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Save as default for all users
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, these preferences will become the default for all users viewing this device
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          onClick={handleSaveClick}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : saveAsGlobal ? "Save Global Default" : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
};
