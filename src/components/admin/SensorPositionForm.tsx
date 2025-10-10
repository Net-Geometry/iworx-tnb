/**
 * Form for editing sensor position coordinates, label, and color
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface SensorPosition3D {
  x: number;
  y: number;
  z: number;
  label?: string;
  color?: string;
}

interface SensorPositionFormProps {
  deviceId: string;
  deviceName: string;
  currentPosition?: SensorPosition3D;
  onSave: (position: SensorPosition3D) => void;
  onCancel: () => void;
}

export function SensorPositionForm({
  deviceId,
  deviceName,
  currentPosition,
  onSave,
  onCancel,
}: SensorPositionFormProps) {
  const [position, setPosition] = useState<SensorPosition3D>(
    currentPosition || { x: 0, y: 0, z: 0, label: deviceName, color: '#3b82f6' }
  );

  useEffect(() => {
    if (currentPosition) {
      setPosition(currentPosition);
    }
  }, [currentPosition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(position);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Edit Position: {deviceName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="x">X Coordinate</Label>
              <Input
                id="x"
                type="number"
                step="0.1"
                value={position.x}
                onChange={(e) =>
                  setPosition({ ...position, x: parseFloat(e.target.value) })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="y">Y Coordinate</Label>
              <Input
                id="y"
                type="number"
                step="0.1"
                value={position.y}
                onChange={(e) =>
                  setPosition({ ...position, y: parseFloat(e.target.value) })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="z">Z Coordinate</Label>
              <Input
                id="z"
                type="number"
                step="0.1"
                value={position.z}
                onChange={(e) =>
                  setPosition({ ...position, z: parseFloat(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              type="text"
              value={position.label || ''}
              onChange={(e) =>
                setPosition({ ...position, label: e.target.value })
              }
              placeholder="Sensor label"
            />
          </div>

          <div>
            <Label htmlFor="color">Marker Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={position.color || '#3b82f6'}
                onChange={(e) =>
                  setPosition({ ...position, color: e.target.value })
                }
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={position.color || '#3b82f6'}
                onChange={(e) =>
                  setPosition({ ...position, color: e.target.value })
                }
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save Position
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
