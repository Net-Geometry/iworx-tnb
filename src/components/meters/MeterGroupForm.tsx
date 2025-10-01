import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMeterGroups, MeterGroup } from '@/hooks/useMeterGroups';

interface MeterGroupFormProps {
  meterGroup: MeterGroup | null;
  onClose: () => void;
}

/**
 * MeterGroupForm - Form component for creating/editing meter groups
 */
export function MeterGroupForm({ meterGroup, onClose }: MeterGroupFormProps) {
  const { addMeterGroup, updateMeterGroup } = useMeterGroups();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm();

  const groupType = watch('group_type');
  const isActive = watch('is_active');

  useEffect(() => {
    if (meterGroup) {
      Object.keys(meterGroup).forEach((key) => {
        setValue(key, meterGroup[key as keyof MeterGroup]);
      });
    } else {
      setValue('is_active', true);
    }
  }, [meterGroup, setValue]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (meterGroup) {
        await updateMeterGroup(meterGroup.id, data);
      } else {
        await addMeterGroup(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving meter group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="group_number">Group Number *</Label>
          <Input
            id="group_number"
            {...register('group_number', { required: true })}
            placeholder="MG-001"
          />
        </div>
        <div>
          <Label htmlFor="name">Group Name *</Label>
          <Input
            id="name"
            {...register('name', { required: true })}
            placeholder="Zone A Revenue Meters"
          />
        </div>
      </div>

      {/* Group Type */}
      <div>
        <Label htmlFor="group_type">Group Type</Label>
        <Select
          value={groupType}
          onValueChange={(value) => setValue('group_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="monitoring">Monitoring</SelectItem>
            <SelectItem value="zone">Zone</SelectItem>
            <SelectItem value="feeder">Feeder</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          rows={3}
          placeholder="Describe the purpose of this meter group..."
        />
      </div>

      {/* Purpose */}
      <div>
        <Label htmlFor="purpose">Purpose</Label>
        <Input
          id="purpose"
          {...register('purpose')}
          placeholder="Revenue collection, load monitoring, etc."
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Saving...'
            : meterGroup
            ? 'Update Group'
            : 'Create Group'}
        </Button>
      </div>
    </form>
  );
}