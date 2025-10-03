import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, FileText, Calendar, User, MapPin } from "lucide-react";
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
        <Badge variant="outline" className="capitalize">
          {incident.status}
        </Badge>
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
                  </div>
                </div>
                {incident.location && (
                  <div className="flex items-center space-x-2 col-span-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Location
                      </label>
                      <p className="text-sm">{incident.location}</p>
                    </div>
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
            </CardContent>
          </Card>

          {/* Attachments - Placeholder for future implementation */}
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
