import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMeters, Meter } from '@/hooks/useMeters';
import { supabase } from '@/integrations/supabase/client';

interface Unit {
  id: number;
  name: string;
  abbreviation: string;
}

interface MeterFormProps {
  meter: Meter | null;
  onClose: () => void;
}

/**
 * MeterForm - Form component for creating/editing meters
 * Handles all meter registration fields
 */
export function MeterForm({ meter, onClose }: MeterFormProps) {
  const { addMeter, updateMeter } = useMeters();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const { register, handleSubmit, setValue, watch } = useForm();

  const meterType = watch('meter_type');
  const status = watch('status');
  const phaseType = watch('phase_type');
  const unitId = watch('unit_id');

  // Fetch units
  useEffect(() => {
    const fetchUnits = async () => {
      const { data, error } = await supabase
        .from('unit')
        .select('id, name, abbreviation')
        .eq('is_active', true)
        .order('name');
      
      if (!error && data) {
        setUnits(data);
      }
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    if (meter) {
      // Populate form with existing meter data
      Object.keys(meter).forEach((key) => {
        setValue(key, meter[key as keyof Meter]);
      });
    }
  }, [meter, setValue]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      // Transform empty strings to null for numeric fields
      const numericFields = [
        'voltage_rating',
        'current_rating',
        'meter_constant',
        'multiplier',
        'last_reading',
        'unit_id'
      ];
      
      const transformedData = { ...data };
      numericFields.forEach(field => {
        if (transformedData[field] === '' || transformedData[field] === undefined) {
          transformedData[field] = null;
        } else if (transformedData[field] !== null) {
          // Convert to number if it's not already
          transformedData[field] = Number(transformedData[field]);
        }
      });
      
      if (meter) {
        await updateMeter(meter.id, transformedData);
      } else {
        await addMeter(transformedData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving meter:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="meter_number">Meter Number *</Label>
          <Input
            id="meter_number"
            {...register('meter_number', { required: true })}
            placeholder="M-12345"
          />
        </div>
        <div>
          <Label htmlFor="serial_number">Serial Number *</Label>
          <Input
            id="serial_number"
            {...register('serial_number', { required: true })}
            placeholder="SN-98765"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter meter description, purpose, location context, or other relevant details..."
          {...register('description')}
          className="min-h-[80px]"
        />
      </div>

      {/* Meter Type and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="meter_type">Meter Type *</Label>
          <Select
            value={meterType}
            onValueChange={(value) => setValue('meter_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
              <SelectItem value="protection">Protection</SelectItem>
              <SelectItem value="power_quality">Power Quality</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="faulty">Faulty</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input id="manufacturer" {...register('manufacturer')} />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input id="model" {...register('model')} />
        </div>
        <div>
          <Label htmlFor="accuracy_class">Accuracy Class</Label>
          <Input
            id="accuracy_class"
            {...register('accuracy_class')}
            placeholder="0.2S"
          />
        </div>
      </div>

      {/* Electrical Ratings */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="voltage_rating">Voltage Rating (V)</Label>
          <Input
            id="voltage_rating"
            type="number"
            {...register('voltage_rating')}
          />
        </div>
        <div>
          <Label htmlFor="current_rating">Current Rating (A)</Label>
          <Input
            id="current_rating"
            type="number"
            {...register('current_rating')}
          />
        </div>
        <div>
          <Label htmlFor="phase_type">Phase Type</Label>
          <Select
            value={phaseType}
            onValueChange={(value) => setValue('phase_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Phase</SelectItem>
              <SelectItem value="three">Three Phase</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Installation Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="installation_date">Installation Date</Label>
          <Input
            id="installation_date"
            type="date"
            {...register('installation_date')}
          />
        </div>
        <div>
          <Label htmlFor="installation_location">Installation Location</Label>
          <Input
            id="installation_location"
            {...register('installation_location')}
          />
        </div>
      </div>

      {/* Calibration Information */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="last_calibration_date">Last Calibration</Label>
          <Input
            id="last_calibration_date"
            type="date"
            {...register('last_calibration_date')}
          />
        </div>
        <div>
          <Label htmlFor="next_calibration_date">Next Calibration</Label>
          <Input
            id="next_calibration_date"
            type="date"
            {...register('next_calibration_date')}
          />
        </div>
        <div>
          <Label htmlFor="calibration_certificate_number">
            Certificate Number
          </Label>
          <Input
            id="calibration_certificate_number"
            {...register('calibration_certificate_number')}
          />
        </div>
      </div>

      {/* Meter Configuration */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="meter_constant">Meter Constant</Label>
          <Input
            id="meter_constant"
            type="number"
            step="0.01"
            {...register('meter_constant')}
          />
        </div>
        <div>
          <Label htmlFor="multiplier">Multiplier</Label>
          <Input
            id="multiplier"
            type="number"
            step="0.01"
            defaultValue={1}
            {...register('multiplier')}
          />
        </div>
        <div>
          <Label htmlFor="unit_id">Unit of Measure</Label>
          <Select
            value={unitId?.toString()}
            onValueChange={(value) => setValue('unit_id', value ? parseInt(value) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id.toString()}>
                  {unit.name} ({unit.abbreviation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} rows={3} />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : meter ? 'Update Meter' : 'Register Meter'}
        </Button>
      </div>
    </form>
  );
}