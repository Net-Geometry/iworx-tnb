import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, FileText, Calendar, User, MapPin, Mail, Package, Wrench, ExternalLink, Pencil } from "lucide-react";
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

/**
 * IncidentDetailPage Component
 * 
 * Full-page view for incident details with workflow management.
 * Displays incident information, workflow progress, role-based action buttons,
 * and complete approval history.
 */
const IncidentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { incidents, loading } = useIncidents();
  const { approvals } = useIncidentWorkflow(id);
  const { assets } = useAssets();
  const canEdit = useCanEditIncident(id);

  const incident = incidents?.find((inc) => inc.id === id);

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
          {canEdit && (
            <Button 
              onClick={() => navigate(`/safety/incidents/${id}/edit`)}
              variant="outline"
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Incident
            </Button>
          )}
          <Badge variant="outline" className="capitalize">
            {incident.status}
          </Badge>
        </div>
      </div>

      {/* Workflow Progress */}
      <IncidentWorkflowProgress incidentId={id!} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Incident Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Incident Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Work Order Planning Details */}
          {incident.wo_maintenance_type && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5" />
                  <span>Work Order Planning</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                      <p className="text-sm">{format(new Date(incident.wo_target_start_date), "PPP")}</p>
                    </div>
                  )}
                </div>
                {incident.wo_notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <label className="text-sm font-medium text-muted-foreground">Work Instructions</label>
                    <p className="text-sm mt-1">{incident.wo_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
