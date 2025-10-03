import { useParams, useNavigate } from "react-router-dom";
import { useIncidents } from "@/hooks/useIncidents";
import { useCanEditIncident } from "@/hooks/useCanEditIncident";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Wrench } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Form validation schema
const incidentSchema = z.object({
  incident_date: z.string().min(1, "Incident date is required"),
  location: z.string().min(1, "Location is required"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  reporter_name: z.string().min(1, "Reporter name is required"),
  reporter_email: z.string().email("Invalid email").optional().or(z.literal("")),
  immediate_actions: z.string().optional(),
  root_cause: z.string().optional(),
  corrective_actions: z.string().optional(),
  regulatory_reporting_required: z.boolean().default(false),
  // Work Order Planning Fields
  requires_work_order: z.boolean().default(false),
  wo_maintenance_type: z.enum(["preventive", "corrective", "predictive", "emergency"]).optional(),
  wo_priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  wo_estimated_duration_hours: z.coerce.number().optional(),
  wo_assigned_technician: z.string().optional(),
  wo_estimated_cost: z.coerce.number().optional(),
  wo_target_start_date: z.string().optional(),
  wo_target_finish_date: z.string().optional(),
  wo_notes: z.string().optional(),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

export default function EditIncidentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { incidents, loading, updateIncident } = useIncidents();
  const canEdit = useCanEditIncident(id);

  const incident = incidents.find((inc) => inc.id === id);

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      incident_date: incident?.incident_date || "",
      location: incident?.location || "",
      severity: incident?.severity || "medium",
      title: incident?.title || "",
      description: incident?.description || "",
      reporter_name: incident?.reporter_name || "",
      reporter_email: incident?.reporter_email || "",
      immediate_actions: incident?.immediate_actions || "",
      root_cause: incident?.root_cause || "",
      corrective_actions: incident?.corrective_actions || "",
      regulatory_reporting_required: incident?.regulatory_reporting_required || false,
      requires_work_order: !!incident?.wo_maintenance_type,
      wo_maintenance_type: incident?.wo_maintenance_type || undefined,
      wo_priority: incident?.wo_priority || undefined,
      wo_estimated_duration_hours: incident?.wo_estimated_duration_hours || undefined,
      wo_assigned_technician: incident?.wo_assigned_technician || "",
      wo_estimated_cost: incident?.wo_estimated_cost || undefined,
      wo_target_start_date: incident?.wo_target_start_date || "",
      wo_target_finish_date: incident?.wo_target_finish_date || "",
      wo_notes: incident?.wo_notes || "",
    },
  });

  const handleSubmit = async (data: IncidentFormValues) => {
    if (!id) return;
    
    await updateIncident(id, data);
    navigate(`/safety/incidents/${id}`);
  };

  const handleCancel = () => {
    navigate(`/safety/incidents/${id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Incident not found. It may have been deleted or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to edit this incident based on your role and the current workflow step.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/safety">Safety</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/safety/incidents">Incidents</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/safety/incidents/${id}`}>
              {incident.incident_number}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Edit Incident</h1>
        <p className="text-muted-foreground">
          Update incident details and work order planning information
        </p>
      </div>

      {/* Edit Form */}
      <div className="bg-card rounded-lg border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Incident Date & Time */}
              <FormField
                control={form.control}
                name="incident_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Date & Time *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Severity */}
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - Minor injury, no lost time</SelectItem>
                        <SelectItem value="medium">Medium - Medical treatment required</SelectItem>
                        <SelectItem value="high">High - Lost time injury</SelectItem>
                        <SelectItem value="critical">Critical - Severe injury or fatality</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the incident" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of what happened..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Immediate Actions Taken */}
            <FormField
              control={form.control}
              name="immediate_actions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Immediate Actions Taken</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe any immediate actions taken..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Root Cause */}
            <FormField
              control={form.control}
              name="root_cause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Root Cause Analysis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the root cause of the incident..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Corrective Actions */}
            <FormField
              control={form.control}
              name="corrective_actions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corrective Actions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe corrective actions taken or planned..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reporter Name */}
              <FormField
                control={form.control}
                name="reporter_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reporter Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reporter Email */}
              <FormField
                control={form.control}
                name="reporter_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reporter Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Regulatory Reporting */}
            <FormField
              control={form.control}
              name="regulatory_reporting_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Regulatory Reporting Required
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check if this incident requires reporting to regulatory authorities
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Work Order Planning Section */}
            <div className="border rounded-lg p-4 bg-muted/30 mt-6">
              <FormField
                control={form.control}
                name="requires_work_order"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        This incident requires maintenance work
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Check this to provide work order details
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Collapsible open={form.watch("requires_work_order")} className="mt-4">
                <CollapsibleContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Maintenance Type */}
                    <FormField
                      control={form.control}
                      name="wo_maintenance_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintenance Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="corrective">Corrective</SelectItem>
                              <SelectItem value="preventive">Preventive</SelectItem>
                              <SelectItem value="predictive">Predictive</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Work Order Priority */}
                    <FormField
                      control={form.control}
                      name="wo_priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Target Start Date */}
                    <FormField
                      control={form.control}
                      name="wo_target_start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Target Finish Date */}
                    <FormField
                      control={form.control}
                      name="wo_target_finish_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Finish Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Estimated Duration */}
                    <FormField
                      control={form.control}
                      name="wo_estimated_duration_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Duration (hours)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Estimated Cost */}
                    <FormField
                      control={form.control}
                      name="wo_estimated_cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Cost (RM)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Assigned Technician */}
                  <FormField
                    control={form.control}
                    name="wo_assigned_technician"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Technician</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of assigned technician" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Work Order Notes */}
                  <FormField
                    control={form.control}
                    name="wo_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Order Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes for the work order..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
