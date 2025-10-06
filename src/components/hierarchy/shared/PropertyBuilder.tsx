import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * PropertyBuilder Component
 * 
 * Form-based property editor that replaces raw JSON editing.
 * Allows users to add, edit, and remove custom properties with type validation.
 */

export type PropertyType = "text" | "number" | "select" | "date" | "boolean";

export interface Property {
  key: string;
  value: string;
  type: PropertyType;
  options?: string[]; // For select type
}

interface PropertyBuilderProps {
  properties: Property[];
  onChange: (properties: Property[]) => void;
  disabled?: boolean;
}

export const PropertyBuilder = ({ properties, onChange, disabled = false }: PropertyBuilderProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addProperty = () => {
    onChange([...properties, { key: "", value: "", type: "text" }]);
    setEditingIndex(properties.length);
  };

  const updateProperty = (index: number, updates: Partial<Property>) => {
    const updated = properties.map((prop, i) => 
      i === index ? { ...prop, ...updates } : prop
    );
    onChange(updated);
  };

  const removeProperty = (index: number) => {
    onChange(properties.filter((_, i) => i !== index));
  };

  const renderValueInput = (prop: Property, index: number) => {
    switch (prop.type) {
      case "boolean":
        return (
          <Select
            value={prop.value}
            onValueChange={(value) => updateProperty(index, { value })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case "select":
        return (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Options (comma-separated)"
              value={prop.options?.join(", ") || ""}
              onChange={(e) => 
                updateProperty(index, { 
                  options: e.target.value.split(",").map(o => o.trim()).filter(Boolean) 
                })
              }
              disabled={disabled}
              className="mb-2"
            />
            <Select
              value={prop.value}
              onValueChange={(value) => updateProperty(index, { value })}
              disabled={disabled || !prop.options?.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                {prop.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case "date":
        return (
          <Input
            type="date"
            value={prop.value}
            onChange={(e) => updateProperty(index, { value: e.target.value })}
            disabled={disabled}
          />
        );
      
      case "number":
        return (
          <Input
            type="number"
            placeholder="Value"
            value={prop.value}
            onChange={(e) => updateProperty(index, { value: e.target.value })}
            disabled={disabled}
          />
        );
      
      default: // text
        return (
          <Input
            type="text"
            placeholder="Value"
            value={prop.value}
            onChange={(e) => updateProperty(index, { value: e.target.value })}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Custom Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {properties.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No custom properties defined. Click "Add Property" to create one.
          </p>
        )}
        
        {properties.map((prop, index) => (
          <div key={index} className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Property Name</Label>
                <Input
                  type="text"
                  placeholder="e.g., voltage_level"
                  value={prop.key}
                  onChange={(e) => updateProperty(index, { key: e.target.value })}
                  disabled={disabled}
                />
              </div>
              
              <div>
                <Label>Type</Label>
                <Select
                  value={prop.type}
                  onValueChange={(type: PropertyType) => 
                    updateProperty(index, { type, value: type === "boolean" ? "false" : "" })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Value</Label>
              {renderValueInput(prop, index)}
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeProperty(index)}
              disabled={disabled}
              className="self-end text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addProperty}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </CardContent>
    </Card>
  );
};
