import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, FileText, Calendar, User, MapPin, Mail, Package, ExternalLink, Save, X, Wrench } from "lucide-react";
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
import { toast } from "sonner";
import { useJobPlans } from "@/hooks/useJobPlans";
import { formatPriorityAssessment, getPriorityVariant, calculateTotalEstimate } from "@/lib/incidentUtils";

// Form validation schema
const incidentSchema = z.object({
  incident_date: z.string().min(1, "Incident date is required"),
  location: z.string().min(1, "Location is required"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  reporter_name: z.string().min(1, "Reporter name is required"),
  reporter_email: z.string().email("Invalid email").optional().or(z.literal("")),
  root_cause: z.string().optional(),
  corrective_actions: z.string().optional(),
  regulatory_reporting_required: z.boolean().default(false),
  // Engineering Assessment Fields
  immediate_actions: z.string().optional(),
  suggested_job_plan_id: z.string().uuid().optional(),
  estimated_repair_hours: z.coerce.number().min(0).optional(),
  priority_assessment: z.enum(['can_wait', 'should_schedule', 'urgent', 'critical']).optional(),
  estimated_material_cost: z.coerce.number().min(0).optional(),
  estimated_labor_cost: z.coerce.number().min(0).optional(),
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
  const { data: jobPlans = [] } = useJobPlans();
  const canEdit = useCanEditIncident(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const incident = incidents?.find((inc) => inc.id === id);
  const jobPlan = jobPlans.find(plan => plan.id === incident?.suggested_job_plan_id);

  // Initialize form with incident data
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      incident_date: incident?.incident_date ? incident.incident_date.slice(0, 16) : "",
      location: incident?.location || "",
      severity: incident?.severity || "medium",
      title: incident?.title || "",
      description: incident?.description || "",
      reporter_name: incident?.reporter_name || "",
      reporter_email: incident?.reporter_email || "",
      root_cause: incident?.root_cause || "",
      corrective_actions: incident?.corrective_actions || "",
      regulatory_reporting_required: incident?.regulatory_reporting_required || false,
      immediate_actions: incident?.immediate_actions || "",
      suggested_job_plan_id: incident?.suggested_job_plan_id || "",
      estimated_repair_hours: incident?.estimated_repair_hours || undefined,
      priority_assessment: incident?.priority_assessment || undefined,
      estimated_material_cost: incident?.estimated_material_cost || undefined,
      estimated_labor_cost: incident?.estimated_labor_cost || undefined,
    },
  });

  // Reset form when incident data loads
  useEffect(() => {
    if (incident) {
      form.reset({
        incident_date: incident.incident_date ? incident.incident_date.slice(0, 16) : "",
        location: incident.location || "",
        severity: incident.severity || "medium",
        title: incident.title || "",
        description: incident.description || "",
        reporter_name: incident.reporter_name || "",
        reporter_email: incident.reporter_email || "",
        root_cause: incident.root_cause || "",
        corrective_actions: incident.corrective_actions || "",
        regulatory_reporting_required: incident.regulatory_reporting_required || false,
        immediate_actions: incident.immediate_actions || "",
        suggested_job_plan_id: incident.suggested_job_plan_id || "",
        estimated_repair_hours: incident.estimated_repair_hours || undefined,
        priority_assessment: incident.priority_assessment || undefined,
        estimated_material_cost: incident.estimated_material_cost || undefined,
        estimated_labor_cost: incident.estimated_labor_cost || undefined,
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
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Regulatory Reporting
                  </label>
                  <div className="mt-1">
                    {incident.regulatory_reporting_required ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" />
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        Not Required
                      </Badge>
                    )}
                  </div>
                </div>
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

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Root Cause Analysis
                  </label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {incident.root_cause || <span className="text-muted-foreground italic">Not provided</span>}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Corrective Actions
                  </label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {incident.corrective_actions || <span className="text-muted-foreground italic">Not provided</span>}
                  </p>
                </div>
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

          {/* Engineering Assessment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Engineering Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing ? (
                <>
                  {/* Immediate Actions */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Immediate Actions Taken
                    </label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {incident.immediate_actions || 
                        <span className="text-muted-foreground italic">Not documented</span>
                      }
                    </p>
                  </div>

                  {/* Suggested Job Plan */}
                  {incident.suggested_job_plan_id && jobPlan && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Suggested Job Plan
                      </label>
                      <div className="mt-1">
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <FileText className="w-3 h-3" />
                          {jobPlan.job_plan_number} - {jobPlan.title}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Priority Assessment */}
                  {incident.priority_assessment && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Business Impact Assessment
                      </label>
                      <div className="mt-1">
                        <Badge variant={getPriorityVariant(incident.priority_assessment)}>
                          {formatPriorityAssessment(incident.priority_assessment)}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Estimates Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Est. Repair Hours
                      </label>
                      <p className="text-sm mt-1">
                        {incident.estimated_repair_hours ? 
                          `${incident.estimated_repair_hours}h` : 
                          <span className="text-muted-foreground italic">Not estimated</span>
                        }
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Est. Material Cost
                      </label>
                      <p className="text-sm mt-1">
                        {incident.estimated_material_cost ? 
                          `RM ${incident.estimated_material_cost.toFixed(2)}` :
                          <span className="text-muted-foreground italic">Not estimated</span>
                        }
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Est. Labor Cost
                      </label>
                      <p className="text-sm mt-1">
                        {incident.estimated_labor_cost ? 
                          `RM ${incident.estimated_labor_cost.toFixed(2)}` :
                          <span className="text-muted-foreground italic">Not estimated</span>
                        }
                      </p>
                    </div>
                  </div>

                  {/* Total Estimate */}
                  {(incident.estimated_material_cost || incident.estimated_labor_cost) && (
                    <div className="pt-2 border-t">
                      <label className="text-sm font-medium text-muted-foreground">
                        Total Estimated Cost
                      </label>
                      <p className="text-lg font-semibold mt-1">
                        RM {calculateTotalEstimate(
                          incident.estimated_material_cost, 
                          incident.estimated_labor_cost
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <Form {...form}>
                  <div className="space-y-4">
                    {/* Immediate Actions - Edit */}
                    <FormField
                      control={form.control}
                      name="immediate_actions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Immediate Actions Taken</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Document any emergency actions taken..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Suggested Job Plan - Edit */}
                    <FormField
                      control={form.control}
                      name="suggested_job_plan_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suggested Job Plan</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a standard job plan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background">
                              {jobPlans.filter(p => p.status === 'active').map(plan => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.job_plan_number} - {plan.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Priority Assessment - Edit */}
                    <FormField
                      control={form.control}
                      name="priority_assessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Impact Assessment</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Assess business impact" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background">
                              <SelectItem value="can_wait">Can Wait - Schedule during maintenance</SelectItem>
                              <SelectItem value="should_schedule">Should Schedule - Plan within week</SelectItem>
                              <SelectItem value="urgent">Urgent - Address within 24-48h</SelectItem>
                              <SelectItem value="critical">Critical - Immediate action required</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Repair Hours - Edit */}
                    <FormField
                      control={form.control}
                      name="estimated_repair_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Repair Duration (Hours)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="e.g., 4.5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Cost Estimates - Edit */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="estimated_material_cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Est. Material Cost (RM)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estimated_labor_cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Est. Labor Cost (RM)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
