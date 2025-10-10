import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetMetricSelector } from "./AssetMetricSelector";
import { CustomizableAssetDataTable } from "./CustomizableAssetDataTable";
import { useAssetDisplayPreferences } from "@/hooks/useAssetDisplayPreferences";
import { useAssetSensorTypes } from "@/hooks/useAssetSensorTypes";
import { useGlobalAssetPreferences } from "@/hooks/useGlobalAssetPreferences";
import { useRealtimeIoTData } from "@/hooks/useRealtimeIoTData";
import { useCurrentUserRoles } from "@/hooks/useCurrentUserRoles";

interface AssetLiveDataPanelProps {
  assetId: string | null;
  assetName?: string;
}

/**
 * Full-featured component for displaying live asset sensor data
 * with customizable metrics selection
 */
export function AssetLiveDataPanel({ assetId, assetName }: AssetLiveDataPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempSelectedSensorTypes, setTempSelectedSensorTypes] = useState<string[]>([]);
  const [saveAsGlobal, setSaveAsGlobal] = useState(false);

  const { preferences, isLoading: prefsLoading, savePreferences, isSaving } = useAssetDisplayPreferences(assetId);
  const { data: availableSensorTypes = [], isLoading: typesLoading } = useAssetSensorTypes(assetId);
  const { saveGlobalDefaults, isSaving: isSavingGlobal } = useGlobalAssetPreferences(assetId);
  const { readings: readingsMap, isConnected } = useRealtimeIoTData(assetId ? [assetId] : []);
  const { roles } = useCurrentUserRoles();
  
  // Check if user has admin role
  const isAdmin = roles.some(role => role.role_name === 'admin');

  // Initialize temp state when dialog opens
  const handleDialogOpen = (open: boolean) => {
    if (open) {
      const selectedTypes = Array.isArray(preferences?.selected_sensor_types) 
        ? preferences.selected_sensor_types 
        : [];
      setTempSelectedSensorTypes(selectedTypes);
      setSaveAsGlobal(false);
    }
    setDialogOpen(open);
  };

  const handleSave = () => {
    if (saveAsGlobal && isAdmin) {
      saveGlobalDefaults({
        selected_sensor_types: tempSelectedSensorTypes,
        refresh_interval_seconds: preferences?.refresh_interval_seconds,
        max_readings_shown: preferences?.max_readings_shown,
      });
    } else {
      savePreferences({
        selected_sensor_types: tempSelectedSensorTypes,
        refresh_interval_seconds: preferences?.refresh_interval_seconds,
        max_readings_shown: preferences?.max_readings_shown,
        is_global_default: saveAsGlobal,
      });
    }
    setDialogOpen(false);
  };

  const getPreferenceSourceBadge = () => {
    if (!preferences?.source) return null;

    const badges = {
      user: <Badge variant="default">Your Preferences</Badge>,
      global: <Badge variant="secondary">Global Default</Badge>,
      system: <Badge variant="outline">System Default</Badge>,
    };

    return badges[preferences.source];
  };

  if (!assetId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Select an asset to view live sensor data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Customize Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Live Sensor Data</h3>
          {assetName && (
            <p className="text-sm text-muted-foreground">{assetName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getPreferenceSourceBadge()}
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "● Live" : "○ Disconnected"}
          </Badge>
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Customize Display
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Customize Sensor Display</DialogTitle>
                <DialogDescription>
                  Select which sensor types to display in the live data view
                </DialogDescription>
              </DialogHeader>

              {typesLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading available sensors...
                </div>
              ) : (
                <AssetMetricSelector
                  availableSensorTypes={availableSensorTypes}
                  selectedSensorTypes={tempSelectedSensorTypes}
                  onSelectionChange={setTempSelectedSensorTypes}
                  showSaveAsGlobal={isAdmin}
                  onSaveAsGlobal={setSaveAsGlobal}
                />
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving || isSavingGlobal}>
                  {isSaving || isSavingGlobal ? "Saving..." : "Save Preferences"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Live Data Table */}
      {prefsLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading preferences...</p>
          </CardContent>
        </Card>
      ) : (
        <CustomizableAssetDataTable
          readings={assetId ? (readingsMap[assetId] || []) : []}
          selectedSensorTypes={Array.isArray(preferences?.selected_sensor_types) ? preferences.selected_sensor_types : []}
          maxReadings={preferences?.max_readings_shown || 50}
          isLoading={false}
        />
      )}

      {/* Info Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {!Array.isArray(preferences?.selected_sensor_types) || preferences.selected_sensor_types.length === 0
            ? "Showing all sensor types"
            : `Showing ${preferences.selected_sensor_types.length} selected sensor types`}
        </span>
        <span>
          Max {preferences?.max_readings_shown || 50} readings
        </span>
      </div>
    </div>
  );
}
