import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MaintenanceRoute } from "@/hooks/useMaintenanceRoutes";

/**
 * Form for creating/editing maintenance routes
 * Handles route basic information
 */

const routeSchema = z.object({
  route_number: z.string().min(1, "Route number is required"),
  name: z.string().min(1, "Route name is required"),
  description: z.string().optional(),
  route_type: z.string().optional(),
  status: z.string().optional(),
  estimated_duration_hours: z.coerce.number().optional(),
  frequency_type: z.string().optional(),
  frequency_interval: z.coerce.number().optional(),
});

type RouteFormValues = z.infer<typeof routeSchema>;

interface RouteFormProps {
  route?: MaintenanceRoute;
  onSubmit: (data: RouteFormValues) => void;
  onCancel: () => void;
}

export const RouteForm = ({ route, onSubmit, onCancel }: RouteFormProps) => {
  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      route_number: route?.route_number || "",
      name: route?.name || "",
      description: route?.description || "",
      route_type: route?.route_type || "maintenance",
      status: route?.status || "active",
      estimated_duration_hours: route?.estimated_duration_hours || undefined,
      frequency_type: route?.frequency_type || "",
      frequency_interval: route?.frequency_interval || undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="route_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Route Number *</FormLabel>
                <FormControl>
                  <Input placeholder="RT-001" {...field} />
                </FormControl>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route Name *</FormLabel>
              <FormControl>
                <Input placeholder="Daily Inspection Route" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Route description..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="route_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Route Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimated_duration_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Est. Duration (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="2.5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="frequency_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency_interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency Interval</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {route ? "Update Route" : "Create Route"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
