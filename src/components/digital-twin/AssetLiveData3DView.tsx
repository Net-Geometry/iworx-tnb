/**
 * Asset Live Data 3D View Component
 * 
 * Main component for Live IoT Data tab with 3D visualization
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DigitalTwinCanvas } from './DigitalTwinCanvas';
import { AssetSearchDropdown } from './AssetSearchDropdown';
import { CustomizableAssetDataTable } from './CustomizableAssetDataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AssetMetricSelector } from './AssetMetricSelector';
import { useAssetDisplayPreferences } from '@/hooks/useAssetDisplayPreferences';
import { useAssetSensorTypes } from '@/hooks/useAssetSensorTypes';
import { useCurrentUserRoles } from '@/hooks/useCurrentUserRoles';
import { useGlobalAssetPreferences } from '@/hooks/useGlobalAssetPreferences';
import { Badge } from '@/components/ui/badge';
import { Settings2, Wifi, WifiOff } from 'lucide-react';
import { useRealtimeIoTData } from '@/hooks/useRealtimeIoTData';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AssetLiveData3DViewProps {
  selectedAssetId?: string | null;
  onAssetChange?: (assetId: string) => void;
}

export function AssetLiveData3DView({ 
  selectedAssetId, 
  onAssetChange 
}: AssetLiveData3DViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempSelectedSensorTypes, setTempSelectedSensorTypes] = useState<string[]>([]);
  const [saveAsGlobal, setSaveAsGlobal] = useState(false);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);

  const { data: sensorTypes = [] } = useAssetSensorTypes(selectedAssetId);
  const { preferences, isLoading, savePreferences, isSaving } = useAssetDisplayPreferences(selectedAssetId);
  const { saveGlobalDefaults } = useGlobalAssetPreferences(selectedAssetId);
  const { roles } = useCurrentUserRoles();
  const { isConnected } = useRealtimeIoTData(selectedAssetId ? [selectedAssetId] : []);

  const isAdmin = roles.some(r => r.role_name === 'admin');
  const preferenceSource = preferences?.user_id ? 'user' : 'global';

  const handleDialogOpen = () => {
    const currentPrefs = preferences?.selected_sensor_types;
    const prefsArray = Array.isArray(currentPrefs) ? currentPrefs : [];
    setTempSelectedSensorTypes(prefsArray);
    setSaveAsGlobal(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedAssetId) return;

    try {
      if (saveAsGlobal && isAdmin) {
        await saveGlobalDefaults({
          selected_sensor_types: tempSelectedSensorTypes,
        });
        toast.success('Global preferences saved for all users');
      } else {
        await savePreferences({
          selected_sensor_types: tempSelectedSensorTypes,
        });
        toast.success('Your preferences saved');
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const handleSensorClick = (sensorId: string) => {
    setSelectedSensorId(sensorId === selectedSensorId ? null : sensorId);
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <AssetSearchDropdown
            value={selectedAssetId || ""}
            onValueChange={(assetId) => onAssetChange?.(assetId || '')}
          />
        </div>
        
        {selectedAssetId && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Offline</span>
                </>
              )}
            </div>
            
            {preferenceSource === 'user' && (
              <Badge variant="secondary">Your Settings</Badge>
            )}
            {preferenceSource === 'global' && (
              <Badge variant="outline">Global Default</Badge>
            )}
            
            <Button onClick={handleDialogOpen} variant="outline" size="sm">
              <Settings2 className="w-4 h-4 mr-2" />
              Customize Display
            </Button>
          </div>
        )}
      </div>

      {selectedAssetId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Canvas - 2/3 width */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <DigitalTwinCanvas
                  selectedAssetId={selectedAssetId}
                  showIoTOverlays={true}
                  selectedSensorTypes={Array.isArray(preferences?.selected_sensor_types) ? preferences.selected_sensor_types : []}
                  onSensorClick={handleSensorClick}
                  selectedSensorId={selectedSensorId}
                />
              </CardContent>
            </Card>
          </div>

          {/* Data Table - 1/3 width */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Live Sensor Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomizableAssetDataTable
                  assetId={selectedAssetId}
                  selectedSensorTypes={Array.isArray(preferences?.selected_sensor_types) ? preferences.selected_sensor_types : []}
                  maxReadings={preferences?.max_readings_shown || 50}
                  onRowClick={handleSensorClick}
                  selectedSensorId={selectedSensorId}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-[500px]">
            <div className="text-center text-muted-foreground">
              <Settings2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select an asset to view live IoT data in 3D</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customize Display Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customize Sensor Display</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <AssetMetricSelector
            availableSensorTypes={sensorTypes}
            selectedSensorTypes={tempSelectedSensorTypes}
            onSelectionChange={setTempSelectedSensorTypes}
          />

            {isAdmin && (
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Checkbox
                  id="save-global"
                  checked={saveAsGlobal}
                  onCheckedChange={(checked) => setSaveAsGlobal(checked === true)}
                />
                <Label htmlFor="save-global" className="cursor-pointer">
                  Save as global default for all users
                </Label>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {tempSelectedSensorTypes.length} of {sensorTypes.length} sensor types selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
