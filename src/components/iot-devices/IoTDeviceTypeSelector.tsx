/**
 * IoT Device Type Selector Component
 * 
 * Searchable select for device types with inline creation capability
 */

import { useIoTDeviceTypes } from "@/hooks/useIoTDeviceTypes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IoTDeviceTypeSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  organizationId?: string;
}

export function IoTDeviceTypeSelector({ value, onChange, organizationId }: IoTDeviceTypeSelectorProps) {
  const { data: deviceTypes = [], isLoading } = useIoTDeviceTypes(organizationId);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading device types..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select device type (optional)" />
      </SelectTrigger>
      <SelectContent>
        {deviceTypes.map((type) => (
          <SelectItem key={type.id} value={type.id}>
            {type.name}
            {type.manufacturer && type.model && ` - ${type.manufacturer} ${type.model}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
