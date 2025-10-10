import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import { MetricSelector } from "./MetricSelector";
import { CustomizableIoTDataTable } from "./CustomizableIoTDataTable";
import { useDeviceDisplayPreferences } from "@/hooks/useDeviceDisplayPreferences";

interface IoTDeviceLiveDataTabProps {
  deviceId: string;
}

export const IoTDeviceLiveDataTab = ({ deviceId }: IoTDeviceLiveDataTabProps) => {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const { data: preferences, updatePreferences, isUpdating } = useDeviceDisplayPreferences(deviceId);

  const [tempSelectedMetrics, setTempSelectedMetrics] = useState<string[]>([]);
  const [tempSelectedLorawanFields, setTempSelectedLorawanFields] = useState<string[]>(['rssi', 'snr']);

  // Update temp state when preferences load
  useEffect(() => {
    if (preferences) {
      setTempSelectedMetrics(Array.isArray(preferences.selected_metrics) ? preferences.selected_metrics as string[] : []);
      setTempSelectedLorawanFields(Array.isArray(preferences.lorawan_fields) ? preferences.lorawan_fields as string[] : ['rssi', 'snr']);
    }
  }, [preferences]);

  const handleSave = () => {
    updatePreferences({
      selected_metrics: tempSelectedMetrics,
      lorawan_fields: tempSelectedLorawanFields,
      refresh_interval_seconds: preferences?.refresh_interval_seconds || 30,
      max_readings_shown: preferences?.max_readings_shown || 50,
    });
    setIsCustomizeOpen(false);
  };

  const displayedMetrics = Array.isArray(preferences?.selected_metrics) ? preferences.selected_metrics as string[] : [];
  const displayedLorawanFields = Array.isArray(preferences?.lorawan_fields) ? preferences.lorawan_fields as string[] : ['rssi', 'snr'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Live Sensor Data</h3>
          <p className="text-sm text-muted-foreground">
            Real-time data from device sensors (updates every 30 seconds)
          </p>
        </div>
        
        <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings2 className="h-4 w-4 mr-2" />
              Customize Display
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customize Data Display</DialogTitle>
              <DialogDescription>
                Choose which metrics and metadata fields to show in the data table
              </DialogDescription>
            </DialogHeader>
            
            <MetricSelector
              deviceId={deviceId}
              selectedMetrics={tempSelectedMetrics}
              selectedLorawanFields={tempSelectedLorawanFields}
              onMetricsChange={setTempSelectedMetrics}
              onLorawanFieldsChange={setTempSelectedLorawanFields}
              onSave={handleSave}
              isLoading={isUpdating}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CustomizableIoTDataTable
        deviceId={deviceId}
        selectedMetrics={displayedMetrics}
        selectedLorawanFields={displayedLorawanFields}
        maxReadings={preferences?.max_readings_shown || 50}
      />
    </div>
  );
};
