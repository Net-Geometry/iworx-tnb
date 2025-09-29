import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useHierarchyLevels, HierarchyLevel } from "@/hooks/useHierarchyData";
import { useToast } from "@/hooks/use-toast";
import { 
  Map, Building2, Zap, Activity, Navigation, Component, 
  Folder, Home, Building, Factory, MapPin, Settings,
  Users, Box, Package, Wrench
} from "lucide-react";

const iconOptions = [
  { name: 'map', icon: Map, label: 'Map' },
  { name: 'building2', icon: Building2, label: 'Building' },
  { name: 'zap', icon: Zap, label: 'Zap' },
  { name: 'activity', icon: Activity, label: 'Activity' },
  { name: 'navigation', icon: Navigation, label: 'Navigation' },
  { name: 'component', icon: Component, label: 'Component' },
  { name: 'folder', icon: Folder, label: 'Folder' },
  { name: 'home', icon: Home, label: 'Home' },
  { name: 'building', icon: Building, label: 'Building Alt' },
  { name: 'factory', icon: Factory, label: 'Factory' },
  { name: 'map-pin', icon: MapPin, label: 'Map Pin' },
  { name: 'settings', icon: Settings, label: 'Settings' },
  { name: 'users', icon: Users, label: 'Users' },
  { name: 'box', icon: Box, label: 'Box' },
  { name: 'package', icon: Package, label: 'Package' },
  { name: 'wrench', icon: Wrench, label: 'Wrench' },
];

const colorOptions = [
  '#10b981', // green
  '#3b82f6', // blue
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
];

interface LevelManagementFormProps {
  levelId?: string;
  onClose: () => void;
}

export function LevelManagementForm({ levelId, onClose }: LevelManagementFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    level_order: 0,
    icon_name: 'folder',
    color_code: '#6366f1',
    parent_level_id: '',
    is_active: true
  });
  
  const [loading, setLoading] = useState(false);
  const { levels, addLevel, updateLevel } = useHierarchyLevels();
  const { toast } = useToast();

  const isEditing = !!levelId;
  const existingLevel = levels.find(l => l.id === levelId);

  useEffect(() => {
    if (existingLevel) {
      setFormData({
        name: existingLevel.name,
        level_order: existingLevel.level_order,
        icon_name: existingLevel.icon_name,
        color_code: existingLevel.color_code,
        parent_level_id: existingLevel.parent_level_id || "none",
        is_active: existingLevel.is_active
      });
    }
  }, [existingLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await updateLevel(levelId, formData);
        toast({
          title: "Success",
          description: "Hierarchy level updated successfully",
        });
      } else {
        await addLevel(formData as Omit<HierarchyLevel, 'id'>);
        toast({
          title: "Success",
          description: "Hierarchy level created successfully",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save level",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Hierarchy Level' : 'Add Hierarchy Level'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Level Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., State, Region, Zone"
              required
            />
          </div>

          <div>
            <Label htmlFor="level_order">Order in Hierarchy</Label>
            <Input
              id="level_order"
              type="number"
              min="0"
              value={formData.level_order}
              onChange={(e) => setFormData(prev => ({ ...prev, level_order: parseInt(e.target.value) || 0 }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={formData.icon_name}
              onValueChange={(value) => setFormData(prev => ({ ...prev, icon_name: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <SelectItem key={option.name} value={option.name}>
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-md border-2 ${
                    formData.color_code === color ? 'border-foreground' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color_code: color }))}
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="parent_level">Parent Level (Optional)</Label>
            <Select
              value={formData.parent_level_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, parent_level_id: value === "none" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Parent</SelectItem>
                {levels
                  .filter(l => l.id !== levelId) // Don't show self as parent
                  .sort((a, b) => a.level_order - b.level_order)
                  .map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} (Order: {level.level_order})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}