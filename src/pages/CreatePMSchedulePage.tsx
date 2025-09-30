/**
 * CreatePMSchedulePage
 * 
 * This page provides a dedicated interface for creating new preventive maintenance schedules.
 * Users can define schedule parameters, assign assets, set frequencies, and configure automation.
 * 
 * Features:
 * - Form validation using react-hook-form and zod
 * - Asset and job plan selection
 * - Flexible frequency configuration
 * - Assignment and notification settings
 * - Breadcrumb navigation
 */

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PMScheduleInsert, useCreatePMSchedule } from "@/hooks/usePMSchedules";
import { useAssets } from "@/hooks/useAssets";
import { useJobPlans } from "@/hooks/useJobPlans";
import { usePeople } from "@/hooks/usePeople";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// ============================================================================
// Form Validation Schema
// ============================================================================

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
  assigned_to: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  estimated_duration_hours: z.coerce.number().optional(),
  auto_generate_wo: z.boolean(),
  notification_enabled: z.boolean(),
});

type PMScheduleFormValues = z.infer<typeof pmScheduleSchema>;

// ============================================================================
// Main Component
// ============================================================================

const CreatePMSchedulePage = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const createPMSchedule = useCreatePMSchedule();
  
  // Data hooks for dropdown selections
  const { assets } = useAssets();
  const { data: jobPlans } = useJobPlans();
  const { people } = usePeople();

  // Initialize form with default values
  const form = useForm<PMScheduleFormValues>({
    resolver: zodResolver(pmScheduleSchema),
    defaultValues: {
      schedule_number: `PM-${Date.now()}`,
      title: "",
      description: "",
      asset_id: "",
      job_plan_id: "",
      frequency_type: "monthly",
      frequency_value: 1,
      frequency_unit: "months",
      start_date: new Date(),
      lead_time_days: 7,
      assigned_to: "",
      priority: "medium",
      estimated_duration_hours: undefined,
      auto_generate_wo: true,
      notification_enabled: true,
    },
  });

  // ============================================================================
  // Form Submission Handler
  // ============================================================================

  const onSubmit = async (values: PMScheduleFormValues) => {
    try {
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
        assigned_to: values.assigned_to,
        priority: values.priority,
        estimated_duration_hours: values.estimated_duration_hours,
        auto_generate_wo: values.auto_generate_wo,
        notification_enabled: values.notification_enabled,
        organization_id: currentOrganization!.id,
      };

      await createPMSchedule.mutateAsync(scheduleData);
      
      toast({
        title: "Success",
        description: "PM schedule created successfully",
      });
      
      navigate("/preventive-maintenance");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create PM schedule",
        variant: "destructive",
      });
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header with Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/preventive-maintenance")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create PM Schedule</h1>
          <p className="text-muted-foreground">
            Define a new preventive maintenance schedule for your assets
          </p>
        </div>
      </div>

      {/* Main Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about the PM schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="schedule_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="PM-001" />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for this PM schedule
                    </FormDescription>
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
                      <Textarea 
                        {...field} 
                        placeholder="Detailed description of the PM schedule"
                        rows={4}
                      />
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
            </CardContent>
          </Card>

          {/* Asset & Job Plan Section */}
          <Card>
            <CardHeader>
              <CardTitle>Asset & Job Plan</CardTitle>
              <CardDescription>
                Link this schedule to an asset and optionally a job plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Frequency Configuration Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequency Configuration</CardTitle>
              <CardDescription>
                Define how often this maintenance should occur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormLabel>Interval Value</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>E.g., "3" for every 3 months</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Show frequency unit selector only for custom frequency */}
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
            </CardContent>
          </Card>

          {/* Scheduling Section */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
              <CardDescription>
                Configure when this maintenance should start and duration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <FormDescription>
                      Expected time to complete this maintenance
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Assignment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
              <CardDescription>
                Assign this schedule to a team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="assigned_to"
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
            </CardContent>
          </Card>

          {/* Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure automation and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="auto_generate_wo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Auto-Generate Work Orders
                      </FormLabel>
                      <FormDescription>
                        Automatically create work orders based on this schedule
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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
                      <FormLabel className="text-base">
                        Enable Notifications
                      </FormLabel>
                      <FormDescription>
                        Send notifications when work orders are due
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/preventive-maintenance")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPMSchedule.isPending}
            >
              {createPMSchedule.isPending ? "Creating..." : "Create PM Schedule"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreatePMSchedulePage;
