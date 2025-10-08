/**
 * IoT Meter Mapping Form Component
 * 
 * Configure automatic meter reading creation from IoT sensor data
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useIoTDevices } from "@/hooks/useIoTDevices";
import { useMeters } from "@/hooks/useMeters";
import { useCreateIoTMeterMapping } from "@/hooks/useIoTMeterMappings";
import { useEffect, useState } from "react";

const meterMappingSchema = z.object({
  device_id: z.string().uuid("Invalid device"),
  meter_id: z.string().uuid("Invalid meter"),
  source_metric: z.string().min(1, "Source metric is required"),
  multiplier: z.number().default(1),
  offset: z.number().default(0),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  warn_min: z.number().optional(),
  warn_max: z.number().optional(),
  is_active: z.boolean().default(true),
});

type MeterMappingFormData = z.infer<typeof meterMappingSchema>;

interface IoTMeterMappingFormProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId?: string;
  meterId?: string;
}

export function IoTMeterMappingForm({ isOpen, onClose, deviceId, meterId }: IoTMeterMappingFormProps) {
  const { currentOrganization } = useAuth();
  const { data: devices = [] } = useIoTDevices(currentOrganization?.id);
  const { meters } = useMeters();
  const createMapping = useCreateIoTMeterMapping();
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);

  const form = useForm<MeterMappingFormData>({
    resolver: zodResolver(meterMappingSchema),
    defaultValues: {
      device_id: deviceId || "",
      meter_id: meterId || "",
      source_metric: "",
      multiplier: 1,
      offset: 0,
      is_active: true,
    },
  });

  // Update selected device and available metrics when device_id changes
  useEffect(() => {
    const deviceIdValue = form.watch("device_id");
    if (deviceIdValue) {
      const device = devices.find(d => d.id === deviceIdValue);
      setSelectedDevice(device);
      
      // Extract metrics from device type sensor schema
      if (device?.device_type?.sensor_schema?.measures) {
        const metrics = Object.keys(device.device_type.sensor_schema.measures);
        setAvailableMetrics(metrics);
      } else {
        setAvailableMetrics([]);
      }
    }
  }, [form.watch("device_id"), devices]);

  const onSubmit = async (data: MeterMappingFormData) => {
    try {
      await createMapping.mutateAsync({
        device_id: data.device_id,
        meter_id: data.meter_id,
        metric_mapping: {
          source_metric: data.source_metric,
          multiplier: data.multiplier,
          offset: data.offset,
          min_value: data.min_value,
          max_value: data.max_value,
          warn_min: data.warn_min,
          warn_max: data.warn_max,
        },
        is_active: data.is_active,
        organization_id: currentOrganization?.id,
      });
      onClose();
    } catch (error) {
      console.error("Failed to create meter mapping:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Meter Mapping</DialogTitle>
          <DialogDescription>
            Map IoT sensor data to automatic meter readings
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Device and Meter Selection */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="device_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IoT Device *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!deviceId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {devices.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.device_name} ({device.dev_eui})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meter_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Meter *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!meterId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {meters.map((meter) => (
                          <SelectItem key={meter.id} value={meter.id}>
                            {meter.meter_number} - {meter.description || meter.meter_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source_metric"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Metric *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDevice}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedDevice ? "Select metric" : "Select device first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableMetrics.map((metric) => (
                          <SelectItem key={metric} value={metric}>
                            {metric}
                            {selectedDevice?.device_type?.sensor_schema?.measures[metric]?.unit && 
                              ` (${selectedDevice.device_type.sensor_schema.measures[metric].unit})`
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The sensor metric from the IoT device to map to meter readings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Transformation Settings */}
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Data Transformation</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="multiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Multiplier</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="offset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offset</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Valid Range */}
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Valid Range</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="min_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Optional"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Optional"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Warning Thresholds */}
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Warning Thresholds</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="warn_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warning Minimum</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Optional"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warn_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warning Maximum</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Optional"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Active Toggle */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label>Enable this mapping</Label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMapping.isPending}>
                {createMapping.isPending ? "Saving..." : "Save Mapping"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
