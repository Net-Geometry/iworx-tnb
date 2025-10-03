import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, FileText, Calendar, User, MapPin, Mail, Package, Wrench, ExternalLink, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useIncidents } from "@/hooks/useIncidents";
import { useIncidentWorkflow } from "@/hooks/useWorkflowState";
import { useAssets } from "@/hooks/useAssets";
import { useCanEditIncident } from "@/hooks/useCanEditIncident";
import { IncidentWorkflowProgress } from "@/components/incidents/IncidentWorkflowProgress";
import { IncidentWorkflowActions } from "@/components/incidents/IncidentWorkflowActions";
import { WorkflowHistory } from "@/components/workflow/WorkflowHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
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
import { toast } from "sonner";

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
  cost_estimate: z.coerce.number().optional(),
  regulatory_reporting_required: z.boolean().default(false),
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

/**
 * IncidentDetailPage Component
 * 
 * Full-page view for incident details with inline editing support.
 * Displays incident information, workflow progress, role-based action buttons,
 * and complete approval history.
 */
const IncidentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { incidents, loading, updateIncident, refetch } = useIncidents();
  const { approvals } = useIncidentWorkflow(id);
  const { assets } = useAssets();
  const canEdit = useCanEditIncident(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const incident = incidents?.find((inc) => inc.id === id);

  // Initialize form with incident data
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
      cost_estimate: incident?.cost_estimate || undefined,
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

  // Reset form when incident data loads
  useEffect(() => {
    if (incident) {
      form.reset({
        incident_date: incident.incident_date || "",
        location: incident.location || "",
        severity: incident.severity || "medium",
        title: incident.title || "",
        description: incident.description || "",
        reporter_name: incident.reporter_name || "",
        reporter_email: incident.reporter_email || "",
        immediate_actions: incident.immediate_actions || "",
        root_cause: incident.root_cause || "",
        corrective_actions: incident.corrective_actions || "",
        cost_estimate: incident.cost_estimate || undefined,
        regulatory_reporting_required: incident.regulatory_reporting_required || false,
        requires_work_order: !!incident.wo_maintenance_type,
        wo_maintenance_type: incident.wo_maintenance_type || undefined,
        wo_priority: incident.wo_priority || undefined,
        wo_estimated_duration_hours: incident.wo_estimated_duration_hours || undefined,
        wo_assigned_technician: incident.wo_assigned_technician || "",
        wo_estimated_cost: incident.wo_estimated_cost || undefined,
        wo_target_start_date: incident.wo_target_start_date || "",
        wo_target_finish_date: incident.wo_target_finish_date || "",
        wo_notes: incident.wo_notes || "",
      });
    }
  }, [incident, form]);

  // Save handler
  const handleSave = async (data: IncidentFormValues) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await updateIncident(id, data);
      await refetch();
      setIsEditing(false);
      toast.success("Incident updated successfully");
    } catch (error) {
      toast.error("Failed to update incident");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Incident Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The incident you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate("/safety/incidents")}>
              Back to Incidents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const severityColors: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/safety">Safety</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/safety/incidents">Incidents</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>INC-{incident.incident_number}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/safety/incidents")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${severityColors[incident.severity] || 'bg-gray-500'} rounded-xl flex items-center justify-center`}>
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Incident #{incident.incident_number}
              </h1>
              <p className="text-muted-foreground">
                {incident.title}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              {canEdit && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Edit Incident
                </Button>
              )}
              <Badge variant="outline" className="capitalize">
                {incident.status}
              </Badge>
            </>
          ) : (
            <>
              <Button 
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button 
                onClick={form.handleSubmit(handleSave)}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Workflow Progress */}
      <IncidentWorkflowProgress incidentId={id!} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Incident Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className={isEditing ? "bg-accent/10" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Incident Details</span>
                </div>
                {isEditing && (
                  <Badge variant="secondary">Editing Mode</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing ? (
                // View Mode
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Incident Date
                      </label>
                      <p className="text-sm">
                        {format(new Date(incident.incident_date), "PPP")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Severity
                      </label>
                      <Badge className={`${severityColors[incident.severity]} text-white capitalize`}>
                        {incident.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Created At
                        </label>
                        <p className="text-sm">
                          {format(new Date(incident.created_at), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Reported By
                        </label>
                        <p className="text-sm">{incident.reporter_name}</p>
                        {incident.reporter_email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {incident.reporter_email}
                          </p>
                        )}
                      </div>
                    </div>
                    {incident.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Location
                          </label>
                          <p className="text-sm">{incident.location}</p>
                        </div>
                      </div>
                    )}
                    {incident.asset_id && (
                      <div className="flex items-center space-x-2 col-span-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Asset Involved
                          </label>
                          <p className="text-sm">
                            {assets.find(a => a.id === incident.asset_id)?.name || "Loading..."}
                          </p>
                        </div>
                      </div>
                    )}
                    {incident.regulatory_reporting_required && (
                      <div className="col-span-2">
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Regulatory Reporting Required
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Title
                    </label>
                    <p className="text-sm mt-1">
                      {incident.title}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Description
                    </label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {incident.description}
                    </p>
                  </div>

                  {incident.root_cause && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Root Cause Analysis
                      </label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {incident.root_cause}
                      </p>
                    </div>
                  )}

                  {incident.corrective_actions && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Corrective Actions
                      </label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {incident.corrective_actions}
                      </p>
                    </div>
                  )}

                  {incident.cost_estimate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Estimated Cost
                      </label>
                      <p className="text-sm">${incident.cost_estimate.toLocaleString()}</p>
                    </div>
                  )}

                  {incident.immediate_actions && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Immediate Actions Taken
                      </label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {incident.immediate_actions}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // Edit Mode
                <Form {...form}>
                  <div className="space-y-4">
                    {/* Read-only fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Incident Number
                        </label>
                        <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
                          {incident.incident_number}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Created At
                        </label>
                        <p className="text-sm bg-muted px-3 py-2 rounded-md">
                          {format(new Date(incident.created_at), "PPP")}
                        </p>
                      </div>
                    </div>

                    {/* Editable fields */}
                    <div className="grid grid-cols-2 gap-4">
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

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detailed Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide a detailed description..."
                              className="min-h-[100px]"
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

                    <FormField
                      control={form.control}
                      name="immediate_actions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Immediate Actions Taken</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe immediate actions..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="root_cause"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Root Cause Analysis</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe the root cause..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="corrective_actions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Corrective Actions</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe corrective actions..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cost_estimate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Cost</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                  </div>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* Work Order Planning Details */}
          <Card className={isEditing ? "bg-accent/10" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="w-5 h-5" />
                <span>Work Order Planning</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                // View Mode - Only show if WO exists
                incident.wo_maintenance_type ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Maintenance Type</label>
                        <p className="text-sm capitalize">{incident.wo_maintenance_type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Priority</label>
                        <Badge variant={incident.wo_priority === "critical" ? "destructive" : "default"} className="capitalize">
                          {incident.wo_priority}
                        </Badge>
                      </div>
                      {incident.wo_estimated_duration_hours && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Est. Duration</label>
                          <p className="text-sm">{incident.wo_estimated_duration_hours} hours</p>
                        </div>
                      )}
                      {incident.wo_assigned_technician && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                          <p className="text-sm">{incident.wo_assigned_technician}</p>
                        </div>
                      )}
                      {incident.wo_estimated_cost && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Est. Cost</label>
                          <p className="text-sm">${incident.wo_estimated_cost.toFixed(2)}</p>
                        </div>
                      )}
                      {incident.wo_target_start_date && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Target Start</label>
                          <p className="text-sm">{format(new Date(incident.wo_target_start_date), "PPp")}</p>
                        </div>
                      )}
                      {incident.wo_target_finish_date && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Target Finish</label>
                          <p className="text-sm">{format(new Date(incident.wo_target_finish_date), "PPp")}</p>
                        </div>
                      )}
                    </div>
                    {incident.wo_notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <label className="text-sm font-medium text-muted-foreground">Work Instructions</label>
                        <p className="text-sm mt-1">{incident.wo_notes}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No work order planning required</p>
                )
              ) : (
                // Edit Mode
                <Form {...form}>
                  <div className="space-y-4">
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
                            <FormLabel className="text-base font-semibold">
                              This incident requires maintenance work
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Check this to provide work order details
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Collapsible open={form.watch("requires_work_order")}>
                      <CollapsibleContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
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

                          <FormField
                            control={form.control}
                            name="wo_estimated_duration_hours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimated Duration (hours)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="wo_assigned_technician"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Assigned Technician</FormLabel>
                                <FormControl>
                                  <Input placeholder="Technician name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="wo_estimated_cost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimated Cost</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="wo_target_start_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Start Date & Time</FormLabel>
                                <FormControl>
                                  <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="wo_target_finish_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Finish Date & Time</FormLabel>
                                <FormControl>
                                  <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="wo_notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Work Instructions</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Additional work order notes..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* Evidence & Attachments */}
          {incident.attachments && incident.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Evidence & Attachments ({incident.attachments.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {incident.attachments.map((file: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-muted/50 transition">
                      <FileText className="w-10 h-10 mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Workflow Actions and History */}
        <div className="space-y-6">
          {/* Workflow Actions */}
          <IncidentWorkflowActions incidentId={id!} />

          {/* Workflow History */}
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowHistory approvals={approvals} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailPage;
