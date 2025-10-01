import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Clock, User, Calendar, DollarSign, Package, Wrench, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobPlan } from "@/hooks/useJobPlans";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveTaskList } from "@/components/job-plans/InteractiveTaskList";
import { InteractivePartsList } from "@/components/job-plans/InteractivePartsList";
import { InteractiveToolsList } from "@/components/job-plans/InteractiveToolsList";
import { JobPlanOverviewEdit } from "@/components/job-plans/JobPlanOverviewEdit";

/**
 * Job Plan Detail Page
 * Displays comprehensive details of a single job plan including tasks, parts, tools, and metadata.
 * Provides navigation to edit mode and back to the job plans list.
 */
export default function JobPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const { data: jobPlan, isLoading } = useJobPlan(id!);

  // Helper function to get status badge styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'draft':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'under_review':
        return 'bg-info/10 text-info border-info/20';
      case 'archived':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Helper function to get job type badge styling
  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'preventive':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'corrective':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'predictive':
        return 'bg-info/10 text-info border-info/20';
      case 'emergency':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'shutdown':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!jobPlan) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Job plan not found</p>
            <Button onClick={() => navigate("/job-plans")} className="mt-4">
              Back to Job Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with navigation and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/job-plans")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{jobPlan.title}</h1>
            <p className="text-muted-foreground">{jobPlan.job_plan_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(jobPlan.status)}>
            {jobPlan.status?.replace('_', ' ')}
          </Badge>
          <Badge className={getJobTypeColor(jobPlan.job_type)}>
            {jobPlan.job_type}
          </Badge>
          {activeTab === "overview" && !isEditingOverview && (
            <Button onClick={() => setIsEditingOverview(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Plan
            </Button>
          )}
        </div>
      </div>

      {/* Overview Card */}
      {isEditingOverview ? (
        <JobPlanOverviewEdit
          jobPlan={jobPlan}
          onCancel={() => setIsEditingOverview(false)}
          onSaveSuccess={() => setIsEditingOverview(false)}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{jobPlan.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {jobPlan.estimated_duration_hours ? `${jobPlan.estimated_duration_hours}h` : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Skill Level</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {jobPlan.skill_level_required}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Frequency</p>
                  <p className="text-sm text-muted-foreground">
                    {jobPlan.frequency_interval} {jobPlan.frequency_type?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Est. Cost</p>
                  <p className="text-sm text-muted-foreground">
                    {jobPlan.cost_estimate ? `$${jobPlan.cost_estimate}` : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {jobPlan.applicable_asset_types && jobPlan.applicable_asset_types.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Applicable Asset Types:</p>
                <div className="flex flex-wrap gap-2">
                  {jobPlan.applicable_asset_types.map((type, index) => (
                    <Badge key={index} variant="outline">{type}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks" className="gap-2">
            <FileText className="w-4 h-4" />
            Tasks ({jobPlan.tasks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="parts" className="gap-2">
            <Package className="w-4 h-4" />
            Parts ({jobPlan.parts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-2">
            <Wrench className="w-4 h-4" />
            Tools ({jobPlan.tools?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4 mt-6">
          <InteractiveTaskList 
            tasks={jobPlan.tasks?.sort((a, b) => a.task_sequence - b.task_sequence) || []}
            jobPlanId={jobPlan.id}
            organizationId={jobPlan.organization_id}
          />
        </TabsContent>

        {/* Parts Tab */}
        <TabsContent value="parts" className="space-y-4 mt-6">
          <InteractivePartsList
            parts={jobPlan.parts || []}
            jobPlanId={jobPlan.id}
            organizationId={jobPlan.organization_id}
          />
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-4 mt-6">
          <InteractiveToolsList
            tools={jobPlan.tools || []}
            jobPlanId={jobPlan.id}
            organizationId={jobPlan.organization_id}
          />
        </TabsContent>
      </Tabs>

      {/* Meta Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Version:</span> {jobPlan.version}
            </div>
            <div>
              <span className="font-medium">Usage Count:</span> {jobPlan.usage_count || 0}
            </div>
            <div>
              <span className="font-medium">Created:</span>{" "}
              {jobPlan.created_at ? new Date(jobPlan.created_at).toLocaleDateString() : "N/A"}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {jobPlan.updated_at ? new Date(jobPlan.updated_at).toLocaleDateString() : "N/A"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
