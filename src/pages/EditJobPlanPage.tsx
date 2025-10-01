import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { JobPlanFormContent } from "@/components/job-plans/JobPlanFormContent";
import { useJobPlan } from "@/hooks/useJobPlans";

/**
 * Edit Job Plan Page
 * Full-page form for editing an existing job plan with all its details,
 * tasks, parts, and tools.
 */
export default function EditJobPlanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: jobPlan, isLoading } = useJobPlan(id!);

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
      {/* Header with back navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/job-plans/${id}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Job Plan</h1>
          <p className="text-muted-foreground">{jobPlan.job_plan_number}</p>
        </div>
      </div>

      {/* Job Plan Form */}
      <JobPlanFormContent 
        mode="edit" 
        jobPlan={jobPlan} 
        onSuccess={() => navigate(`/job-plans/${id}`)} 
      />
    </div>
  );
}
