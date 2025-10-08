/**
 * IoT Device Edit Dialog
 * 
 * Edit existing device configuration, including asset assignment
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoTDeviceTypeSelector } from "./IoTDeviceTypeSelector";
import { AssetSelector } from "./AssetSelector";
import { useUpdateIoTDevice } from "@/hooks/useIoTDevices";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const editDeviceSchema = z.object({
  device_name: z.string().min(3).max(100),
  device_type_id: z.string().uuid().optional().or(z.literal("")),
  asset_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "error"]),
});

type EditDeviceFormData = z.infer<typeof editDeviceSchema>;

interface IoTDeviceEditDialogProps {
  device: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function IoTDeviceEditDialog({
  device,
  isOpen,
  onClose,
  onSuccess,
}: IoTDeviceEditDialogProps) {
  const { currentOrganization } = useAuth();
  const updateDevice = useUpdateIoTDevice();

  const form = useForm<EditDeviceFormData>({
    resolver: zodResolver(editDeviceSchema),
    defaultValues: {
      device_name: device?.device_name || "",
      device_type_id: device?.device_type_id || "",
      asset_id: device?.asset_id || "",
      status: device?.status || "active",
    },
  });

  // Update form when device changes
  useEffect(() => {
    if (device) {
      form.reset({
        device_name: device.device_name,
        device_type_id: device.device_type_id || "",
        asset_id: device.asset_id || "",
        status: device.status,
      });
    }
  }, [device, form]);

  const onSubmit = async (data: EditDeviceFormData) => {
    if (!device?.id) return;

    try {
      await updateDevice.mutateAsync({
        id: device.id,
        device_name: data.device_name,
        device_type_id: data.device_type_id || null,
        asset_id: data.asset_id || null,
        status: data.status,
      });

      toast.success("Device updated successfully");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(`Failed to update device: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit IoT Device</DialogTitle>
          <DialogDescription>
            Update device configuration and asset assignment
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="device_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="device_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Type</FormLabel>
                  <FormControl>
                    <IoTDeviceTypeSelector
                      value={field.value}
                      onChange={field.onChange}
                      organizationId={currentOrganization?.id}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="asset_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Asset</FormLabel>
                  <FormControl>
                    <AssetSelector
                      value={field.value}
                      onValueChange={field.onChange}
                      organizationId={currentOrganization?.id}
                    />
                  </FormControl>
                  <FormDescription>
                    Change which asset this device monitors
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateDevice.isPending}>
                {updateDevice.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
