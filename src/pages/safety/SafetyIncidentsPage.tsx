import { Plus, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIncidents } from "@/hooks/useIncidents";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkflowSteps } from "@/hooks/useWorkflowSteps";
import { WorkflowProgressTracker } from "@/components/workflow/WorkflowProgressTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SafetyIncidentsPage = () => {
  const navigate = useNavigate();
  const { incidents, stats, loading } = useIncidents();
  const { data: workflowSteps = [] } = useWorkflowSteps("safety_incidents");

  const handleViewDetails = (incident: any) => {
    // TODO: Implement incident details modal/page
    console.log("View incident details:", incident);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Safety Incidents</h1>
            <p className="text-muted-foreground">Report and track safety incidents</p>
          </div>
        </div>
        <Button onClick={() => navigate("/safety/incidents/report")}>
          <Plus className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">Requires immediate action</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Investigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.investigating}</div>
            <p className="text-xs text-muted-foreground">Active investigations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-success">{stats.resolvedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Overview */}
      {workflowSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Incident Workflow Process</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowProgressTracker 
              steps={workflowSteps} 
              currentState={null}
              className="py-4"
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              {workflowSteps.map((step) => (
                <div key={step.id} className="p-4 border rounded-lg bg-card">
                  <h4 className="font-medium text-sm mb-1">{step.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                      {step.required_role}
                    </span>
                    {step.sla_hours && (
                      <span className="text-xs text-muted-foreground">
                        SLA: {step.sla_hours}h
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentTable incidents={incidents} onViewDetails={handleViewDetails} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyIncidentsPage;