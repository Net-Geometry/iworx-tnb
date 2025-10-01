import { useMeterGroups } from "@/hooks/useMeterGroups";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gauge } from "lucide-react";

interface MeterGroupSelectorProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

/**
 * Component for selecting a meter group for a task
 */
export function MeterGroupSelector({ value, onChange }: MeterGroupSelectorProps) {
  const { meterGroups, loading } = useMeterGroups();

  const handleValueChange = (newValue: string) => {
    if (newValue === "none") {
      onChange(undefined);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="meter_group" className="flex items-center gap-2">
        <Gauge className="h-4 w-4" />
        Meter Group (Optional)
      </Label>
      <Select 
        value={value || "none"} 
        onValueChange={handleValueChange}
        disabled={loading}
      >
        <SelectTrigger id="meter_group">
          <SelectValue placeholder="Select a meter group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No meter group</SelectItem>
          {meterGroups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name} {group.group_number ? `(${group.group_number})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
