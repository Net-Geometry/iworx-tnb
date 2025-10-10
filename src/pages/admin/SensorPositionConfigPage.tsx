/**
 * Admin page for configuring sensor positions on 3D asset models
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Radio } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { useIoTDevices } from "@/hooks/useIoTDevices";
import { useAssetSensorPositions } from "@/hooks/useAssetSensorPositions";
import { useUpdateSensorPosition } from "@/hooks/useUpdateSensorPosition";
import { SensorPositionEditor } from "@/components/admin/SensorPositionEditor";
import { SensorPositionForm } from "@/components/admin/SensorPositionForm";
import { SensorPositionsList } from "@/components/admin/SensorPositionsList";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function SensorPositionConfigPage() {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [newPosition, setNewPosition] = useState<[number, number, number] | null>(null);

  const { assets, loading: assetsLoading } = useAssets(true);
  const { data: devices } = useIoTDevices(currentOrganization?.id, {
    asset_id: selectedAssetId || undefined,
  });
  const { data: sensorPositions = [] } = useAssetSensorPositions(selectedAssetId);
  const updatePosition = useUpdateSensorPosition();

  // Filter assets that have 3D models
  const assetsWithModels = assets.filter(
    (asset) => asset.model_3d_url || asset.type === 'transformer' || asset.type === 'switchgear'
  );

  const handleAssetChange = (assetId: string) => {
    setSelectedAssetId(assetId);
    setEditMode(false);
    setEditingDeviceId(null);
  };

  const handlePositionClick = (position: [number, number, number]) => {
    if (!editMode) return;
    
    // Find a device without a position set yet
    const unpositionedDevice = devices?.find(
      (device) => !(device as any).sensor_position_3d
    );

    if (unpositionedDevice) {
      setEditingDeviceId(unpositionedDevice.id);
      setNewPosition(position);
    } else {
      toast.info("All devices already have positions. Edit an existing sensor to change its position.");
    }
  };

  const handleSavePosition = (position: { x: number; y: number; z: number; label?: string; color?: string }) => {
    if (!editingDeviceId) return;

    updatePosition.mutate(
      { deviceId: editingDeviceId, position },
      {
        onSuccess: () => {
          setEditingDeviceId(null);
          setNewPosition(null);
          setEditMode(false);
        },
      }
    );
  };

  const handleEditSensor = (sensor: any) => {
    if (sensor.deviceId) {
      setEditingDeviceId(sensor.deviceId);
      setEditMode(true);
    }
  };

  const handleDeleteSensor = (sensorId: string) => {
    const sensor = sensorPositions.find((s) => s.id === sensorId);
    if (sensor?.deviceId) {
      updatePosition.mutate(
        { deviceId: sensor.deviceId, position: { x: 0, y: 0, z: 0 } },
        {
          onSuccess: () => {
            toast.success("Sensor position removed");
          },
        }
      );
    }
  };

  const handleFocusSensor = (sensor: any) => {
    toast.info(`Camera focusing on ${sensor.label || sensor.deviceName}`);
    // Camera focus would be handled by the 3D canvas component
  };

  const editingDevice = devices?.find((d) => d.id === editingDeviceId);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/settings")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <Radio className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Sensor Position Configuration</h1>
            <p className="text-muted-foreground">
              Configure 3D positions for IoT sensors on asset models
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Asset Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Asset</CardTitle>
            <CardDescription>
              Choose an asset with a 3D model to configure sensor positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedAssetId} onValueChange={handleAssetChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an asset..." />
              </SelectTrigger>
              <SelectContent>
                {assetsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading assets...
                  </SelectItem>
                ) : assetsWithModels.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No assets with 3D models found
                  </SelectItem>
                ) : (
                  assetsWithModels.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.type})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedAssetId && (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 3D Editor */}
              <div>
                <SensorPositionEditor
                  assetId={selectedAssetId}
                  editMode={editMode}
                  onToggleEditMode={() => setEditMode(!editMode)}
                  onPositionClick={handlePositionClick}
                />
              </div>

              {/* Position Form */}
              <div>
                {editingDeviceId && editingDevice ? (
                  <SensorPositionForm
                    deviceId={editingDeviceId}
                    deviceName={editingDevice.device_name}
                    currentPosition={
                      newPosition
                        ? { x: newPosition[0], y: newPosition[1], z: newPosition[2] }
                        : (editingDevice as any).sensor_position_3d || undefined
                    }
                    onSave={handleSavePosition}
                    onCancel={() => {
                      setEditingDeviceId(null);
                      setNewPosition(null);
                    }}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center text-muted-foreground">
                        <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No sensor selected</p>
                        <p className="text-sm mt-1">
                          Enable Edit Mode and click on the 3D model to place a sensor
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Sensors List */}
            <SensorPositionsList
              sensors={sensorPositions}
              onEdit={handleEditSensor}
              onDelete={handleDeleteSensor}
              onFocus={handleFocusSensor}
            />
          </>
        )}
      </div>
    </div>
  );
}
