/**
 * 3D Editor for visual sensor position placement
 */

import { useState } from "react";
import { DigitalTwinCanvas } from "@/components/digital-twin/DigitalTwinCanvas";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Save, X, MousePointer } from "lucide-react";

interface SensorPositionEditorProps {
  assetId: string;
  editMode: boolean;
  onToggleEditMode: () => void;
  onPositionClick?: (position: [number, number, number]) => void;
}

export function SensorPositionEditor({
  assetId,
  editMode,
  onToggleEditMode,
  onPositionClick,
}: SensorPositionEditorProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number, number] | null>(null);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">3D Model View</h3>
            {editMode && (
              <Badge variant="default" className="gap-1">
                <MousePointer className="w-3 h-3" />
                Edit Mode Active
              </Badge>
            )}
          </div>
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleEditMode}
          >
            {editMode ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Exit Edit Mode
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Enable Edit Mode
              </>
            )}
          </Button>
        </div>

        {editMode && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Edit Mode Instructions:</strong>
              <br />
              • Click on the 3D model to place a new sensor marker
              <br />
              • The position form will appear to configure the sensor details
              <br />• Click "Exit Edit Mode" when done
            </p>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <DigitalTwinCanvas
            selectedAssetId={assetId}
            showIoTOverlays={true}
            editMode={editMode}
            onPositionClick={onPositionClick}
          />
        </div>
      </CardContent>
    </Card>
  );
}
