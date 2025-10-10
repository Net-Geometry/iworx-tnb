import { useState, useMemo } from "react";
import { Search, CheckCircle2, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface AssetMetricSelectorProps {
  availableSensorTypes: string[];
  selectedSensorTypes: string[];
  onSelectionChange: (selected: string[]) => void;
  showSaveAsGlobal?: boolean;
  onSaveAsGlobal?: (saveAsGlobal: boolean) => void;
}

/**
 * Component for selecting which sensor types to display for an asset
 * Similar to MetricSelector but simplified for assets (no LoRaWAN fields)
 */
export function AssetMetricSelector({
  availableSensorTypes,
  selectedSensorTypes,
  onSelectionChange,
  showSaveAsGlobal = false,
  onSaveAsGlobal,
}: AssetMetricSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [saveAsGlobal, setSaveAsGlobal] = useState(false);

  const filteredSensorTypes = useMemo(() => {
    return availableSensorTypes.filter((type) =>
      type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableSensorTypes, searchTerm]);

  const toggleSensorType = (sensorType: string) => {
    const newSelection = selectedSensorTypes.includes(sensorType)
      ? selectedSensorTypes.filter((t) => t !== sensorType)
      : [...selectedSensorTypes, sensorType];
    onSelectionChange(newSelection);
  };

  const selectAll = () => {
    onSelectionChange([...availableSensorTypes]);
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const handleSaveAsGlobalChange = (checked: boolean) => {
    setSaveAsGlobal(checked);
    onSaveAsGlobal?.(checked);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sensor types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={selectAll}>
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      {/* Sensor Types List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Sensor Types ({selectedSensorTypes.length}/{availableSensorTypes.length})
          </p>
        </div>

        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-2">
            {filteredSensorTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {searchTerm ? "No sensor types match your search" : "No sensor types available"}
              </p>
            ) : (
              filteredSensorTypes.map((sensorType) => (
                <div
                  key={sensorType}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => toggleSensorType(sensorType)}
                >
                  {selectedSensorTypes.includes(sensorType) ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">{sensorType}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Admin: Save as Global Default */}
      {showSaveAsGlobal && (
        <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
          <Checkbox
            id="save-as-global"
            checked={saveAsGlobal}
            onCheckedChange={handleSaveAsGlobalChange}
          />
          <label
            htmlFor="save-as-global"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Save as default for all users
          </label>
        </div>
      )}
    </div>
  );
}
