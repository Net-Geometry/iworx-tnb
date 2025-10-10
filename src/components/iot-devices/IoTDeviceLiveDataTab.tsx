import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings2, Globe, Star } from "lucide-react";
import { MetricSelector } from "./MetricSelector";
import { CustomizableIoTDataTable } from "./CustomizableIoTDataTable";
import { useDeviceDisplayPreferences } from "@/hooks/useDeviceDisplayPreferences";
import { useGlobalDevicePreferences } from "@/hooks/useGlobalDevicePreferences";
import { useCurrentUserRoles } from "@/hooks/useCurrentUserRoles";

interface IoTDeviceLiveDataTabProps {
  deviceId: string;
}

export const IoTDeviceLiveDataTab = ({ deviceId }: IoTDeviceLiveDataTabProps) => {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const { data: preferences, updatePreferences, isUpdating } = useDeviceDisplayPreferences(deviceId);
  const { updateGlobalPreferences, isUpdating: isUpdatingGlobal } = useGlobalDevicePreferences(deviceId);
  const { roles } = useCurrentUserRoles();

  const [tempSelectedMetrics, setTempSelectedMetrics] = useState<string[]>([]);
  const [tempSelectedLorawanFields, setTempSelectedLorawanFields] = useState<string[]>(['rssi', 'snr']);
  
  const isAdmin = roles.some(role => role.role_name === 'admin' || role.role_name === 'superadmin');

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

  const handleSaveAsGlobal = () => {
    updateGlobalPreferences({
      selected_metrics: tempSelectedMetrics,
      lorawan_fields: tempSelectedLorawanFields,
      refresh_interval_seconds: preferences?.refresh_interval_seconds || 30,
      max_readings_shown: preferences?.max_readings_shown || 50,
    });
    setIsCustomizeOpen(false);
  };

  const getSourceIndicator = () => {
    if (!preferences?._source) return null;
    
    switch (preferences._source) {
      case 'user':
        return null; // No badge for personal preferences
      case 'global':
        return <Badge variant="outline" className="ml-2"><Globe className="h-3 w-3 mr-1" />Using Global</Badge>;
      case 'device_type':
        return <Badge variant="outline" className="ml-2"><Star className="h-3 w-3 mr-1" />Device Type</Badge>;
      case 'system':
        return <Badge variant="secondary" className="ml-2">System Default</Badge>;
      default:
        return null;
    }
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
            <Button variant="outline" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Customize Display
              {getSourceIndicator()}
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
              onSaveAsGlobal={isAdmin ? handleSaveAsGlobal : undefined}
              isLoading={isUpdating || isUpdatingGlobal}
              preferenceSource={preferences?._source}
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
