import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobPlanFormContent } from "@/components/job-plans/JobPlanFormContent";

/**
 * Create Job Plan Page
 * Full-page form for creating a new job plan with all required details,
 * tasks, parts, and tools.
 */
export default function CreateJobPlanPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/job-plans")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Job Plan</h1>
          <p className="text-muted-foreground">
            Define a reusable job plan with tasks, parts, and tools
          </p>
        </div>
      </div>

      {/* Job Plan Form */}
      <JobPlanFormContent mode="create" onSuccess={() => navigate("/job-plans")} />
    </div>
  );
}
