import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCreateThreshold } from '@/hooks/useConditionMonitoring';
import { AssetSelector } from './AssetSelector';
import { DeviceSelector } from './DeviceSelector';
import { MetricSelector } from './MetricSelector';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

const thresholdFormSchema = z.object({
  asset_id: z.string().min(1, 'Asset is required'),
  device_id: z.string().optional(),
  metric_name: z.string().min(1, 'Metric is required'),
  warning_min: z.coerce.number().optional(),
  warning_max: z.coerce.number().optional(),
  critical_min: z.coerce.number().optional(),
  critical_max: z.coerce.number().optional(),
  enabled: z.boolean().default(true),
  auto_create_work_order: z.boolean().default(false),
  notification_emails: z.string().optional(),
}).refine(
  (data) => {
    // At least one threshold value must be provided
    return !!(data.warning_min || data.warning_max || data.critical_min || data.critical_max);
  },
  {
    message: 'At least one threshold value (warning or critical) is required',
    path: ['warning_min'],
  }
).refine(
  (data) => {
    // If both warning min and max provided, min must be less than max
    if (data.warning_min !== undefined && data.warning_max !== undefined) {
      return data.warning_min < data.warning_max;
    }
    return true;
  },
  {
    message: 'Warning minimum must be less than warning maximum',
    path: ['warning_max'],
  }
).refine(
  (data) => {
    // If both critical min and max provided, min must be less than max
    if (data.critical_min !== undefined && data.critical_max !== undefined) {
      return data.critical_min < data.critical_max;
    }
    return true;
  },
  {
    message: 'Critical minimum must be less than critical maximum',
    path: ['critical_max'],
  }
);

type ThresholdFormValues = z.infer<typeof thresholdFormSchema>;

interface ThresholdCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThresholdCreateDialog({ open, onOpenChange }: ThresholdCreateDialogProps) {
  const { currentOrganization } = useAuth();
  const createMutation = useCreateThreshold();
  const [selectedAsset, setSelectedAsset] = useState<string>();
  const [selectedDevice, setSelectedDevice] = useState<string>();

  const form = useForm<ThresholdFormValues>({
    resolver: zodResolver(thresholdFormSchema),
    defaultValues: {
      enabled: true,
      auto_create_work_order: false,
    },
  });

  const onSubmit = async (values: ThresholdFormValues) => {
    if (!currentOrganization?.id) return;

    // Parse notification emails if provided
    const emails = values.notification_emails
      ? values.notification_emails.split(',').map((e) => e.trim()).filter((e) => e)
      : undefined;

    const thresholdData = {
      organization_id: currentOrganization.id,
      asset_id: values.asset_id,
      device_id: values.device_id || null,
      metric_name: values.metric_name,
      warning_min: values.warning_min !== undefined ? values.warning_min : null,
      warning_max: values.warning_max !== undefined ? values.warning_max : null,
      critical_min: values.critical_min !== undefined ? values.critical_min : null,
      critical_max: values.critical_max !== undefined ? values.critical_max : null,
      enabled: values.enabled,
      auto_create_work_order: values.auto_create_work_order,
      notification_emails: emails,
    };

    createMutation.mutate(thresholdData, {
      onSuccess: () => {
        form.reset();
        setSelectedAsset(undefined);
        setSelectedDevice(undefined);
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Condition Threshold</DialogTitle>
          <DialogDescription>
            Configure monitoring thresholds for asset sensor metrics. When values exceed these thresholds, alarms will be triggered.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Asset Selection */}
            <FormField
              control={form.control}
              name="asset_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset *</FormLabel>
                  <FormControl>
                    <AssetSelector
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedAsset(value);
                        setSelectedDevice(undefined);
                        form.setValue('device_id', undefined);
                        form.setValue('metric_name', '');
                      }}
                    />
                  </FormControl>
                  <FormDescription>Select the asset to monitor</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Device Selection */}
            <FormField
              control={form.control}
              name="device_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IoT Device (Optional)</FormLabel>
                  <FormControl>
                    <DeviceSelector
                      assetId={selectedAsset}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedDevice(value);
                        form.setValue('metric_name', '');
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty for asset-level threshold, or select a specific device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Metric Selection */}
            <FormField
              control={form.control}
              name="metric_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric *</FormLabel>
                  <FormControl>
                    <MetricSelector
                      deviceId={selectedDevice}
                      assetId={selectedAsset}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Select the sensor metric to monitor from asset's devices</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Threshold Values */}
            <div className="space-y-4 p-4 border rounded-md">
              <h4 className="font-medium">Threshold Values</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="warning_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warning Minimum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g., 20"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warning_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warning Maximum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g., 80"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="critical_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Critical Minimum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g., 10"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="critical_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Critical Maximum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g., 90"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  At least one threshold value is required. Critical thresholds should be more extreme than warning thresholds.
                </AlertDescription>
              </Alert>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enabled</FormLabel>
                      <FormDescription>
                        Enable this threshold to start monitoring
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_create_work_order"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-Create Work Order</FormLabel>
                      <FormDescription>
                        Automatically create a corrective work order when a critical alarm is triggered
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notification_emails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Emails (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email1@example.com, email2@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated email addresses to notify when alarms are triggered
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Threshold
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
