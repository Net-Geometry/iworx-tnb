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

  const onSubmit = async (data: MeterMappingFormData) => {
    console.log("Meter mapping data:", data);
    // TODO: Implement meter mapping creation
    onClose();
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* TODO: Load devices */}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* TODO: Load meters */}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* TODO: Load from device type sensor schema */}
                      </SelectContent>
                    </Select>
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
              <Button type="submit">
                Save Mapping
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
