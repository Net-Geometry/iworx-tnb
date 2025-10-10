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
import { Settings2, Wifi, WifiOff, Play, Pause, Maximize2, PanelRightOpen, Table2 } from 'lucide-react';
import { useRealtimeIoTData } from '@/hooks/useRealtimeIoTData';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LiveDataBottomPanel } from './LiveDataBottomPanel';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AssetLiveData3DViewProps {
  selectedAssetId?: string | null;
  onAssetChange?: (assetId: string) => void;
}

type ViewMode = 'full' | 'split' | 'table';

export function AssetLiveData3DView({ 
  selectedAssetId, 
  onAssetChange 
}: AssetLiveData3DViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempSelectedSensorTypes, setTempSelectedSensorTypes] = useState<string[]>([]);
  const [saveAsGlobal, setSaveAsGlobal] = useState(false);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [isLivePaused, setIsLivePaused] = useState(false);

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

  const getViewModeIcon = () => {
    switch (viewMode) {
      case 'full': return <Maximize2 className="w-4 h-4" />;
      case 'split': return <PanelRightOpen className="w-4 h-4" />;
      case 'table': return <Table2 className="w-4 h-4" />;
    }
  };

  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'full': return 'Full 3D';
      case 'split': return 'Split View';
      case 'table': return 'Table Only';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <AssetSearchDropdown
            value={selectedAssetId || ""}
            onValueChange={(assetId) => onAssetChange?.(assetId || '')}
          />
        </div>
        
        {selectedAssetId && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Status Badge */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm",
              isConnected 
                ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400" 
                : "bg-muted border-border"
            )}>
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium">LIVE</span>
                  <Wifi className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Pause/Resume Button */}
            {isConnected && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsLivePaused(!isLivePaused)}
              >
                {isLivePaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
            )}

            {/* View Mode Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {getViewModeIcon()}
                  <span className="ml-2">{getViewModeLabel()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('full')}>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Full 3D View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('split')}>
                  <PanelRightOpen className="w-4 h-4 mr-2" />
                  Split View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('table')}>
                  <Table2 className="w-4 h-4 mr-2" />
                  Table Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Preference Source Badge */}
            {preferenceSource === 'user' && (
              <Badge variant="secondary" className="text-xs">Your Settings</Badge>
            )}
            {preferenceSource === 'global' && (
              <Badge variant="outline" className="text-xs">Global Default</Badge>
            )}
            
            {/* Customize Button */}
            <Button onClick={handleDialogOpen} variant="outline" size="sm">
              <Settings2 className="w-4 h-4 mr-2" />
              Customize
            </Button>
          </div>
        )}
      </div>

      {selectedAssetId ? (
        <>
          {/* Full 3D View Mode */}
          {viewMode === 'full' && (
            <div className="space-y-4">
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

              {/* Bottom Info Panel */}
              <LiveDataBottomPanel 
                assetId={selectedAssetId}
                sensorTypes={
                  Array.isArray(preferences?.selected_sensor_types) && preferences.selected_sensor_types.length > 0
                    ? preferences.selected_sensor_types 
                    : sensorTypes  // Show all available sensor types when none selected
                }
              />
            </div>
          )}

          {/* Split View Mode */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          )}

          {/* Table Only View Mode */}
          {viewMode === 'table' && (
            <Card>
              <CardHeader>
                <CardTitle>Live Sensor Data</CardTitle>
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
          )}
        </>
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
