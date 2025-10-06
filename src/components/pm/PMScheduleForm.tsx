import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PMSchedule, PMScheduleInsert, useCreatePMSchedule, useUpdatePMSchedule } from "@/hooks/usePMSchedules";
import { useAssets } from "@/hooks/useAssets";
import { useJobPlans } from "@/hooks/useJobPlans";
import { usePeople } from "@/hooks/usePeople";
import { useAuth } from "@/contexts/AuthContext";

// Form validation schema
const pmScheduleSchema = z.object({
  schedule_number: z.string().min(1, "Schedule number is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  asset_id: z.string().min(1, "Asset is required"),
  job_plan_id: z.string().optional(),
  frequency_type: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  frequency_value: z.coerce.number().min(1, "Frequency value must be at least 1"),
  frequency_unit: z.enum(['days', 'weeks', 'months', 'years']).optional(),
  start_date: z.date({ required_error: "Start date is required" }),
  lead_time_days: z.coerce.number().min(0, "Lead time must be 0 or greater"),
  assigned_person_id: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  estimated_duration_hours: z.coerce.number().optional(),
  auto_generate_wo: z.boolean(),
  notification_enabled: z.boolean(),
  location_node_id: z.string().optional(),
});

type PMScheduleFormValues = z.infer<typeof pmScheduleSchema>;

interface PMScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: PMSchedule;
}

/**
 * PMScheduleForm Component
 * Form for creating and editing PM schedules
 */
const PMScheduleForm = ({ open, onOpenChange, schedule }: PMScheduleFormProps) => {
  const { currentOrganization } = useAuth();
  const createPMSchedule = useCreatePMSchedule();
  const updatePMSchedule = useUpdatePMSchedule();
  const { assets } = useAssets();
  const { data: jobPlans } = useJobPlans();
  const { people } = usePeople();

  // Fetch Level 4 (Location) nodes for notification routing
  const { data: level4Nodes = [] } = useQuery({
    queryKey: ['hierarchy-level-4-nodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hierarchy_nodes')
        .select(`
          id,
          name,
          path,
          hierarchy_levels!inner (
            id,
            name,
            level_order
          )
        `)
        .eq('hierarchy_levels.level_order', 4)
        .order('path');

      if (error) throw error;
      return data || [];
    },
  });

  const form = useForm<PMScheduleFormValues>({
    resolver: zodResolver(pmScheduleSchema),
    defaultValues: {
      schedule_number: schedule?.schedule_number || `PM-${Date.now()}`,
      title: schedule?.title || "",
      description: schedule?.description || "",
      asset_id: schedule?.asset_id || "",
      job_plan_id: schedule?.job_plan_id || "",
      frequency_type: schedule?.frequency_type || "monthly",
      frequency_value: schedule?.frequency_value || 1,
      frequency_unit: schedule?.frequency_unit || "months",
      start_date: schedule?.start_date ? new Date(schedule.start_date) : new Date(),
      lead_time_days: schedule?.lead_time_days || 7,
      assigned_person_id: "",
      priority: (schedule?.priority as 'low' | 'medium' | 'high') || "medium",
      estimated_duration_hours: schedule?.estimated_duration_hours || undefined,
      auto_generate_wo: schedule?.auto_generate_wo ?? true,
      notification_enabled: schedule?.notification_enabled ?? true,
      // @ts-expect-error - location_node_id exists in DB but types not regenerated yet
      location_node_id: schedule?.location_node_id || "",
    },
  });

  const onSubmit = async (values: PMScheduleFormValues) => {
    const scheduleData: PMScheduleInsert = {
      schedule_number: values.schedule_number,
      title: values.title,
      description: values.description,
      asset_id: values.asset_id,
      job_plan_id: values.job_plan_id,
      frequency_type: values.frequency_type,
      frequency_value: values.frequency_value,
      frequency_unit: values.frequency_unit,
      start_date: format(values.start_date, 'yyyy-MM-dd'),
      lead_time_days: values.lead_time_days,
      priority: values.priority,
      estimated_duration_hours: values.estimated_duration_hours,
      auto_generate_wo: values.auto_generate_wo,
      notification_enabled: values.notification_enabled,
      organization_id: currentOrganization!.id,
    };

    if (schedule) {
      await updatePMSchedule.mutateAsync({ id: schedule.id, updates: scheduleData });
    } else {
      await createPMSchedule.mutateAsync(scheduleData);
    }

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{schedule ? "Edit PM Schedule" : "Create PM Schedule"}</DialogTitle>
          <DialogDescription>
            {schedule ? "Update the preventive maintenance schedule" : "Create a new preventive maintenance schedule"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="schedule_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="PM-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Monthly Pump Inspection" />
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
                      <Textarea {...field} placeholder="Detailed description of the PM schedule" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Asset & Job Plan Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Asset & Job Plan</h3>
              
              <FormField
                control={form.control}
                name="asset_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assets?.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name} {asset.asset_number && `(${asset.asset_number})`}
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
                name="job_plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Plan (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobPlans?.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.title} ({plan.job_plan_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional: Link to a job plan for detailed procedures
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Frequency Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Frequency</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="frequency_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Every (number)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>E.g., "3" for every 3 months</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch('frequency_type') === 'custom' && (
                <FormField
                  control={form.control}
                  name="frequency_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="years">Years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Scheduling */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Scheduling</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className={cn("p-3")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lead_time_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Time (days)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        Days before due date to generate work order
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="estimated_duration_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Assignment</h3>
              
              <FormField
                control={form.control}
                name="assigned_person_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Person (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select person" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {people?.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.first_name} {person.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location for Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Notification Location</h3>
              
              <FormField
                control={form.control}
                name="location_node_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location for notifications" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {level4Nodes?.map((node: any) => (
                          <SelectItem key={node.id} value={node.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{node.name}</span>
                              <span className="text-xs text-muted-foreground">{node.path}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Engineers assigned to this location will be notified when work orders are generated
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Settings</h3>
              
              <FormField
                control={form.control}
                name="auto_generate_wo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-generate Work Orders</FormLabel>
                      <FormDescription>
                        Automatically create work orders based on schedule
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
                name="notification_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Notifications</FormLabel>
                      <FormDescription>
                        Send notifications when PMs are due or overdue
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPMSchedule.isPending || updatePMSchedule.isPending}>
                {schedule ? "Update Schedule" : "Create Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PMScheduleForm;
